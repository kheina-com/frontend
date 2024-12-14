from asyncio import Task, ensure_future
from html import escape
from re import compile as re_compile
from typing import Optional

from aiohttp import ClientResponseError, ClientTimeout, request
from pydantic import parse_obj_as
from utilities.constants import host

from utilities import api_timeout, concise, default_image, demarkdown, header_card_large, header_card_summary, header_description, header_image, header_title

from .models import Post, Tag, TagGroups, TagPortable


post_regex = re_compile(r"^\/p\/([a-zA-Z0-9_-]{8})\/?$")


async def buildTagString(tags: list[TagPortable], tag_group: str) -> str :
	rendered: list[str] = []

	for t in tags:
		if t.owner:
			rendered.append(
				t.tag.split(f"_({tag_group})")[0].replace("_", " ")
				+ f" (@{t.owner.handle})"
			)

		else:
			rendered.append(t.tag.split(f"_({tag_group})")[0].replace("_", " "))

	tag_string: str = ""

	if len(rendered) > 2:
		tag_string += ", ".join(rendered[:-1]) + ", and " + rendered[-1]

	elif len(rendered) == 2:
		tag_string += ", ".join(rendered[:-1]) + " and " + rendered[-1]

	else:
		tag_string += rendered[0]

	return tag_string


async def fetch_tags(post_id: str) -> TagGroups :
	try :
		async with request(
			'GET',
			f'{host}/v1/tags/{post_id}',
			timeout=ClientTimeout(api_timeout),
			raise_for_status=True,
		) as response :
			return parse_obj_as(TagGroups, await response.json())

	except ClientResponseError :
		return TagGroups() # type: ignore


async def postMetaTags(post_id: str) -> str :
	if len(post_id) != 8:
		return ''

	tag_task = ensure_future(fetch_tags(post_id))
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

	title = escape(demarkdown(post.title)) if post.title else post_id
	artist_title:  Optional[Task[str]] = None
	subject_title: Optional[Task[str]] = None
	tags = await tag_task

	if tags.artist:
		artist_title = ensure_future(buildTagString(tags.artist, "artist"))

	if tags.subject:
		subject_title = ensure_future(buildTagString(tags.subject, "subject"))

	if artist_title :
		title += " by " + await artist_title

	if subject_title :
		title += " featuring " + await subject_title

	headers: list[str] = [header_title.format(title + " | fuzz.ly")]

	if post.description:
		headers.append(
			header_description.format(escape(demarkdown(concise(post.description))))
		)

	if post.media:
		headers += [
			header_image.format(post.media.thumbnails['jpeg']),
			header_card_large,
		]

	elif post.user.icon:
		headers += [
			header_image.format(
				f"https://cdn.fuzz.ly/{post.user.icon}/icons/{post.user.handle}.jpg"
			),
			header_card_summary,
		]

	else:
		headers += [
			default_image,
			header_card_summary,
		]

	return "".join(headers)
