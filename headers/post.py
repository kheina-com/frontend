from utilities import concise, demarkdown, header_card_large, header_description, header_image, header_title
from kh_common.config.constants import posts_host, tags_host
from headers.models import Post, TagGroups
from kh_common.logging import getLogger
from aiohttp import ClientResponseError
from kh_common.gateway import Gateway
from re import compile as re_compile
from asyncio import ensure_future
from html import escape


PostsService = Gateway(posts_host + '/v1/post/{post_id}', Post)
TagsService = Gateway(tags_host + '/v1/fetch_tags/{post_id}', TagGroups)
post_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})\/?$')
logger = getLogger()


async def postMetaTags(match) :
	post_id = match[1]
	post = tags = title = None

	if len(post_id) != 8 :
		return None

	try :
		tags = ensure_future(TagsService(post_id=post_id))
		post = await PostsService(post_id=post_id)

		title = (escape(demarkdown(post.title)) if post.title else post_id) + ' by ' + escape(demarkdown(post.user.name or post.user.handle))

		tags = await tags

	except ClientResponseError as e :
		if e.status == 404 :
			return None

		else :
			raise

	if tags.subject :
		subjects = list(map(lambda x : x.split('_(subject)')[0], tags.subject))

		if len(subjects) > 2 :
			title += ' featuring ' + ', '.join(subjects[:-1]) + ', and ' + subjects[-1]

		elif len(subjects) == 2 :
			title += ' featuring ' + ', '.join(subjects[:-1]) + ' and ' + subjects[-1]

		elif tags.subject[0] not in { post.user.handle.lower(), f'{post.user.handle.lower()}_(subject)' } :
			title += ' featuring ' + subjects[0]

	return ''.join([
		header_title.format(title),
		header_image.format(f'https://cdn.kheina.com/file/kheina-content/{post_id}/thumbnails/1200.jpg') if post.media_type else '',
		header_description.format(escape(concise(post.description))) if post.description else '',
		header_card_large,
	])
