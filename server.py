from asyncio import ensure_future
from os import path
from typing import Optional

from fastapi.responses import FileResponse, HTMLResponse
from kh_common.caching import ArgsCache, SimpleCache
from kh_common.config.constants import environment
from kh_common.logging import getLogger
from kh_common.server import Request, Response, ServerApp

from headers.home import homeMetaTags
from headers.post import post_regex, postMetaTags
from headers.tag import tag_regex, tagMetaTags
from headers.user import user_regex, userMetaTags


pixel = Response(
	b'GIF89a\x01\x00\x01\x00p\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
	headers={
		'cache-control': 'no-cache',
		'content-length': '37',
		'content-type': 'image/gif',
	},
)

app = ServerApp(auth=False)

logger = getLogger()

uri_map = {
	post_regex: postMetaTags,
	user_regex: userMetaTags,
	tag_regex: tagMetaTags,
}


@SimpleCache(float('inf') if environment.is_prod() else 60)
def vueIndex() :
	return open('dist/index.html').read()


@ArgsCache(60)
async def matchMetaTags(uri: str) :
	metaTags = None

	for regex, handler in uri_map.items() :
		match = regex.match(uri)

		if match :
			metaTags = await handler(match)
			break

	return metaTags


@app.get('/t.gif')
def pixel(req: Request) :
	logger.info(req)
	return pixel


@app.get('{uri:path}')
async def all_routes(uri: str, force_norich: Optional[str] = None) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	if force_norich :
		return HTMLResponse(vueIndex())

	metaTags = ensure_future(matchMetaTags(uri))
	html = vueIndex()
	metaTags = (await metaTags) or homeMetaTags()

	html = html.replace('<head>', '<head>' + metaTags)

	return HTMLResponse(html)


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
