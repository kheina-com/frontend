from utilities import api_timeout, concise, default_image, header_card_summary, header_description, header_image, header_title
from aiohttp import ClientTimeout, request as request_async
from kh_common.config.constants import tags_host
from aiohttp import ClientResponseError
from kh_common.logging import getLogger
from kh_common.gateway import Gateway
from re import compile as re_compile
from headers.models import Tag
from html import escape


TagService: Gateway = Gateway(tags_host + '/v1/tag/{tag}', Tag)
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
	tag: Tag = None

	try :
		tag = await TagService(tag=match[1])

	except ClientResponseError as e :
		if e.status == 404 :
			return None

		else :
			raise

	return ''.join([
		header_title.format(f'{tag.tag}, {tag.group.name} tag'),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/{tag.owner.icon}/icons/{tag.owner.handle}.png') if tag.owner and tag.owner.icon else default_image,
		header_description.format(escape(concise(tag.description))) if tag.description else '',
		header_card_summary,
	])
