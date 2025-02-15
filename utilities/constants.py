from enum import Enum, unique
from os import environ
from typing import Literal


@unique
class Environment(Enum) :
	local = 'local'
	dev   = 'dev'
	prod  = 'prod'
	test  = 'test'

	def is_local(self) :
		return self == Environment.local

	def is_dev(self) :
		return self == Environment.dev

	def is_prod(self) :
		return self == Environment.prod

	def is_test(self) :
		return self == Environment.test


environment: Environment = Environment[environ.get('ENVIRONMENT', 'LOCAL').lower()]
cdn_host:    Literal['https://cdn.fuzz.ly', 'http://localhost:9000/kheina-content']
host:        Literal['http://localhost:8000', 'https://api-dev.fuzz.ly', 'https://api.fuzz.ly']


if environment.is_prod() :
	host     = 'https://api.fuzz.ly'
	cdn_host = 'https://cdn.fuzz.ly'

elif environment.is_dev() :
	host     = 'https://api-dev.fuzz.ly'
	cdn_host = 'https://cdn.fuzz.ly'

else :
	host     = 'http://localhost:8000'
	cdn_host = 'http://localhost:9000/kheina-content'
