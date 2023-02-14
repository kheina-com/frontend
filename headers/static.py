from typing import Dict


Headers: Dict[str, str] = {
	'content-security-policy': "default-src 'none';"
		"script-src 'self';"
		"font-src 'self';"
		"connect-src 'self' *.fuzz.ly api.pwnedpasswords.com;"
		"img-src 'self' cdn.fuzz.ly data:;"  # data: is required for uploader
		"style-src 'self' *.fuzz.ly 'unsafe-inline';"
		"style-src 'self' 'unsafe-inline';"
		"media-src 'self' cdn.fuzz.ly data:;"
		"manifest-src 'self';"
		"frame-ancestors 'none'",
}
