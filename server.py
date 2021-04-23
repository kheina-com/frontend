from kh_common.server import ServerApp
from fastapi.responses import FileResponse, HTMLResponse
from kh_common.caching import ArgsCache, SimpleCache
from headers.home import homeHeaders, home_regex
from headers.post import postHeaders, post_regex
from headers.user import userHeaders, user_regex
from asyncio import ensure_future
from os import path


app = ServerApp(auth=False)


uri_map = {
	post_regex: postHeaders,
	user_regex: userHeaders,
	home_regex: homeHeaders,
}


@ArgsCache(60)
async def matchHeaders(uri: str) :
	for regex, handler in uri_map.items() :
		match = regex.match(uri)

		if match :
			return await handler(match)

	return None


@SimpleCache(60)
def vueIndexHtml() :
	return open('dist/index.html').read()


@app.get('{uri:path}')
async def test(uri: str) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	headers = ensure_future(matchHeaders(uri))
	html = vueIndexHtml()
	headers = await headers

	if headers :
		html = html.replace('<head>', '<head>' + headers)

	return HTMLResponse(html)


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
