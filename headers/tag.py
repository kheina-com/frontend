from utilities import api_timeout, concise, header_defaults, header_description, header_image, header_title
from aiohttp import ClientTimeout, request as request_async
from kh_common.config.constants import tags_host
from kh_common.logging import getLogger
from re import compile as re_compile
from html import escape


tag_regex = re_compile(r'^\/t\/([^\/]+)$')
logger = getLogger()


async def fetchTagData(tag) :
	try :
		async with request_async(
			'get',
			f'{tags_host}/v1/tag/{tag}',
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


async def tagMetaTags(match) :
	data = await fetchTagData(match[1])

	if not data :
		return None

	return ''.join([
		header_title.format(f'{data["tag"]}, {data["class"]} tag'),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png'),
		header_description.format(escape(concise(data['description']))) if data['description'] else '',
		header_defaults,
	])
