import type { Emoji } from '@/types/emoji';
import type { MediaLike } from '@/types/post';
import type { TagPortable, Tags } from '@/types/tag';
import { apiErrorDescriptionToast, apiErrorMessageToast, authRegex } from '@/config/constants';
import store, { type ToastOptions } from '@/globals';
import { tagGroups } from '@/config/constants';
import { useRoute, useRouter } from 'vue-router';

export default null;

import { cdnHost, environment } from '@/config/constants';
export function setCookie(name: string, value: any, maxage = 86400, samesite = "strict", path = "/") {
	if (store().cookies) document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; ${environment !== "local" ? "secure" : ""}`;
};

const ParserTypeMap: { [k: string]: { (value: any): any; }; } = {
	boolean: (v: any): boolean => typeof (v) === "string" ? "false" !== v : Boolean(v),
	number: (v: any): number => typeof (v) === "string" ? parseFloat(v) : Number(v),
};

export function getCookie(cookieName: string, default_value: any = null, type: string | null = null) {
	const name = cookieName + "=";
	let ca = document.cookie.split(";");
	let value: any = default_value;
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}

		if (c.indexOf(name) == 0) {
			value = decodeURIComponent(c.substring(name.length, c.length));
			break;
		}
	}

	if (value === "null") return null;
	if (value === "undefined") return undefined;
	if (value !== default_value && type !== null) return ParserTypeMap[type](value);
	return value;
}

export function deleteCookie(cookieName: string) {
	document.cookie = `${cookieName}=null; expires=${new Date(0)}; samesite=lax; path=/; secure`;
}

export function timed<T>(func: { (...data: any[]): T; }, ...data: any[]): T {
	const start = new Date().valueOf();
	const res = func(...data);
	console.debug("[" + func.name + "] (timed)", (new Date().valueOf() - start) / 1000);
	return res;
}

export async function timedAsync<T>(func: { (...data: any[]): Promise<T>; }, ...data: any[]): Promise<T> {
	const start = new Date().valueOf();
	const res = await func(...data);
	console.debug("[" + func.name + "] (timed)", (new Date().valueOf() - start) / 1000);
	return res;
}

// 64bit random number generator. I believe it's not truly 64 bit
// due to floating point bullshit, but it's good enough
const MaxId: number = Number.MAX_SAFE_INTEGER;
export const RefId = (): number => Math.round(Math.random() * MaxId);

export function setTitle(title: string): void {
	document.title = title;
}

import { routerMetaTag } from "@/config/constants";
import type { UserAuth } from '@/types/auth';
export function setMeta(content: object): void {
	const tag = document.createElement("meta");

	Object.entries(content).forEach(([k, v]) => tag.setAttribute(k, v));

	// We use this to track which meta tags we create, so we don't interfere with other ones.
	tag.setAttribute(routerMetaTag, "");

	document.head.appendChild(tag);
}

export function commafy(x: number): string { // from https://stackoverflow.com/a/2901298
	let parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

export function getMediaThumbnailUrl(media: MediaLike, resolution: number = 800, extension: "webp" | "jpeg" = "webp") {
	return media.thumbnails.filter(x => x.type.file_type === extension).sort((a, _) => a.bounds - resolution)[0].url;
};

export function getEmojiUrl(emoji: Emoji): string {
	return `${cdnHost}/${emoji.url}`;
}

export function getIconUrl(postId: string, handle: string, extension = "webp") {
	return `${cdnHost}/${postId}/icons/${handle.toLowerCase()}.${extension}`;
}

export function getBannerUrl(postId: string, handle: string, extension = "webp") {
	return `${cdnHost}/${postId}/banners/${handle.toLowerCase()}.${extension}`;
}

export function round(num: number, precision: number): number {
	const multiplier = 10 ** precision;
	return Math.round(num * multiplier) / multiplier;
}

export function tagSplit(tags: string): string[] { return tags.split(/[,\s]/).filter(x => x).map(x => x.trim()); }

export function sortTagGroups(tags: { [k: string]: TagPortable[]; } | Tags): Tags {
	const sorted: { [k: string]: TagPortable[]; } = {};
	tagGroups.forEach(i => {
		if (tags.hasOwnProperty(i)) sorted[i] = (tags as { [k: string]: TagPortable[]; })[i];
	});
	return sorted;
}

/**
 * 
 * @param options interface ToastOptions {
 * 	title?:       string,
 * 	description?: string,
 * 	dump?:        any,
 * 	color?:       string,
 * 	icon?:        string,
 * 	time?:        number,
 * }
 */
export function createToast(options: ToastOptions): void {
	return store().createToast(options);
}

export function saveToHistory(data: any): void {
	if (!window.history.state) return;
	history.replaceState(Object.assign(window.history.state, data), "");
}

export function uuid4(): string {
	let uuid = "";
	for (let i = 0; i < 4; i++) uuid += Math.round(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
	return uuid;
}

interface KhatchOptions {
	attempts?: number,
	handleError?: boolean,
	errorMessage?: string,
	errorHandlers?: { [statusCode: number]: { (r: Response): void; }; },
	method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE",
	credentials?: "include",
	headers?: { [header: string]: string; },
	body?: string | any,
	trace?: string,
}

/**
 * 
 * @param url 
 * @param options interface KhatchOptions {
 * 	attempts?:      number,
 * 	handleError?:   boolean,
 * 	errorMessage?:  string,
 * 	errorHandlers?: { [statusCode: number]: { (r: Response): void; }; },
 * 	method?:        "GET" | "PUT" | "POST" | "PATCH" | "DELETE",
 * 	credentials?:   "include",
 * 	headers?:       { [header: string]: string; },
 * 	body?:          string | any,
 * }
 * @returns 
 */
export async function khatch(url: string, options: KhatchOptions = {}): Promise<Response> {
	const attempts = options?.attempts || 3;
	const handleError = Boolean(options?.handleError || options?.errorMessage || options?.errorHandlers);
	const errorMessage = options?.errorMessage || apiErrorMessageToast;
	const errorHandlers = options?.errorHandlers || {};
	options.headers = options?.headers || {};

	if (url.match(authRegex)) {
		options.credentials = "include";
		const auth = store().auth?.token;
		if (auth) options.headers.authorization = "bearer " + auth;
	}

	options.headers["kh-trace"] = options.headers["kh-trace"] || options?.trace || uuid4();

	if (options.hasOwnProperty("body") && typeof (options.body) != "string") {
		options.headers["content-type"] = "application/json";
		options.body = JSON.stringify(options.body);
	}

	if (options.body && !options?.method) options.method = "POST";

	let attempt = 1;
	let response = null;
	let error = null;

	for (; ;) {
		try {
			response = await fetch(url, options);
		}
		catch (e) {
			error = e;
			// break;
		}

		// we only want to retry when we think it might succeed
		if (response && response.status <= 500) break;

		if (attempt < attempts) {
			await new Promise(r => setTimeout(r, attempt++ ** 2 * 1000));
		} else {
			break;
		}
	}

	console.debug("[khatch]", attempt, options.method ?? "GET", url, response?.status, options, response, error);

	if (response?.status === 401) store().setAuth(null);

	if (error || response === null || response.status >= 400) {
		if (handleError) {
			if (error) {
				console.error(error);
				createToast({
					title: errorMessage,
					description: error.toString(),
				});
			}
			else if (!response) {
				createToast({
					title: errorMessage,
					description: (error || "").toString(),
				});
			}
			else if (errorHandlers[response.status]) {
				errorHandlers[response.status](response);
			}
			else if (response.status < 400) {
				// unreachable?
				return response;
			}
			else if (response.status === 422) {
				// specifically add a special handler for Unprocessable Content
				// note, this can still be overridden
				const r = await response.json();
				const detail: { loc: string[], msg: string, type: string, }[] | undefined = r?.detail;
				if (!detail) {
					createToast({
						title: errorMessage,
						description: r?.error ?? apiErrorDescriptionToast,
						dump: r,
					});
					throw "([khatch] handled)";
				}

				const desc: string[] = [];
				for (const d of detail) {
					desc.push(`request ${d.loc.shift()} ${d.msg}: ${d.loc.join(".")}`);
				}
				createToast({
					title: "Request could not be processed",
					description: desc.join("\n"),
				});
			}
			else if (response.status < 500) {
				const r = await response.json();
				createToast({
					title: errorMessage,
					description: r?.error ?? apiErrorDescriptionToast,
					dump: r,
				});
				if (r?.code === "Unauthorized") {
					// these funcs sometimes fail and idk why
					const router = useRouter();
					const route = useRoute();
					router.push(`/a/login?path=${route.fullPath}`);
				}
			}
			else {
				createToast({
					title: errorMessage,
					description: apiErrorDescriptionToast,
					dump: await response.json(),
				});
			}

			throw "([khatch] handled)";
		}

		if (response) throw response;  // TODO: do we want to just throw the whole ass response? that way downstream handlers have everything
		throw error;
	}

	// if (response.status < 400)
	// { return response; }

	return response;
}

/**
 * 
 * @param str 
 * @param args 
 * @returns 
 */
export function format(str: string, ...args: any[]) {
	// store arguments in an array
	const kwargs: { [k: string]: string; } = {};
	if (typeof args[args.length - 1] === "object") Object.assign(kwargs, args[args.length - 1]);
	// use replace to iterate over the string
	// select the match and check if the related argument is present
	// if yes, replace the match with the argument
	return str.replace(/{(.*?)}/g, m => {
		// check if the argument is present
		const i = m.substring(1, m.length - 1);
		const index = parseInt(m[0]);
		if (!Number.isNaN(index)) {
			return typeof args[index] === "undefined" ? m[0] : args[index];
		}
		return typeof kwargs[i] === "undefined" ? m[0] : kwargs[i];
	});
};

export const registerServiceWorker = (script: string): Promise<ServiceWorkerRegistration> => {
	console.debug("[service worker] file:", script);
	if ("serviceWorker" in navigator) {
		return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
			navigator.serviceWorker.register(script, {
				scope: "/",
			}).then(reg => {
				if (reg.installing) {
					console.debug("[service worker] installing");
				} else if (reg.waiting) {
					console.debug("[service worker] installed");
				}
				if (reg.active) {
					console.debug("[service worker] active");
				}
				else {
					navigator.serviceWorker.ready.then(() =>
						console.debug("[service worker] active")
					);
				}
				resolve(reg);
			}).catch(err =>
				reject(`registration failed: ${err}`)
			);
		});
	}
	throw "service worker api unavailable in browser";
};

export function tab(e: KeyboardEvent) {
	const target = e.target as HTMLInputElement;
	target.focus();

	const start = target.selectionStart ?? 0;
	const s = Math.min(target.value.lastIndexOf("\n", start) + 1, start);
	const end = target.selectionEnd ?? 0;
	const sub = target.value.substring(s, end);

	if (e.shiftKey) {
		target.selectionStart = s;
		const text = sub.startsWith("\t") ? sub.replaceAll("\n\t", "\n").substring(1) : sub.replaceAll("\n\t", "\n");
		if (!document.execCommand || !document.execCommand("insertText", false, text)) {
			target.value = target.value.substring(0, s) + text + target.value.substring(end);
		}
		if (start !== end) {
			target.selectionStart = s;
			target.selectionEnd = end - sub.length + text.length;
		}
		return;
	}

	if (sub.includes("\n")) {
		target.selectionStart = s;
		const text = "\t" + sub.replaceAll("\n", "\n\t");
		if (!document.execCommand || !document.execCommand("insertText", false, text)) {
			target.value = target.value.substring(0, s) + text + target.value.substring(end);
		}
		target.selectionStart = s;
		target.selectionEnd = end - sub.length + text.length;
		return;
	}

	if (!document.execCommand || !document.execCommand("insertText", false, "\t")) {
		target.value = target.value.substring(0, start) + "\t" + target.value.substring(end);
		target.selectionStart = target.selectionEnd = start + 1;
		return;
	}
}

export function abbreviate(value: number): string {
	if (value >= 995e7) {
		return `${Math.round(value / 1e9)}B`;
	}
	if (value >= 9995e5) {
		return `${(value / 1e9).toFixed(1)}B`;
	}
	if (value >= 995e4) {
		return `${Math.round(value / 1e6)}M`;
	}
	if (value >= 9995e2) {
		return `${(value / 1e6).toFixed(1)}M`;
	}
	if (value >= 9950) {
		return `${Math.round(value / 1e3)}K`;
	}
	if (value >= 1e3) {
		return `${(value / 1e3).toFixed(1)}K`;
	}
	return value.toString();
}

export function abbreviateBytes(value: number): string {
	// const e3 = Math.log(value) * Math.LOG10E / 3 | 0;

	// more concise but slower (I think)
	// const abr = ["B", "KB", "MB", "GB", "TB"];
	// if (value >= 9995 * 10 ** (e3 * 3 - 1)) {
	// 	return `${Math.round(value / (10 ** ((e3 + 1) * 3)))}${abr[e3 + 1]}`;
	// }
	// if (value >= 995 * 10 ** (e3 * 3 - 2)) {
	// 	return `${Math.round(value / (10 ** (e3 * 3)))}${abr[e3]}`;
	// }
	// return `${(value / (10 ** (e3 * 3))).toFixed(1)}${abr[e3]}`;

	switch (Math.log(value) * Math.LOG10E | 0) {
	case 0:
	case 1:
	case 2:
		return `${value}B`;
	case 3:
		if (value < 9950) return `${(value / 1e3).toFixed(1)}KB`;
		return `${Math.round(value / 1e3)}KB`; // necessary to avoid double check
	case 5:
		if (value >= 9995e2) return `${(value / 1e6).toFixed(1)}MB`;
	case 4:
		return `${Math.round(value / 1e3)}KB`;
	case 6:
		if (value < 995e4) return `${(value / 1e6).toFixed(1)}MB`;
		return `${Math.round(value / 1e6)}MB`; // necessary to avoid double check
	case 8:
		if (value >= 9995e5) return `${(value / 1e9).toFixed(1)}GB`;
	case 7:
		return `${Math.round(value / 1e6)}MB`;
	case 9:
		if (value < 995e7) return `${(value / 1e9).toFixed(1)}GB`;
	default:
		return `${Math.round(value / 1e9)}GB`;
	}
}

export function int_from_bytes(bytestring: string): number {
	let i = 0;
	let r = 0;
	bytestring.split("").reverse().map(x => x.charCodeAt(0)).forEach(x => {
		r += x * 2 ** (i++ * 8);
	});
	return r;
}

const b64repl: { [k: string]: string; } = { "-": "+", "_": "/" };
export function authCookie(cookie: string | null = null): UserAuth | null {
	const token: string = cookie ?? getCookie("kh-auth");
	if (!token || token.length <= 10) return null;

	const components: string[] = token.replace("-", "+").replace("_", "/").split(".");
	if (components.length !== 3) return null;

	const tokenVersion = atob(components[0]);

	if (tokenVersion !== "1") throw TypeError(`Cannot decode auth token with version: ${tokenVersion}`);

	const payload = atob(components[1]).split(".").map(x => x.replace(/[-_]/g, m => b64repl[m[0]]));
	const miscPayload = atob(components[1]).match(/{.+}/);
	let misc: { [k: string]: any; } = {};

	if (miscPayload) {
		misc = JSON.parse(miscPayload[0]);
	}

	const a = {};

	const auth = {
		token,
		version: tokenVersion,
		algorithm: payload[0],
		keyId: int_from_bytes(atob(payload[1])),
		expires: new Date(int_from_bytes(atob(payload[2])) * 1000),
		userId: int_from_bytes(atob(payload[3])),
		guid: payload[4].replace(/\+/g, "-").replace(/\//g, "_"),
		isMod: Boolean(misc?.scope?.includes("mod")),
		isAdmin: Boolean(misc?.scope?.includes("admin")),
		scope: misc?.scope ?? [],
		...misc,
	};

	return auth;
}

export function isDarkMode() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function base64ToBytes(base64: string): Uint8Array {
	const binaryString = atob(base64.replace(/[-_]/g, m => b64repl[m[0]]));
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

export function sha1(msg: string) { // http://www.webtoolkit.info
	function rotate_left(n: number, s: number) {
		let t4 = (n << s) | (n >>> (32 - s));
		return t4;
	};
	function cvt_hex(val: number) {
		let str = '';
		let i;
		let v;
		for (i = 7; i >= 0; i--) {
			v = (val >>> (i * 4)) & 0x0f;
			str += v.toString(16);
		}
		return str;
	};
	function Utf8Encode(string: string) {
		string = string.replace(/\r\n/g, "\n");
		let utftext = '';
		for (let n = 0; n < string.length; n++) {
			let c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};
	let blockstart;
	let i, j;
	let W = new Array(80);
	let H0 = 0x67452301;
	let H1 = 0xEFCDAB89;
	let H2 = 0x98BADCFE;
	let H3 = 0x10325476;
	let H4 = 0xC3D2E1F0;
	let A, B, C, D, E;
	let temp;
	msg = Utf8Encode(msg);
	let msg_len = msg.length;
	let word_array = new Array();
	for (i = 0; i < msg_len - 3; i += 4) {
		j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
			msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
		word_array.push(j);
	}
	switch (msg_len % 4) {
	case 0:
		i = 0x080000000;
		break;
	case 1:
		i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
		break;
	case 2:
		i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
		break;
	case 3:
		i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
		break;
	}
	word_array.push(i);
	while ((word_array.length % 16) != 14) word_array.push(0);
	word_array.push(msg_len >>> 29);
	word_array.push((msg_len << 3) & 0x0ffffffff);
	for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
		for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
		for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for (i = 0; i <= 19; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 20; i <= 39; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 40; i <= 59; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 60; i <= 79; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}
	temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	return temp.toUpperCase();
}

export const lazyConfig = {
	root: null,
	rootMargin: "10%",
};

const unloadable = new Set(["null", "undefined"]);

export const lazyObserver = new IntersectionObserver(
	e => {
		// console.log(e);
		e.forEach(entry => {
			if (entry.isIntersecting) {
				const target = entry.target as HTMLImageElement;
				const src = target.dataset.src;
				if (src && !unloadable.has(src)) {
					target.src = src;
				}
				target.dataset.intersected = "";
				lazyObserver.unobserve(target);
			}
		});
	},
	lazyConfig,
);
