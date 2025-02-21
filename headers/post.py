from html import escape
from random import randint
from re import compile as re_compile
from typing import Optional

from aiohttp import ClientResponseError, ClientTimeout, request
from utilities.constants import cdn_host, host

from utilities import api_timeout, concise, default_image, demarkdown, header_card_large, header_card_summary, header_description, header_image, header_title

from .models import Post, TagPortable


post_regex = re_compile(r'^\/p\/([a-zA-Z0-9_-]{8})\/?$')


def buildTagString(tags: list[TagPortable], tag_group: str) -> str :
	rendered: list[str] = []

	for t in tags :
		if t.owner :
			rendered.append(
				t.tag.split(f'_({tag_group})')[0].replace('_', ' ')
				+ f' (@{t.owner.handle})'
			)

		else :
			rendered.append(t.tag.split(f'_({tag_group})')[0].replace('_', ' '))

	tag_string: str = ''

	if len(rendered) > 2 :
		tag_string += ', '.join(rendered[:-1]) + ', and ' + rendered[-1]

	elif len(rendered) == 2 :
		tag_string += ', '.join(rendered[:-1]) + ' and ' + rendered[-1]

	else :
		tag_string += rendered[0]

	return tag_string


def thumbnail_url(post: Post) -> Optional[str] :
	if not post.media :
		return

	return filter(lambda x : x.type.file_type == 'jpeg', post.media.thumbnails).__next__().url


async def postMetaTags(post_id: str) -> str :
	if len(post_id) != 8:
		return ''

	post: Post

	try :
		async with request(
			'GET',
			f'{host}/v1/post/{post_id}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			post = Post.parse_obj(await response.json())

	except ClientResponseError :
		return ''

	assert isinstance(post, Post)

	title = escape(demarkdown(post.title)) if post.title else post_id

	if post.tags :
		if post.tags.artist :
			title += ' by ' + buildTagString(post.tags.artist, 'artist')

		if post.tags.subject :
			title += ' featuring ' + buildTagString(post.tags.subject, 'subject')

	headers: list[str] = [header_title.format(title + ' | fuzz.ly')]

	if post.description :
		headers.append(
			header_description.format(escape(demarkdown(concise(post.description))))
		)

	if thumbnail := thumbnail_url(post) :
		headers += [
			header_image.format(thumbnail),
			header_card_large,
		]

	elif post.user.icon :
		headers += [
			header_image.format(
				f'{cdn_host}/{post.user.icon}/icons/{post.user.handle}.jpg'
			),
			header_card_summary,
		]

	else :
		headers += [
			default_image,
			header_card_summary,
		]

	return ''.join(headers)
