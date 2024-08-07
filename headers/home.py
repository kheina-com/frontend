from functools import lru_cache
from html import escape
from re import compile as re_compile

from utilities import default_image, header_card_summary, header_description, header_title


home_regex = re_compile(r'^\/?$')


@lru_cache
def homeMetaTags() -> str :
	return ''.join([
		header_title.format('fuzz.ly'),
		default_image,
		header_description.format(escape('Building a new home for all things fluff, scaled, and feathered!')),
		header_card_summary,
	])
