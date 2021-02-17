from kh_common.exceptions.http_error import NotFound
from fastapi.responses import FileResponse
from kh_common.caching import ArgsCache
from kh_common.server import ServerApp
from os import path

app = ServerApp(auth=False)


@app.get('/')
@app.get('/{uri:path}')
@ArgsCache(60 * 60)
async def test(uri: str = None) :
	if not uri :
		return FileResponse('dist/index.html')

	uri = 'dist/' + uri.strip('\./')

	if path.isfile(uri) :
		return FileResponse(uri)

	raise NotFound('The requested resource could not be found or does not exist.')


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
