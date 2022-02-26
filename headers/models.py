from kh_common.models.user import UserPortable
from kh_common.models.privacy import Privacy
from kh_common.models.rating import Rating
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum, unique


@unique
class TagGroupPortable(Enum) :
	artist: str = 'artist'
	subject: str = 'subject'
	sponsor: str = 'sponsor'
	species: str = 'species'
	gender: str = 'gender'
	misc: str = 'misc'


class TagPortable(str) :
	pass


class Tag(BaseModel) :
	tag: str
	owner: Optional[UserPortable]
	group: TagGroupPortable
	deprecated: bool
	inherited_tags: List[TagPortable]
	description: Optional[str]


class Score(BaseModel) :
	up: int
	down: int
	total: int
	user_vote: Optional[int]


class MediaType(BaseModel) :
	file_type: str
	mime_type: str


class Post(BaseModel) :
	post_id: str
	title: Optional[str]
	description: Optional[str]
	user: UserPortable
	score: Optional[Score]
	rating: Rating
	parent: Optional[str]
	privacy: Privacy
	created: Optional[datetime]
	updated: Optional[datetime]
	filename: Optional[str]
	media_type: Optional[MediaType]
	blocked: bool


@unique
class TagGroupPortable(Enum) :
	artist: str = 'artist'
	subject: str = 'subject'
	sponsor: str = 'sponsor'
	species: str = 'species'
	gender: str = 'gender'
	misc: str = 'misc'


class TagPortable(str) :
	pass


class TagGroups(BaseModel) :
	artist: Optional[List[TagPortable]]
	subject: Optional[List[TagPortable]]
	sponsor: Optional[List[TagPortable]]
	species: Optional[List[TagPortable]]
	gender: Optional[List[TagPortable]]
	misc: Optional[List[TagPortable]]
