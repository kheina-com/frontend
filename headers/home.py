from utilities import default_image, header_description, header_image, header_title
from kh_common.caching import SimpleCache
from re import compile as re_compile
from html import escape


home_regex = re_compile(r'^\/?$')


@SimpleCache(float('inf'))
async def homeMetaTags(match = None) :
	return ''.join([
		header_title.format('kheina.com'),
		default_image,
		header_description.format(escape('Building a new home for all things fluff, scaled, and feathered!')),
		'<meta property="twitter:site" content="@kheinacom">',
		'<meta property="twitter:card" content="summary">',
	])