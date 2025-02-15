from html import escape
from re import compile as re_compile

from aiohttp import ClientResponseError, ClientTimeout, request
from utilities.constants import cdn_host, host

from utilities import api_timeout, concise, default_image, demarkdown, header_card_summary, header_description, header_image, header_title

from .models import Tag


tag_regex = re_compile(r'^\/t\/([^\/]+)$')


async def tagMetaTags(t: str) -> str :
	tag: Tag

	try :
		async with request(
			'GET',
			f'{host}/v1/tag/{t}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			tag = Tag.parse_obj(await response.json())

	except ClientResponseError :
		return ''

	if tag.owner :
		return ''.join([
			header_title.format(f'{tag.tag}, {tag.group.name} tag from {escape(demarkdown(tag.owner.name))} (@{tag.owner.handle}) | fuzz.ly' if tag.owner.name else f'{tag.tag}, {tag.group.name} tag from @{tag.owner.handle} | fuzz.ly'),
			header_image.format(f'{cdn_host}/{tag.owner.icon}/icons/{tag.owner.handle}.jpg'),
			header_description.format(escape(concise(tag.description))) if tag.description else '',
			header_card_summary,
		])

	else :
		return ''.join([
			header_title.format(f'{tag.tag}, {tag.group.name} tag | fuzz.ly'),
			default_image,
			header_description.format(escape(concise(tag.description))) if tag.description else '',
			header_card_summary,
		])
