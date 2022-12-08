from asyncio import ensure_future
from html import escape
from re import compile as re_compile
from typing import List

from aiohttp import ClientResponseError
from kh_common.config.constants import posts_host, tags_host
from kh_common.gateway import Gateway
from kh_common.logging import getLogger

from headers.models import Post, TagGroups
from utilities import concise, default_image, demarkdown, header_card_large, header_card_summary, header_description, header_image, header_title


PostsService = Gateway(posts_host + '/v1/post/{post_id}', Post)
TagsService = Gateway(tags_host + '/v1/fetch_tags/{post_id}', TagGroups)
post_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})\/?$')
logger = getLogger()


async def postMetaTags(match) :
	post_id = match[1]
	post = tags = title = None

	if len(post_id) != 8 :
		return


	try :
		tags = ensure_future(TagsService(post_id=post_id))
		post = await PostsService(post_id=post_id)

		title = (escape(demarkdown(post.title)) if post.title else post_id)

		tags = await tags

	except ClientResponseError as e :
		if e.status == 404 :
			return

		else :
			raise


	if tags.artist :
		artists = list(map(lambda x : x.split('_(artist)')[0].replace('_', ' '), tags.artist))
		title += ' by '

		if len(artists) > 2 :
			title += ', '.join(artists[:-1]) + ', and ' + artists[-1]

		elif len(artists) == 2 :
			title += ', '.join(artists[:-1]) + ' and ' + artists[-1]

		else :
			title += artists[0]


	if tags.subject :
		subjects = list(map(lambda x : x.split('_(subject)')[0].replace('_', ' '), tags.subject))
		title += ' featuring '

		if len(subjects) > 2 :
			title += ', '.join(subjects[:-1]) + ', and ' + subjects[-1]

		elif len(subjects) == 2 :
			title += ', '.join(subjects[:-1]) + ' and ' + subjects[-1]

		else :
			title += subjects[0]


	headers: List[str] = [header_title.format(title)]


	if post.description :
		headers.append(header_description.format(escape(concise(post.description))))


	if post.media_type :
		headers += [
			header_image.format(f'https://cdn.kheina.com/file/kheina-content/{post_id}/thumbnails/1200.jpg'),
			header_card_large,
		]

	elif post.user.icon :
		headers += [
			header_image.format(f'https://cdn.kheina.com/file/kheina-content/{post.user.icon}/icons/{post.user.handle}.jpg'),
			header_card_summary,
		]

	else :
		headers += [
			default_image,
			header_card_summary,
		]


	return ''.join(headers)
