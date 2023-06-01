from html import escape

from aiohttp import ClientResponseError
from fuzzly import FuzzlyClient
from fuzzly.models.set import Set

from utilities import concise, demarkdown, header_card_summary, header_description, header_image, header_title


client: FuzzlyClient = FuzzlyClient()


async def setMetaTags(set_id: str) -> str :
	s: Set

	try :
		s = await client.set(set_id)

	except ClientResponseError as e :
		if e.status == 404 :
			return

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
