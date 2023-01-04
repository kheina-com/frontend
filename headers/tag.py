from html import escape
from re import compile as re_compile

from aiohttp import ClientResponseError, ClientTimeout
from aiohttp import request as request_async
from kh_common.config.constants import tags_host
from kh_common.gateway import Gateway
from kh_common.logging import getLogger

from headers.models import Tag
from utilities import api_timeout, concise, default_image, demarkdown, header_card_summary, header_description, header_image, header_title


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

	if tag.owner :
		return ''.join([
			header_title.format(f'{tag.tag}, {tag.group.name} tag from {escape(demarkdown(tag.owner.name))} (@{tag.owner.handle})' if tag.owner.name else f'{tag.tag}, {tag.group.name} tag from @{tag.owner.handle}'),
			header_image.format(f'https://cdn.fuzz.ly/{tag.owner.icon}/icons/{tag.owner.handle}.jpg'),
			header_description.format(escape(concise(tag.description))) if tag.description else '',
			header_card_summary,
		])

	else :
		return ''.join([
			header_title.format(f'{tag.tag}, {tag.group.name} tag'),
			default_image,
			header_description.format(escape(concise(tag.description))) if tag.description else '',
			header_card_summary,
		])
