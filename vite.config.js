const path = require('path');

export default {
	server: {
		port: 8000,
		hmr: false,
	},
	resolve: {
		extensions: ['.js', '.vue', '.json', '.*'],
		alias: {
			'/@': path.resolve(__dirname, './src'),
		},
	},
}