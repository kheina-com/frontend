from datetime import datetime
from html import escape
from typing import Optional

from aiohttp import ClientResponseError, ClientTimeout, request
from pydantic import BaseModel
from utilities.constants import host

from utilities import api_timeout, concise, demarkdown, header_card_summary, header_description, header_image, header_title

from .models import Post, Privacy, UserPortable
from .post import thumbnail_url


class set(BaseModel) :
	set_id: str
	owner: UserPortable
	count: int
	title: Optional[str]
	description: Optional[str]
	privacy: Privacy
	created: datetime
	updated: datetime
	first: Optional[Post]
	last: Optional[Post]


async def setMetaTags(set_id: str) -> str :
	s: set

	try :
		async with request(
			'GET',
			f'{host}/v1/set/{set_id}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			s = set.parse_obj(await response.json())

	except ClientResponseError :
		return ''

	title: str = 'set: '

	if s.title :
		title += escape(demarkdown(s.title))

	else :
		title += s.set_id

	title += ' by '

	if s.owner.name :
		title += f'{escape(demarkdown(s.owner.name))} (@{s.owner.handle})'

	else :
		f'@{s.owner.handle}'

	title += ' | fuzz.ly'

	headers: list[str] = [
		header_title.format(title),
		header_description.format(escape(concise(s.description))) if s.description else '',
		header_card_summary,
	]

	if s.first and (thumbnail := thumbnail_url(s.first)) :
		headers.append(header_image.format(thumbnail))

	else :
		headers.append(header_image.format(f'https://cdn.fuzz.ly/{s.owner.icon}/icons/{s.owner.handle}.jpg'))

	return ''.join(headers)
