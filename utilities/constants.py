from enum import Enum, unique
from os import environ


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

host: str = {
	Environment.local: 'http://localhost:8000',
	Environment.dev:   'https://api-dev.fuzz.ly',
	Environment.prod:  'https://api.fuzz.ly',
	Environment.test:  'http://localhost:8000',
}[environment]
