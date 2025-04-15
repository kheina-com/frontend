/// <reference types="vite/client" />

declare module 'virtual:vite-plugin-service-worker' {
	export const serviceWorkerFile: string;
}

declare const __COMMIT_HASH__: string;
declare const __SHORT_COMMIT_HASH__: string;
