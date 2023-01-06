import { apiErrorDescriptionToast, apiErrorMessageToast } from '@/config/constants';
import { v4 as uuid4 } from 'uuid';
import store from '@/global';


export default null;

import { cdnHost, environment } from '@/config/constants'
export function setCookie(name, value, maxage=86400, samesite='strict', path='/')
{
	if (store.state.cookiesAllowed)
	{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; ${environment !== 'local' ? 'secure' : ''}`; }
};

const ParserTypeMap = {
	[Boolean]: v => typeof(v) === 'string' ? 'false' !== v : Boolean(v),
};

export function getCookie(cookieName, default_value=null, type=null)
{
	let name = cookieName + '=';
	let ca = document.cookie.split(';');
	let value = default_value;
	for (let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
		{ c = c.substring(1); }
		if (c.indexOf(name) == 0)
		{
			value = decodeURIComponent(c.substring(name.length, c.length));
			break;
		}
	}

	if (type !== null)
	{ return ParserTypeMap[type](value); }

	return value;
};

export function deleteCookie(cookieName)
{ document.cookie = `${cookieName}=null; expires=${new Date(0)}; samesite=lax; path=/; secure`; };

export function setTitle(title)
{ document.title = title; }

import { routerMetaTag } from '@/config/constants'
export function setMeta(content)
{
	const tag = document.createElement('meta');

	Object.entries(content).forEach(pair => tag.setAttribute(pair[0], pair[1]));

	// We use this to track which meta tags we create, so we don't interfere with other ones.
	tag.setAttribute(routerMetaTag, '');

	document.head.appendChild(tag);
}

export function commafy(x)
{ // from https://stackoverflow.com/a/2901298
	let parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

let _getMediaUrl;
let _getMediaThumbnailUrl;

if (environment === 'local')
{
	_getMediaUrl = function(postId, filename)
	{ return `${cdnHost}/${postId}/${encodeURIComponent(filename)}?authorization=${store.state.auth?.token}`; }

	_getMediaThumbnailUrl = function(postId, resolution=800, extension='webp')
	{ return `${cdnHost}/${postId}/thumbnails/${resolution}.${extension}?authorization=${store.state.auth?.token}`; }
}
else
{
	_getMediaUrl = function(postId, filename)
	{ return `${cdnHost}/${postId}/${encodeURIComponent(filename)}`; }

	_getMediaThumbnailUrl = function(postId, resolution=800, extension='webp')
	{ return `${cdnHost}/${postId}/thumbnails/${resolution}.${extension}`; }
}

export const getMediaUrl = _getMediaUrl;
export const getMediaThumbnailUrl = _getMediaThumbnailUrl;

export function getEmojiUrl(emojiName)
{
	return `${cdnHost}/emoji/${encodeURIComponent(emojiName)}.webp`;
}

export function getIconUrl(postId, handle, extension='webp')
{
	return `${cdnHost}/${postId}/icons/${handle}.${extension}`;
}

export function getBannerUrl(postId, handle, extension='webp')
{
	return `${cdnHost}/${postId}/banners/${handle}.${extension}`;
}

export function round(num, precision)
{
	let multiplier = 10 ** precision;
	return Math.round(num * multiplier) / multiplier;
}

export const isMobile = navigator.userAgent.toLowerCase().includes('mobile');

export function tagSplit(tags)
{ return tags.split(/[,\s]/).filter(x => x).map(x => x.trim()); }

import { tagGroups } from '@/config/constants'
export function sortTagGroups(tags) {
	let sorted = { };
	tagGroups.forEach(i => {
		if (tags.hasOwnProperty(i))
		{ sorted[i] = tags[i]; }
	});
	return sorted;
}

export function createToast(options) {
	store.commit('createToast', options);
}

export function guid() {
	return btoa(String.fromCharCode.apply(null,
		uuid4().replace(/\r|\n|-/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' '))
	).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function saveToHistory(data) {
	if (!window.history.state)
	{ return; }
	history.replaceState(Object.assign(window.history.state, data), '');
}

const AuthRegex = /^(?:https:\/\/(?:[a-z0-9-_]+\.)*kheina\.com\/|http:\/\/localhost(?:\:\d{2,5})?\/|https:\/\/(?:[a-z0-9-_]+\.)*fuzz\.ly\/)/i;
export async function khatch(url, options={ })
{
	const attempts = options?.attempts || 1;
	const handleError = Boolean(options?.handleError || options?.errorMessage);
	const errorMessage = options?.errorMessage || apiErrorMessageToast;
	const errorHandlers = options?.errorHandlers || { };
	options.headers = options?.headers || { };

	if (url.match(AuthRegex))
	{
		options.credentials = 'include';
		const auth = store.state.auth?.token;
		if (auth)
		{ options.headers.authorization = 'bearer ' + auth; }
	}

	// options.headers['kh-trace'] = options.headers['kh-trace'] || options?.trace || uuid4();

	if (options.hasOwnProperty('body') && typeof(options.body) != 'string')
	{
		if (!options.hasOwnProperty('headers'))
		{ options.headers = { }; }
		options.headers['content-type'] = 'application/json';
		options.body = JSON.stringify(options.body);
	}

	if (options.hasOwnProperty('body') && !options?.method)
	{ options.method = 'POST'; }

	let attempt = 1;
	let response = null;
	let error = null;

	while (attempt <= attempts)
	{
		try {
			response = await fetch(url, options);
		}
		catch (e) {
			error = e;
			break;
		}

		// we only want to retry when we think it might succeed
		if (response.status <= 500)
		{ break; }

		await new Promise(r => setTimeout(r, attempt ** 2 * 1000));
		attempt++;
	}

	if (error)
	{
		if (handleError)
		{
			if (!response)
			{
				console.log(error)
				if (error.toString() === 'TypeError: NetworkError when attempting to fetch resource.')
				{ error = 'An unexpected error occurred during an API call. (Are you connected to the internet?)'; }
				store.commit('createToast', {
					title: errorMessage,
					description: error,
				});
			}
			else if (errorHandlers.hasOwnProperty(response.status))
			{
				if (errorHandlers[response.status])
				{ errorHandlers[response.status](response); }
			}
			else if (response.status < 400)
			{ return response; } // unreachable?
			else if (response.status < 500)
			{
				store.commit('createToast', {
					title: errorMessage,
					description: (await response.json()).error,
				});
			}
			else
			{
				store.commit('createToast', {
					title: errorMessage,
					description: apiErrorDescriptionToast,
					dump: await response.json(),
				});
			}

			return new Promise((_, reject) => reject());
		}
		else
		{ throw error; }
	}

	if (response.status < 400)
	{ return response; }

	if (response.status === 401)
	{ store.commit('setAuth', null); }

	return response;
}

export function abbreviate(value) {
	if (value >= 1000000000)
	{ return `${Math.round(value / 100000000) / 10}B`; }
	if (value >= 1000000)
	{ return `${Math.round(value / 100000) / 10}M`; }
	if (value >= 1000)
	{ return `${Math.round(value / 100) / 10}k`; }
	return `${value}`;
}

export function int_from_bytes(bytestring)
{
	let i = 0;
	let r = 0;
	bytestring.split('').reverse().map(x => x.charCodeAt(0)).forEach(x => {
		r += x * 2 ** (i++ * 8);
	});
	return r;
}

export function authCookie(cookie=null)
{
	const token = cookie ?? getCookie('kh-auth');

	if (!token || token.length <= 10)
	{ return null; }

	const components = token.replace('-', '+').replace('_', '/').split('.');

	const tokenVersion = atob(components[0]);

	if (tokenVersion !== '1')
	{ throw TypeError(`Cannot decode auth token with version: ${tokenVersion}`); }

	const payload = atob(components[1]).split('.').map(x => x.replace('-', '+').replace('_', '/'));
	const misc = JSON.parse(atob(components[1]).match(/{.+}/)[0]);

	const auth = {
		token,
		version: tokenVersion,
		algorithm: payload[0],
		keyId: int_from_bytes(atob(payload[1])),
		expires: new Date(int_from_bytes(atob(payload[2])) * 1000),
		userId: int_from_bytes(atob(payload[3])),
		guid: payload[4].replace(/\+/g, '-').replace(/\//g, '_'),
		isMod: misc?.scope?.includes('mod'),
		isAdmin: misc?.scope?.includes('admin'),
		...misc,
	};

	return auth;
}

const mdRegex = /\[.+?\]\((.+?)\)|#{1,6}\s*|`+/gi;
const mdRegex2 = /(\_{1,2}|\*{1,2})(.+?)\1/gi;

const linkRegex = /\((.+)\)/;

import emojiMap from '@/config/emoji';

const emojiRegex = new RegExp(
	':(?:' +
	Object.keys(emojiMap).join('|')
	+ '):',
	'gi'
)

export function demarkdown(string) {
	let str = string
		.replaceAll(emojiRegex, x => emojiMap[x.substring(1, x.length - 1)])
		.replaceAll(mdRegex, x => {
			const match = linkRegex.exec(x);
			if (match)
			{ return match[1]; }
			return '';
		});

	for (const m of str.matchAll(mdRegex2))
	{ str = str.replace(m[0], m[2]); }

	return str;
}

export function isDarkMode() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const lazyConfig = {
	root: null,
	rootMargin: '10%',
};

const unloadable = new Set(['null', 'undefined', null, undefined])

export const lazyObserver = new IntersectionObserver(
	e => {
		// console.log(e);
		e.forEach(entry => {
			if (entry.isIntersecting)
			{
				const src = entry.target.dataset.src;
				if (unloadable.has(src))
				{ entry.target.dataset.intersected = true; }
				else
				{ entry.target.src = src; }
				lazyObserver.unobserve(entry.target);
			}
		});
	},
	lazyConfig,
);
