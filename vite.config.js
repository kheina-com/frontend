import vue from '@vitejs/plugin-vue'
const path = require('path');

export default {
	plugins: [
		vue(),
	],
	server: {
		port: 3000,
		hmr: {
			timeout: 10000,
		},
	},
	resolve: {
		extensions: ['.js', '.vue', '.json', '.*'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
}