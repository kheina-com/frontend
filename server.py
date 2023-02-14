from os import path
from typing import Dict, Optional

import requests
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, Response
from kh_common.caching import SimpleCache
from kh_common.config.constants import account_host, auth_host, config_host, environment, posts_host, tags_host, upload_host, users_host
from kh_common.exceptions import jsonErrorHandler
from kh_common.exceptions.base_error import BaseError
from kh_common.logging import getLogger
from kh_common.server.middleware import CustomHeaderMiddleware, HeadersToSet
from kh_common.server.middleware.cors import KhCorsMiddleware
from pydantic import constr
from starlette.middleware.exceptions import ExceptionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from headers.home import homeMetaTags
from headers.post import postMetaTags
from headers.static import Headers
from headers.tag import tagMetaTags
from headers.user import userMetaTags


# update the headers injected by the custom headers middleware to include the ones for frontend
HeadersToSet.update(Headers)

PixelResponse = Response(
	b'GIF89a\x01\x00\x01\x00p\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
	headers={
		'cache-control': 'no-cache',
		'content-length': '37',
		'content-type': 'image/gif',
	},
)

app = FastAPI(docs_url=None)
app.add_middleware(ExceptionMiddleware, handlers={ Exception: jsonErrorHandler }, debug=False)
app.add_exception_handler(BaseError, jsonErrorHandler)
app.middleware('http')(CustomHeaderMiddleware)
app.add_middleware(
	KhCorsMiddleware,
	allowed_origins = set(
		['fuzz.ly']
		if environment.is_prod() else
		[
			'localhost',
			'127.0.0.1',
			'dev.fuzz.ly',
		]
	),
	allowed_protocols = set(['http', 'https'] if environment.is_local() else ['https']),
	allowed_headers = {
		'accept',
		'accept-language',
		'authorization',
		'cache-control',
		'content-encoding',
		'content-language',
		'content-length',
		'content-security-policy',
		'content-type',
		'cookie',
		'host',
		'location',
		'referer',
		'referrer-policy',
		'set-cookie',
		'user-agent',
		'www-authenticate',
		'x-frame-options',
		'x-xss-protection',
	},
	allowed_methods = { 'GET' },
	exposed_headers = set(list(HeadersToSet.keys()) + [
		'authorization',
		'cache-control',
		'content-type',
		'cookie',
		'set-cookie',
		'www-authenticate',
	]),
	max_age = 86400,
)
app.add_middleware(
	TrustedHostMiddleware,
	allowed_hosts=set(
		['fuzz.ly']
		if environment.is_prod() else
		[
			'localhost',
			'127.0.0.1',
			'*.fuzz.ly',
		]
	),
)

logger = getLogger()

services: Dict[str, str] = {
	'upload': upload_host,
	'posts': posts_host,
	'users': users_host,
	'tags': tags_host,
	'account': account_host,
	'config': config_host,
	'auth': auth_host,
}


"""
We override the built-in version of openapi so that we can get the *real* api docs from all of the individual services and return those, rather than the ones that don't really matter on the frontend.
"""
def openapi() :
	openapi_json = {
		'info': {
			'title': app.title,
			'version': app.version,
		},
		'paths': { },
		'components': {
			'schemas': { },
		},
	}

	for name, host in services().items() :
		try :
			r = requests.get(f'{host}/openapi.json')

		except :
			continue

		if not r.ok :
			continue

		service_openapi_json = r.json()
		openapi_version = service_openapi_json.get('openapi')

		if not openapi_version :
			continue

		paths: Dict[str, dict] = { }  # this is a dictionary of url: documentation
		for path, doc in service_openapi_json['paths'].items() :
			for endpoint in doc.values() :
				endpoint['tags'] = [path]

			paths[f'{host}/{path}'] = doc

		openapi_json['paths'].update(paths)
		openapi_json['openapi'] = openapi_version
		openapi_json['components']['schemas'].update(service_openapi_json['components']['schemas'])

	return openapi_json

app.openapi = openapi


@SimpleCache(float('inf') if environment.is_prod() else 60)
async def swaggerHtml():
	if not path.isfile('dist/swagger.html') :
		raise ValueError('dist/swagger.html was not found! did you forget to run `npm run build`?')

	return open('dist/swagger.html').read()


@app.get('/docs', include_in_schema=False)
async def custom_swagger_ui_html():
	return HTMLResponse(swaggerHtml())


@SimpleCache(float('inf') if environment.is_prod() else 60)
def vueIndex() :
	if not path.isfile('dist/index.html') :
		raise ValueError('dist/index.html was not found! did you forget to run `npm run build`?')

	return open('dist/index.html').read()


@app.get('/t.gif')
def pixel(req: Request) :
	logger.info(req)
	return PixelResponse


@app.get('/p/{post_id}')
async def post_route(post_id: constr(regex=r'^[a-zA-Z0-9_-]{8}$'), force_norich: Optional[str] = None) :
	if force_norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await postMetaTags(post_id) or await homeMetaTags())))


@app.get('/t/{tag}')
async def tag_route(tag: str, force_norich: Optional[str] = None) :
	if force_norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await tagMetaTags(tag) or await homeMetaTags())))


@app.get('{uri:path}')
async def all_routes(uri: str, force_norich: Optional[str] = None) :
	local_uri = 'dist/' + uri.strip('\./')

	if path.isfile(local_uri) :
		return FileResponse(local_uri)

	if force_norich :
		return HTMLResponse(vueIndex())

	return HTMLResponse(vueIndex().replace('<head>', '<head>' + (await userMetaTags(uri) or await homeMetaTags())))


if __name__ == '__main__' :
	from uvicorn.main import run
	run(app, host='0.0.0.0', port=3000)
