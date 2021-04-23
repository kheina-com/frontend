from kh_common.server import ServerApp
from fastapi.responses import FileResponse, HTMLResponse
from kh_common.caching import ArgsCache, SimpleCache
from headers.post import postMetaTags, post_regex
from headers.user import userMetaTags, user_regex
from headers.tag import tagMetaTags, tag_regex
from headers.home import homeMetaTags
from asyncio import ensure_future
from os import path


app = ServerApp(auth=False)


uri_map = {
	post_regex: postMetaTags,
	user_regex: userMetaTags,
	tag_regex: tagMetaTags,
}


@SimpleCache(60)  # change to inf on switch to kube
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

	return metaTags or await homeMetaTags()


@app.get('{uri:path}')
async def test(uri: str) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	metaTags = ensure_future(matchMetaTags(uri))
	html = vueIndex()
	metaTags = await metaTags

	html = html.replace('<head>', '<head>' + metaTags)

	return HTMLResponse(html)


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
