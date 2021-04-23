from utilities import api_timeout, concise, header_defaults, header_description, header_image, header_title
from aiohttp import ClientTimeout, request as request_async
from kh_common.config.constants import users_host
from kh_common.logging import getLogger
from re import compile as re_compile
from html import escape


user_regex = re_compile(r'^\/([^\/]+)$')
logger = getLogger()


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


async def userHeaders(match) :
	data = await fetchUserData(match[1])

	if not data :
		return None

	if data['name'] :
		title = f'{data["name"]} (@{data["handle"]}) - kheina.com'

	else :
		title = f'@{data["handle"]} - kheina.com'

	return ''.join([
		header_title.format(escape(title)),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/{data["icon"]}/thumbnails/1200.webp') if data['media_type'] else '',
		header_description.format(escape(concise(data['description']))) if data['description'] else '',
		header_defaults,
	])
