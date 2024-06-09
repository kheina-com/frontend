from typing import Dict


Headers: Dict[str, str] = {
	'content-security-policy': "default-src 'none';"
		"script-src 'self';"
		"font-src 'self';"
		"connect-src 'self' *.fuzz.ly api.pwnedpasswords.com;"
		"img-src 'self' cdn.fuzz.ly blob: data:;"  # blob: is required for uploader and posts, data: is used for thumbhashes
		"style-src 'self' *.fuzz.ly 'unsafe-inline';"
		"media-src 'self' cdn.fuzz.ly blob:;"
		"manifest-src 'self';"
		"frame-ancestors 'none'",
}
