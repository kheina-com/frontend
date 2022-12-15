from typing import Dict


Headers: Dict[str, str] = {
	'content-security-policy': "default-src 'none'; script-src 'self'; font-src 'self'; connect-src 'self' *.fuzz.ly *.kheina.com; img-src 'self' cdn.fuzz.ly; style-src 'self'; media-src 'self'; manifest-src 'self'; style-src-attr 'self'; frame-ancestors 'none'",
}
