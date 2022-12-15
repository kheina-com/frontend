from typing import Dict


Headers: Dict[str, str] = {
	'content-security-policy': "default-src 'none'; script-src 'self' *.fuzz.ly *.kheina.com; font-src 'self' *.fuzz.ly *.kheina.com; connect-src 'self' *.fuzz.ly *.kheina.com; img-src 'self' cdn.fuzz.ly; style-src 'self' 'unsafe-inline'; media-src 'self'; manifest-src 'self'; frame-ancestors 'none'",
}
