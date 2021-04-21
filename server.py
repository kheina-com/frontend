from kh_common.exceptions.http_error import NotFound
from aiohttp import ClientResponse, ClientTimeout, request as request_async
# from kh_common.config.constants import posts_host, users_host
from fastapi.responses import FileResponse, HTMLResponse
from kh_common.caching import ArgsCache, SimpleCache
from kh_common.logging import getLogger
from kh_common.server import ServerApp
from re import compile as re_compile
from asyncio import ensure_future
from html import escape
from os import path


app = ServerApp(auth=False)
api_timeout = 5
logger = getLogger()

concise_regex = re_compile(r'(.+(?:[\n\r]+.+){0,2})([\s\S]+)?')
description_limit = 300

markdown_regex = re_compile('|'.join([
	r'\[.+\]\((.+)\)',
	r'#{1,6} ',
	r'`+',
]))

post_uri_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})$')
user_uri_regex = re_compile(r'^\/([^\/]+)$')

header_title = '<meta property="og:title" content="{0}"><meta property="twitter:title" content="{0}">'
header_image = '<meta property="og:image" content="{0}"><meta property="twitter:image" content="{0}">'
header_description = '<meta name="description" property="og:description" content="{0}"><meta property="twitter:description" content="{0}">'
header_defaults = '<meta property="twitter:site" content="@kheinacom"><meta property="twitter:card" content="summary_large_image">'


async def fetchUserData(handle) :
	try :
		async with request_async(
			'get',
			f'{users_host}/v1/fetch_user/{handle}',
			timeout=ClientTimeout(api_timeout),
		) as response :
			if response.ok :
				return await response.json()

			else :
				logger.error({
					'message': 'error while fetching user data from frontend server.',
					'content': await response.read(),
					'status': response.status,
				})

	except Exception :
		logger.exception('error while fetching user data from frontend server.')


async def fetchPostData(post_id) :
	if len(post_id) != 8 :
		return None

	try :
		async with request_async(
			'get',
			f'{posts_host}/v1/post/{post_id}',
			timeout=ClientTimeout(api_timeout),
		) as response :
			if response.ok :
				return await response.json()

			else :
				logger.error({
					'message': 'error while fetching post data from frontend server.',
					'content': await response.read(),
					'status': response.status,
				})

	except Exception :
		logger.exception('error while fetching post data from frontend server.')


def firstGroupOrEmptyString(match) :
	try :
		return next(filter(None, match.groups()))

	except StopIteration :
		return None


def demarkdown(string) :
	return markdown_regex.sub(firstGroupOrEmptyString, string)


def concise(string: str) :
	match = concise_regex.match(demarkdown(string))

	if len(match[1]) > description_limit :
		description = match[1][:description_limit]
		cut = True

	elif match[2] :
		description = match[1]
		cut = True

	else :
		cut = False
		description = match[0]

	return description + ('...' if cut else '')


@ArgsCache(60)
async def matchHeaders(uri: str) :
	headers = None

	match = post_uri_regex.match(uri)

	if match :
		data = await fetchPostData(match[1])

		if not data :
			return None

		return ''.join([
			header_title.format(escape(data['title'] or match[1]) + ' by ' + escape(data['user']['name'] or data['user']['handle'])),
			header_image.format(f'https://cdn.kheina.com/file/kheina-content/{match[1]}/thumbnails/1200.jpeg') if data['media_type'] else '',
			header_description.format(escape(concise(data['description']))) if data['description'] else '',
			header_defaults,
		])

	match = user_uri_regex.match(uri)

	if match :
		data = await fetchUserData(match[1])

		if not data :
			return None

		if data['name'] :
			title = f'{data["name"]} (@{data["handle"]}) - kheina.com'

		else :
			title = f'@{data["handle"]} - kheina.com'

		return ''.join([
			header_title.format(escape(title)),
			header_image.format(f'https://cdn.kheina.com/file/kheina-content/{data["icon"]}/thumbnails/1200.jpeg') if data['media_type'] else '',
			header_description.format(escape(concise(data['description']))) if data['description'] else '',
			header_defaults,
		])

	return None


@SimpleCache(60)
def vueIndexHtml() :
	return open('dist/index.html').read()


@app.get('{uri:path}')
async def test(uri: str) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	headers = ensure_future(matchHeaders(uri))
	html = vueIndexHtml()
	headers = await headers

	if headers :
		html = html.replace('<head>', '<head>' + headers)

	return HTMLResponse(html)


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
