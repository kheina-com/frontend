from utilities import header_description, header_image, header_title
from kh_common.caching import SimpleCache
from re import compile as re_compile


home_regex = re_compile(r'^\/?$')


@SimpleCache(float('inf'))
async def homeHeaders(match) :
	return ''.join([
		header_title.format('kheina.com'),
		header_image.format('https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png'),
		header_description.format('Building a new home for all things fluff, scaled, and feathered!'),
		'<meta property="twitter:site" content="@kheinacom">',
		'<meta property="twitter:card" content="summary">',
	])
