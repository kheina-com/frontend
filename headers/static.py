from typing import Dict


Headers: Dict[str, str] = {
	'content-security-policy': "default-src 'none';"
		"script-src 'self';"
		"font-src 'self';"
		"connect-src 'self' *.fuzz.ly *.kheina.com api.pwnedpasswords.com;"
		"img-src 'self' cdn.fuzz.ly;"
		"style-src 'self' 'unsafe-inline';"
		"media-src 'self' cdn.fuzz.ly;"
		"manifest-src 'self';"
		"frame-ancestors 'none'",
}
