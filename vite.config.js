import vue from '@vitejs/plugin-vue';
import { minifyHtml } from './vite-plugins.js';

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
		minifyHtml(),
	],
	build: {
		// vite won't base64-encode files and inject them into the html
		// we want to keep the html file small so it loads as fast as possible
		assetsInlineLimit: 0,
	},
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