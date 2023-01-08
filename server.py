from asyncio import Task, ensure_future
from os import path
from re import Match
from typing import Optional

from fastapi.responses import FileResponse, HTMLResponse
from kh_common.caching import ArgsCache, SimpleCache
from kh_common.config.constants import environment
from kh_common.logging import getLogger
from kh_common.server import Request, Response, ServerApp
from pydantic import constr

from headers.home import homeMetaTags
from headers.post import post_regex, postMetaTags
from headers.static import Headers
from headers.tag import tag_regex, tagMetaTags
from headers.user import user_regex, userMetaTags


PixelResponse = Response(
	b'GIF89a\x01\x00\x01\x00p\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
	headers={
		'cache-control': 'no-cache',
		'content-length': '37',
		'content-type': 'image/gif',
	},
)

app = ServerApp(
	auth = False,
	allowed_hosts = (
		['fuzz.ly']
		if environment.is_prod() else
		[
			'localhost',
			'127.0.0.1',
			'*.kheina.com',
			'*.fuzz.ly',
		]
	),
	allowed_origins = (
		['fuzz.ly']
		if environment.is_prod() else
		[
			'localhost',
			'127.0.0.1',
			'dev.kheina.com',
			'dev.fuzz.ly',
		]
	),
)

logger = getLogger()


@SimpleCache(float('inf') if environment.is_prod() else 60)
def vueIndex() :
	return open('dist/index.html').read()


@app.get('/t.gif')
def pixel(req: Request) :
	logger.info(req)
	return PixelResponse


@app.get('/p/{post_id}')
async def post_route(post_id: constr(regex=r'^[a-zA-Z0-9_-]{8}$'), force_norich: Optional[str] = None) :
	if force_norich :
		return HTMLResponse(vueIndex(), headers=Headers)

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + await postMetaTags(post_id)), headers=Headers)


@app.get('/t/{tag}')
async def tag_route(tag: str, force_norich: Optional[str] = None) :
	if force_norich :
		return HTMLResponse(vueIndex(), headers=Headers)

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + await tagMetaTags(tag)), headers=Headers)


@app.get('{uri:path}')
async def all_routes(uri: str, force_norich: Optional[str] = None) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri, headers=Headers)

	if force_norich :
		return HTMLResponse(vueIndex(), headers=Headers)

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await userMetaTags(uri) or await homeMetaTags())), headers=Headers)


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
