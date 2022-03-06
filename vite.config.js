import vue from '@vitejs/plugin-vue'
const path = require('path');
const fullCommit = require('child_process')
	.execSync('git rev-parse HEAD')
	.toString();
const shortCommit = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString();

export default {
	plugins: [
		vue(),
	],
	define: {
		__COMMIT_HASH__: JSON.stringify(fullCommit.trim()),
		__SHORT_COMMIT_HASH__: JSON.stringify(shortCommit.trim()),
	},
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
			'$': path.resolve(__dirname, './assets'),
		},
	},
}