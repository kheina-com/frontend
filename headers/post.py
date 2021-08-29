from utilities import api_timeout, concise, demarkdown, header_defaults, header_description, header_image, header_title
from kh_common.config.constants import posts_host, tags_host
from aiohttp import ClientTimeout, request as request_async
from kh_common.logging import getLogger
from re import compile as re_compile
from asyncio import ensure_future
from html import escape


post_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})$')
logger = getLogger()


async def fetchPostData(post_id) :
	if len(post_id) != 8 :
		return None

	try :
		async with request_async(
			'GET',
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


async def fetchTags(post_id) :
	if len(post_id) != 8 :
		return None

	try :
		async with request_async(
			'GET',
			f'{tags_host}/v1/fetch_tags/{post_id}',
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


async def postMetaTags(match) :
	tags = ensure_future(fetchTags(match[1]))
	data = await fetchPostData(match[1])

	if not data :
		return None

	title = escape(demarkdown(data['title'] or match[1])) + ' by ' + escape(demarkdown(data['user']['name'] or data['user']['handle']))
	tags = await tags

	if tags and tags.get('subject') :
		subjects = list(map(lambda x : x.split('_(subject)')[0], tags['subject']))

		if len(subjects) > 2 :
			title += ' featuring ' + ', '.join(subjects[:-1]) + ', and ' + subjects[-1]

		elif len(subjects) == 2 :
			title += ' featuring ' + ', '.join(subjects[:-1]) + ' and ' + subjects[-1]

		else :
			title += ' featuring ' + subjects[0]

	return ''.join([
		header_title.format(title),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/{match[1]}/thumbnails/1200.jpg') if data['media_type'] else '',
		header_description.format(escape(concise(data['description']))) if data['description'] else '',
		header_defaults,
	])
