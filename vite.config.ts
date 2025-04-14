import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { minifyHtml } from './vite-plugins';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
import child_process from 'child_process';
import { serviceWorkerPlugin } from '@gautemo/vite-plugin-service-worker';

const fullCommit = child_process
	.execSync("git rev-parse HEAD")
	.toString();

const shortCommit = child_process
	.execSync("git rev-parse --short HEAD")
	.toString();

export default defineConfig({
	plugins: [
		vue(),
		minifyHtml(),
		mkcert(),
		serviceWorkerPlugin({
			filename: "src/service_worker/index.ts",
		}),
	],
	build: {
		// vite won't base64-encode files and inject them into the html
		// we want to keep the html file small so it loads as fast as possible
		assetsInlineLimit: 0,
	},
	define: {
		// these must also be defined in env.d.ts
		__COMMIT_HASH__: JSON.stringify(fullCommit.trim()),
		__SHORT_COMMIT_HASH__: JSON.stringify(shortCommit.trim()),
	},
	server: {
		port: 3000,
		hmr: {
			timeout: 10000,
		},
		headers: {
			"service-worker-allowed": "/",
		},
	},
	resolve: {
		extensions: [".ts", ".vue", ".json", ".*"],
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"$": path.resolve(__dirname, "./assets"),
		},
	},
	assetsInclude: [
		// "src/localization/lang-*",
	],
});
