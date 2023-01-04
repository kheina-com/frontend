from asyncio import ensure_future, Task
from html import escape
from re import compile as re_compile
from typing import List

from aiohttp import ClientResponseError
from kh_common.config.constants import posts_host, tags_host
from kh_common.gateway import Gateway
from kh_common.logging import getLogger

from headers.models import Post, TagGroups, Tag
from utilities import concise, default_image, demarkdown, header_card_large, header_card_summary, header_description, header_image, header_title


PostsService = Gateway(posts_host + '/v1/post/{post_id}', Post)
TagsService = Gateway(tags_host + '/v1/fetch_tags/{post_id}', TagGroups)
FetchTag = Gateway(tags_host + '/v1/tag/{tag}', Tag)
post_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})\/?$')
logger = getLogger()


async def buildTagString(tags: List[str], tag_group: str) :
	rendered: List[str] = []

	try :
		rich_tags: List[Task[Tag]] = [ensure_future(FetchTag(tag=tag)) for tag in tags]

		for tag in rich_tags :
			tag: Tag = await tag

			if tag.owner :
				rendered.append(tag.tag.split(f'_({tag_group})')[0].replace('_', ' ') + f' (@{tag.owner.handle})')

			else :
				rendered.append(tag.tag.split(f'_({tag_group})')[0].replace('_', ' '))

	except ClientResponseError as e :
		if e.status == 404 :
			rendered = tags

		else :
			raise

	tag_string: str = ''

	if len(rendered) > 2 :
		tag_string += ', '.join(rendered[:-1]) + ', and ' + rendered[-1]

	elif len(rendered) == 2 :
		tag_string += ', '.join(rendered[:-1]) + ' and ' + rendered[-1]

	else :
		tag_string += rendered[0]

	return tag_string


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
		title += ' by ' + await buildTagString(tags.artist, 'artist')

	if tags.subject :
		title += ' featuring ' + await buildTagString(tags.subject, 'subject')

	headers: List[str] = [header_title.format(title)]

	if post.description :
		headers.append(header_description.format(escape(concise(post.description))))


	if post.media_type :
		headers += [
			header_image.format(f'https://cdn.fuzz.ly/{post_id}/thumbnails/1200.jpg'),
			header_card_large,
		]

	elif post.user.icon :
		headers += [
			header_image.format(f'https://cdn.fuzz.ly/{post.user.icon}/icons/{post.user.handle}.jpg'),
			header_card_summary,
		]

	else :
		headers += [
			default_image,
			header_card_summary,
		]


	return ''.join(headers)
