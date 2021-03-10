from kh_common.exceptions.http_error import NotFound
from fastapi.responses import FileResponse
from kh_common.caching import KwargsCache
from kh_common.server import ServerApp
from os import path


app = ServerApp(auth=False)


@app.get('/{uri:path}')
@KwargsCache(60)
async def test(uri: str) :
	uri = 'dist/' + uri.strip('\./')

	if path.isfile(uri) :
		return FileResponse(uri)

	return FileResponse('dist/index.html')


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
