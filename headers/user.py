from utilities import concise, default_image, demarkdown, header_card_summary, header_description, header_image, header_title
from kh_common.config.constants import users_host
from kh_common.logging import getLogger
from aiohttp import ClientResponseError
from kh_common.models.user import User
from kh_common.gateway import Gateway
from re import compile as re_compile
from html import escape


UsersService = Gateway(users_host + '/v1/fetch_user/{handle}', User)
user_regex = re_compile(r'^\/([^\/]+)\/?$')
logger = getLogger()


async def userMetaTags(match) :
	user = None

	try :
		user = await UsersService(handle=match[1])

	except ClientResponseError as e :
		if e.status == 404 :
			return None

		else :
			raise

	if user.name :
		title = f'{escape(demarkdown(user.name))} (@{user.handle}) | kheina.com'

	else :
		title = f'@{user.handle} | kheina.com'

	return ''.join([
		header_title.format(escape(title)),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/{user.icon}/icons/{user.handle.lower()}.jpg') if user.icon else default_image,
		header_description.format(escape(concise(user.description))) if user.description and user.description.strip() else '',
		header_card_summary,
	])
