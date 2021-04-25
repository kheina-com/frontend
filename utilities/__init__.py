from re import compile as re_compile


header_title = '<meta property="og:title" content="{0}"><meta property="twitter:title" content="{0}">'
header_image = '<meta property="og:image" content="{0}"><meta property="twitter:image" content="{0}">'
header_description = '<meta name="description" property="og:description" content="{0}"><meta property="twitter:description" content="{0}">'
header_defaults = '<meta property="twitter:site" content="@kheinacom"><meta property="twitter:card" content="summary_large_image">'

default_image = header_image.format('https://cdn.kheina.com/file/kheina-content/xXPJm2s2/powerfulsnep.png')

api_timeout = 5

concise_regex = re_compile(r'(.+(?:[\n\r]+.+){0,2})([\s\S]+)?')
description_limit = 200

markdown_regex = re_compile('|'.join([
	r'\[.+\]\((.+)\)',
	r'#{1,6} ',
	r'`+',
]))


def firstGroupOrNone(match) :
	try :
		return next(filter(None, match.groups()))

	except StopIteration :
		return None


def demarkdown(string) :
	return markdown_regex.sub(firstGroupOrNone, string)


def concise(string: str) :
	match = concise_regex.match(demarkdown(string))

	if len(match[1]) > description_limit :
		description = match[1][:description_limit - 3]
		cut = True

	elif match[2] :
		description = match[1]
		cut = True

	else :
		cut = False
		description = match[0]

	return description + ('...' if cut else '')
