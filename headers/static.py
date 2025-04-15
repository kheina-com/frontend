from urllib.parse import urlparse

from utilities.constants import cdn_host, environment, host


Headers: dict[str, str]
cdn:    str = urlparse(cdn_host).netloc
origin: str = urlparse(host).netloc


if environment.is_prod() :
	Headers = {
		'content-security-policy': "default-src 'none';"
			"script-src 'self';"
			"font-src 'self';"
			f"connect-src 'self' {cdn} {origin} api.pwnedpasswords.com;"
			f"img-src 'self' {cdn} blob: data:;"  # blob: is required for uploader and posts, data: is used for thumbhashes
			f"style-src 'self' {origin} 'unsafe-inline';"
			f"media-src 'self' {cdn} blob:;"
			"manifest-src 'self';"
			"base-uri 'self';"
			"frame-ancestors 'none'",
		'service-worker-allowed': '/',
	}

else :
	Headers = {
		'content-security-policy': "default-src 'none';"
			"script-src 'self';"
			"font-src 'self';"
			f"connect-src 'self' {cdn} {origin} api.pwnedpasswords.com;"
			f"img-src 'self' {cdn} blob: data:;"
			f"style-src 'self' {origin} 'unsafe-inline';"
			f"media-src 'self' {cdn} blob:;"
			"manifest-src 'self';"
			"base-uri 'self';"
			"frame-ancestors 'none'",
		'service-worker-allowed': '/',
	}
