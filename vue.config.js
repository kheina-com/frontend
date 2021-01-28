const path = require('path');

module.exports = {
	dev: {
		port: 80
	},
	resolve: {
		extensions: ['.js', '.vue', '.json', '.*'],
		alias: {
			'/@': path.resolve(__dirname, './src')
		},
	},
}