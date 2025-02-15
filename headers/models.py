from datetime import datetime
from enum import Enum, unique
from typing import Optional

from pydantic import BaseModel


@unique
class Privacy(Enum) :
	public      = 'public'
	unlisted    = 'unlisted'
	private     = 'private'
	unpublished = 'unpublished'
	draft       = 'draft'


@unique
class Verified(Enum) :
	artist = 'artist'
	mod    = 'mod'
	admin  = 'admin'


class UserPortable(BaseModel) :
	name:      str
	handle:    str
	privacy:   Privacy
	icon:      Optional[str]
	verified:  Optional[Verified]
	following: Optional[bool]


@unique
class TagGroup(Enum) :
	artist  = 'artist'
	subject = 'subject'
	sponsor = 'sponsor'
	species = 'species'
	gender  = 'gender'
	misc    = 'misc'


class TagPortable(BaseModel) :
	tag:   str
	owner: Optional[UserPortable]
	group: TagGroup
	count: int


class TagGroups(BaseModel) :
	artist:  Optional[list[TagPortable]]
	subject: Optional[list[TagPortable]]
	sponsor: Optional[list[TagPortable]]
	species: Optional[list[TagPortable]]
	gender:  Optional[list[TagPortable]]
	misc:    Optional[list[TagPortable]]


@unique
class Rating(Enum) :
	general  = 'general'
	mature   = 'mature'
	explicit = 'explicit'


class Score(BaseModel):
	up:        int
	down:      int
	total:     int
	vote:      Optional[int]
	user_vote: Optional[int]


class MediaType(BaseModel):
	file_type: str
	mime_type: str


class PostSize(BaseModel) :
	width:  int
	height: int


@unique
class MediaFlag(Enum) :
	animated = 'animated'
	video    = 'video'


class Thumbnail(BaseModel) :
	post_id:  str
	bounds:   int
	size:     PostSize
	type:     MediaType
	filename: str
	length:   int


class Media(BaseModel) :

	post_id:    str
	updated:    datetime
	crc:        Optional[int]
	filename:   str
	type:       MediaType
	size:       PostSize
	thumbhash:  str
	length:     int
	thumbnails: list[Thumbnail]
	flags:      list[MediaFlag] = []

	# computed
	url: str = ''


class Post(BaseModel) :
	post_id:     str
	title:       Optional[str]
	description: Optional[str]
	user:        UserPortable
	score:       Optional[Score]
	rating:      Rating
	parent:      Optional[str]
	privacy:     Privacy
	created:     datetime
	updated:     datetime
	media:       Optional[Media]
	tags:        Optional[TagGroups]
	blocked:     bool
	replies:     Optional[list['Post']]


@unique
class TagGroupPortable(Enum):
	artist  = "artist"
	subject = "subject"
	sponsor = "sponsor"
	species = "species"
	gender  = "gender"
	misc    = "misc"


class Tag(BaseModel):
	tag: str
	owner:          Optional[UserPortable]
	group:          TagGroupPortable
	deprecated:     bool
	inherited_tags: list[str]
	description:    Optional[str]
