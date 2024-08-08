import { apiErrorDescriptionToast, apiErrorMessageToast, authRegex } from '@/config/constants';
import store, { type ToastOptions } from '@/globals';


export default null;

import { cdnHost, environment } from '@/config/constants'
export function setCookie(name: string, value: any, maxage=86400, samesite="strict", path="/") {
	if (store().cookies)
	{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; ${environment !== "local" ? "secure" : ""}`; }
};

const ParserTypeMap: { [k: string]: { (value: any): any } } = {
	boolean: (v: any): boolean => typeof(v) === "string" ? "false" !== v : Boolean(v),
	number: (v: any): number => typeof(v) === "string" ? parseFloat(v) : Number(v),
};

export function getCookie(cookieName: string, default_value: any = null, type: string | null = null) {
	let name = cookieName + "=";
	let ca = document.cookie.split(";");
	let value: any = default_value;
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ")
		{ c = c.substring(1); }

		if (c.indexOf(name) == 0) {
			value = decodeURIComponent(c.substring(name.length, c.length));
			break;
		}
	}

	if (type !== null)
	{ return ParserTypeMap[type](value); }

	return value;
}

export function deleteCookie(cookieName: string)
{ document.cookie = `${cookieName}=null; expires=${new Date(0)}; samesite=lax; path=/; secure`; };

export function setTitle(title: string): void {
	document.title = title;
}

import { routerMetaTag } from "@/config/constants"
export function setMeta(content: object): void {
	const tag = document.createElement("meta");

	Object.entries(content).forEach(([k, v]) => tag.setAttribute(k, v));

	// We use this to track which meta tags we create, so we don't interfere with other ones.
	tag.setAttribute(routerMetaTag, "");

	document.head.appendChild(tag);
}

export function commafy(x: number): string
{ // from https://stackoverflow.com/a/2901298
	let parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

let _getMediaUrl: { (postId: string, filename: string): string };
let _getMediaThumbnailUrl: { (postId: string, resolution?: number, extension?: string): string };

if (environment === "local") {
	_getMediaUrl = function(postId, filename)
	{ return `${cdnHost}/${postId}/${encodeURIComponent(filename)}?authorization=${store().auth?.token}`; }

	_getMediaThumbnailUrl = function(postId, resolution=800, extension="webp")
	{ return `${cdnHost}/${postId}/thumbnails/${resolution}.${extension}?authorization=${store().auth?.token}`; }
}
else {
	_getMediaUrl = function(postId, filename)
	{ return `${cdnHost}/${postId}/${encodeURIComponent(filename)}`; }

	_getMediaThumbnailUrl = function(postId, resolution=800, extension="webp")
	{ return `${cdnHost}/${postId}/thumbnails/${resolution}.${extension}`; }
}

export const getMediaUrl = _getMediaUrl;
export const getMediaThumbnailUrl = _getMediaThumbnailUrl;

export function getEmojiUrl(filename: string): string {
	return `${cdnHost}/emoji/${filename}`;
}

export function getIconUrl(postId: string, handle: string, extension="webp") {
	return `${cdnHost}/${postId}/icons/${handle}.${extension}`;
}

export function getBannerUrl(postId: string, handle: string, extension="webp") {
	return `${cdnHost}/${postId}/banners/${handle}.${extension}`;
}

export function round(num: number, precision: number): number {
	let multiplier = 10 ** precision;
	return Math.round(num * multiplier) / multiplier;
}

export function tagSplit(tags: string): string[]
{ return tags.split(/[,\s]/).filter(x => x).map(x => x.trim()); }

import { tagGroups } from '@/config/constants'
export function sortTagGroups(tags: { [k: string]: string[] } | Tags): Tags {
	let sorted: { [k: string]: string[] } = { };
	tagGroups.forEach(i => {
		if (tags.hasOwnProperty(i)) sorted[i] = (tags as { [k: string]: string[] })[i];
	});
	return sorted;
}

export function createToast(options: ToastOptions): void {
	return store().createToast(options);
}

export function saveToHistory(data: any): void {
	if (!window.history.state)
	{ return; }
	history.replaceState(Object.assign(window.history.state, data), "");
}

interface KhatchOptions {
	attempts?: number,
	handleError?: boolean,
	errorMessage?: string,
	errorHandlers?: { [statusCode: number]: { (r: Response): void } },
	method?: string,
	credentials?: "include",
	headers?: { [header: string]: string },
	body?: string | any,
}

export async function khatch(url: string, options: KhatchOptions = { }): Promise<Response> {
	const attempts = options?.attempts || 3;
	const handleError = Boolean(options?.handleError || options?.errorMessage || options?.errorHandlers);
	const errorMessage = options?.errorMessage || apiErrorMessageToast;
	const errorHandlers = options?.errorHandlers || { };
	options.headers = options?.headers || { };

	if (url.match(authRegex)) {
		options.credentials = "include";
		const auth = store().auth?.token;
		if (auth) options.headers.authorization = "bearer " + auth;
	}

	// options.headers["kh-trace"] = options.headers["kh-trace"] || options?.trace || uuid4();

	if (options.hasOwnProperty("body") && typeof(options.body) != "string") {
		options.headers["content-type"] = "application/json";
		options.body = JSON.stringify(options.body);
	}

	if (options.body && !options?.method) options.method = "POST";

	let attempt = 1;
	let response = null;
	let error = null;

	for (;;) {
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

	console.debug("[khatch]", attempt, url, options, response, error);

	if (response?.status === 401)
	{ store().setAuth(null); }

	if (error || response === null || response.status >= 400) {
		if (handleError) {
			if (error) {
				console.log(error)
				if (error.toString() === "TypeError: NetworkError when attempting to fetch resource.")
				{ error = "An unexpected error occurred during an API call. (Are you connected to the internet?)"; }
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
			else if (response.status < 500) {
				createToast({
					title: errorMessage,
					description: (await response.json()).error,
				});
			}
			else {
				createToast({
					title: errorMessage,
					description: apiErrorDescriptionToast,
					dump: await response.json(),
				});
			}

			return new Promise((_, reject) => reject("([khatch] handled)"));
		}
		throw error;
	}

	// if (response.status < 400)
	// { return response; }

	return response;
}

export function tab(e: KeyboardEvent) {
	const target = e.target as HTMLInputElement;
	target.focus();
	if (!document.execCommand || !document.execCommand("insertText", false, "\t")) {
		const start = target.selectionStart as number;
		target.value = target.value.substring(0, start) + "\t" + target.value.substring(target.selectionEnd as number);
		target.selectionStart = target.selectionEnd = start + 1;
		return "\t";
	}
}

export function abbreviate(value: number): string {
	if (value >= 1000000000)
	{ return `${Math.round(value / 100000000) / 10}B`; }
	if (value >= 1000000)
	{ return `${Math.round(value / 100000) / 10}M`; }
	if (value >= 1000)
	{ return `${Math.round(value / 100) / 10}K`; }
	return `${value}`;
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
			if (value < 9950)
			{ return `${(value / 1e3).toFixed(1)}KB`; }
			return `${Math.round(value / 1e3)}KB`; // necessary to avoid double check
		case 5:
			if (value >= 9995e2)
			{ return `${(value / 1e6).toFixed(1)}MB`; }
		case 4:
			return `${Math.round(value / 1e3)}KB`;
		case 6:
			if (value < 995e4)
			{ return `${(value / 1e6).toFixed(1)}MB`; }
			return `${Math.round(value / 1e6)}MB`; // necessary to avoid double check
		case 8:
			if (value >= 9995e5)
			{ return `${(value / 1e9).toFixed(1)}GB`; }
		case 7:
			return `${Math.round(value / 1e6)}MB`;
		case 9:
			if (value < 995e7)
			{ return `${(value / 1e9).toFixed(1)}GB`; }
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

const b64repl: { [k: string]: string } = { "-": "+", "_": "/" };
export function authCookie(cookie: string | null = null) {
	const token = cookie ?? getCookie("kh-auth");

	if (!token || token.length <= 10)
	{ return null; }

	const components: string[] = token.replace("-", "+").replace("_", "/").split(".");
	if (components.length !== 3) {
		return null;
	}

	const tokenVersion = atob(components[0]);

	if (tokenVersion !== "1")
	{ throw TypeError(`Cannot decode auth token with version: ${tokenVersion}`); }

	const payload = atob(components[1]).split(".").map(x => x.replace(/[-_]/g, m => b64repl[m[0]]));
	const miscPayload = atob(components[1]).match(/{.+}/);
	let misc: { [k: string]: any } = {};

	if (miscPayload) {
		misc = JSON.parse(miscPayload[0]);
	}

	const auth = {
		token,
		version: tokenVersion,
		algorithm: payload[0],
		keyId: int_from_bytes(atob(payload[1])),
		expires: new Date(int_from_bytes(atob(payload[2])) * 1000),
		userId: int_from_bytes(atob(payload[3])),
		guid: payload[4].replace(/\+/g, "-").replace(/\//g, "_"),
		isMod: misc?.scope?.includes("mod"),
		isAdmin: misc?.scope?.includes("admin"),
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

export const lazyConfig = {
	root:       null,
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
				if (src && !unloadable.has(src))
				{ target.src = src; }
				target.dataset.intersected = "";
				lazyObserver.unobserve(target);
			}
		});
	},
	lazyConfig,
);
