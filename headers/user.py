from datetime import datetime
from html import escape
from re import Match
from re import compile as re_compile
from typing import Optional

from aiohttp import ClientResponseError, ClientTimeout, request
from pydantic import BaseModel
from utilities.constants import cdn_host, host

from utilities import api_timeout, concise, default_image, demarkdown, header_card_summary, header_description, header_image, header_title

from .models import Privacy, Verified


user_regex = re_compile(r'^\/([^\/]+)\/?$')


class Badge(BaseModel) :
	emoji: str
	label: str


class User(BaseModel) :
	name: str
	handle: str
	privacy: Privacy
	icon: Optional[str]
	banner: Optional[str]
	website: Optional[str]
	created: datetime
	description: Optional[str]
	verified: Optional[Verified]
	following: Optional[bool]
	badges: list[Badge]


async def userMetaTags(uri: str) -> str :
	match: Optional[Match[str]] = user_regex.match(uri)
	if not match :
		return ''

	user: User

	try :
		async with request(
			'GET',
			f'{host}/v1/user/{match[1]}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			user = User.parse_obj(await response.json())

	except ClientResponseError :
		return ''

	if user.name :
		title = f'{escape(demarkdown(user.name))} (@{user.handle}) | fuzz.ly'

	else :
		title = f'@{user.handle} | fuzz.ly'

	return ''.join([
		header_title.format(escape(title)),
		header_image.format(f'{cdn_host}/{user.icon}/icons/{user.handle.lower()}.jpg') if user.icon else default_image,
		header_description.format(escape(concise(user.description))) if user.description and user.description.strip() else '',
		header_card_summary,
	])
