from datetime import datetime
from enum import Enum, unique
from typing import Optional

from pydantic import BaseModel


@unique
class Privacy(Enum) :
	public   = 'public'
	unlisted = 'unlisted'
	private  = 'private'


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


class TagGroups(BaseModel):
	artist:  Optional[list[str]]
	subject: Optional[list[str]]
	species: Optional[list[str]]
	gender:  Optional[list[str]]
	misc:    Optional[list[str]]


@unique
class Rating(Enum) :
	general  = 'general'
	mature   = 'mature'
	explicit = 'explicit'


class Score(BaseModel):
	up:        int
	down:      int
	total:     int
	user_vote: Optional[int]


class MediaType(BaseModel):
	file_type: str
	mime_type: str


class Post(BaseModel):
	post_id:     str
	title:       Optional[str]
	description: Optional[str]
	user:        UserPortable
	score:       Optional[Score]
	rating:      Rating
	parent:      Optional[str]
	privacy:     Privacy
	created:     Optional[datetime]
	updated:     Optional[datetime]
	filename:    Optional[str]
	media_type:  Optional[MediaType]
	blocked:     bool


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
