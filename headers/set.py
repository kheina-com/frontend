from datetime import datetime
from html import escape
from typing import Optional

from aiohttp import ClientResponseError, ClientTimeout, request
from pydantic import BaseModel

from .models import Post, Privacy, UserPortable
from utilities import api_timeout, concise, demarkdown, header_card_summary, header_description, header_image, header_title
from utilities.constants import host


class Set(BaseModel) :
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
	s: Set

	try :
		async with request(
			'GET',
			f'{host}/v1/set/{set_id}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			s = Set.parse_obj(await response.json())

	except ClientResponseError as e :
		if e.status == 404 :
			return ''

		else :
			raise

	title: str = 'Set: '

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

	# TODO: once first/last are populated, make this header card large and send the first post thumbnail

	return ''.join([
		header_title.format(title),
		header_image.format(f'https://cdn.fuzz.ly/{s.owner.icon}/icons/{s.owner.handle}.jpg'),
		header_description.format(escape(concise(s.description))) if s.description else '',
		header_card_summary,
	])
