from datetime import datetime
from enum import Enum, unique
from typing import Optional

from kh_common.models.privacy import Privacy
from kh_common.models.rating import Rating
from kh_common.models.user import UserPortable
from pydantic import BaseModel


@unique
class TagGroupPortable(Enum):
    artist = "artist"
    subject = "subject"
    sponsor = "sponsor"
    species = "species"
    gender = "gender"
    misc = "misc"


class TagPortable(str):
    pass


class Tag(BaseModel):
    tag: str
    owner: Optional[UserPortable]
    group: TagGroupPortable
    deprecated: bool
    inherited_tags: list[TagPortable]
    description: Optional[str]


class Score(BaseModel):
    up: int
    down: int
    total: int
    user_vote: Optional[int]


class MediaType(BaseModel):
    file_type: str
    mime_type: str


class Post(BaseModel):
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


class TagGroups(BaseModel):
    artist: Optional[list[TagPortable]]
    subject: Optional[list[TagPortable]]
    sponsor: Optional[list[TagPortable]]
    species: Optional[list[TagPortable]]
    gender: Optional[list[TagPortable]]
    misc: Optional[list[TagPortable]]
