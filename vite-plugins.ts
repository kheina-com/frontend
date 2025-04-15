export default null;

export const minifyHtml = () => {
	return {
		name: "html-transform",
		transformIndexHtml(html: string) {
			return html.replace(
				// remove formatting/tabbing
				/[\t\r\n]/g, ""
			).replace(
				// replace single ticks within tags with proper double ticks
				/<[^<>]+?'[^<>]+?'[^<>]*?>/g,
				match => match.replace(/([\w_-]+=)'(.+?)'/g, `$1"$2"`)
			).replace(
				// remove trailing semicolons that are unnecessary
				/\;\}/g, "}"
			).replace(
				// replace unnecessary whitespace
				// gotta be real careful about this one, in case there are any commas in the text
				/\s*(\{|\}|,|:)\s*/g, "$1"
			).replace(
				// do one final pass for any misc whitespace between tags
				/>\s+</g, "><"
			);
		},
	};
};

import { PluginOption } from 'vite';

type Options = {
	filename: string;
};

export function serviceWorkerPlugin(options: Options): PluginOption {
	const name = 'vite-plugin-service-worker';
	const virtualModuleId = `virtual:${name}`;
	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	const outfile = "sw.js";
	let isBuild = false;
	return {
		name,
		config(_, { command }) {
			isBuild = command === 'build';
			return {
				build: {
					rollupOptions: {
						input: {
							main: 'index.html',
							sw: options.filename,
						},
						output: {
							entryFileNames: ({ facadeModuleId }) => {
								if (facadeModuleId?.includes(options.filename)) {
									return outfile;
								}
								return 'assets/[name].[hash].js';
							},
						},
					},
				},
			};
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				let filename = isBuild ? outfile : options.filename;
				if (!filename.startsWith('/')) filename = `/${filename}`;
				return `export const serviceWorkerFile = '${filename}'`;
			}
		},
	};
}
