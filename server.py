from functools import lru_cache
from os import path
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from pydantic import constr
from starlette.middleware.trustedhost import TrustedHostMiddleware

from headers.home import homeMetaTags
from headers.post import postMetaTags
from headers.set import setMetaTags
from headers.static import Headers
from headers.tag import tagMetaTags
from headers.user import userMetaTags


# update the headers injected by the custom headers middleware to include the ones for frontend
async def CustomHeaderMiddleware(request: Request, call_next) :
	response = await call_next(request)
	response.headers.update(Headers)
	return response


PixelResponse = Response(
	b'GIF89a\x01\x00\x01\x00p\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
	headers={
		'cache-control': 'no-cache',
		'content-length': '37',
		'content-type': 'image/gif',
	},
)

app = FastAPI()
app.middleware('http')(CustomHeaderMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=[
	'localhost',
	'127.0.0.1',
	'*.fuzz.ly',
	'fuzz.ly',
])


@lru_cache
def vueIndex() :
	if not path.isfile('dist/index.html') :
		raise ValueError('dist/index.html was not found! did you forget to run `npm run build`?')

	return open('dist/index.html').read()


@app.get('/t.gif')
def pixel(req: Request) :
	# logger.info(req)
	return PixelResponse


@app.get('/p/{post_id}')
async def post_route(post_id: constr(regex=r'^[a-zA-Z0-9_-]{8}$'), norich: Optional[str] = None) :
	if norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await postMetaTags(post_id) or await homeMetaTags())))


@app.get('/t/{tag}')
async def tag_route(tag: str, norich: Optional[str] = None) :
	if norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await tagMetaTags(tag) or await homeMetaTags())))


@app.get('/s/{set_id}')
async def set_route(set_id: str, norich: Optional[str] = None) :
	if norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await setMetaTags(set_id) or await homeMetaTags())))


@app.get('{uri:path}')
async def all_routes(uri: str, norich: Optional[str] = None) :
	local_uri = 'dist/' + uri.strip(r'\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	if norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await userMetaTags(uri) or await homeMetaTags())))


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
