import { apiErrorDescriptionToast, apiErrorMessageToast } from '@/config/constants';
import { v4 as uuid4 } from 'uuid';
import store from '@/global';


export default null;

import { cdnHost, environment } from '@/config/constants'
export function setCookie(name, value, maxage=86400, samesite='strict', path='/')
{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; ${environment !== 'local' ? 'secure' : ''}`; };

export function getCookie(cookieName, default_value=null)
{
	let name = cookieName + '=';
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
		{ c = c.substring(1); }
		if (c.indexOf(name) == 0)
		{ return decodeURIComponent(c.substring(name.length, c.length)); }
	}
	return default_value;
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
	let parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

export function getMediaUrl(postId, filename)
{
	return `${cdnHost}/${postId}/${filename}`;
}

export function getEmojiUrl(emojiName)
{
	return `${cdnHost}/emoji/${emojiName}.webp`;
}

export function getMediaThumbnailUrl(postId, resolution=800, extension='webp')
{
	return `${cdnHost}/${postId}/thumbnails/${resolution}.${extension}`;
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
{
	return tags.split(/[,\s]/).filter(x => x).map(x => x.trim());
}

import { tagGroups } from '@/config/constants'
export function sortTagGroups(tags)
{
	let sorted = { };
	tagGroups.forEach(i => {
		if (tags.hasOwnProperty(i))
		{ sorted[i] = tags[i]; }
	});
	return sorted;
}

export function createToast(options)
{
	store.commit('createToast', options);
}

export function guid()
{
	return btoa(String.fromCharCode.apply(null,
		uuid4().replace(/\r|\n|-/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' '))
	).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function khatch(url, options={ })
{
	const attempts = options?.attempts || 1;
	const handleError = Boolean(options?.handleError || options?.errorMessage);
	const errorMessage = options?.errorMessage || apiErrorMessageToast;
	const errorHandlers = options?.errorHandlers || { };

	if (url.match(/https:\/\/(?:\w+\.)?kheina.com\/|http:\/\/localhost/))
	{
		const headers = options?.headers || { };
		const auth = store.state.auth?.token;

		if (auth)
		{
			headers.authorization = 'bearer ' + auth;
			options.credentials = 'include';
		}
		options.headers = headers;
	}

	// options.headers.trace = options.headers?.trace || options?.trace || uuid4();

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
	let response;
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

	if (response.status < 400)
	{ return response; }

	if (response.status === 401)
	{ store.commit('setAuth', null); }

	if (handleError)
	{
		if (error)
		{
			console.error(error);
			store.commit('createToast', {
				title: apiErrorMessageToast,
				description: error,
			});
		}
		else if (errorHandlers.hasOwnProperty(response.status))
		{
			if (errorHandlers[response.status])
			{ errorHandlers[response.status](response); }
		}
		else if (response.status < 400)
		{ return response; }
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

		throw Error('Request Failed (handled).');
	}

	if (error)
	{ throw error; }

	return response;
}

export function abbreviate(value) {
	if (value > 1000000000)
	{ return `${Math.round(value / 10000000) / 100}B`; }
	if (value > 1000000)
	{ return `${Math.round(value / 10000) / 100}M`; }
	if (value > 1000)
	{ return `${Math.round(value / 10) / 100}k`; }
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

	const auth = {
		token,
		version: tokenVersion,
		algorithm: payload[0],
		keyId: int_from_bytes(atob(payload[1])),
		expires: new Date(int_from_bytes(atob(payload[2])) * 1000),
		userId: int_from_bytes(atob(payload[3])),
		guid: payload[4].replace(/\+/g, '-').replace(/\//g, '_'),
		...JSON.parse(atob(components[1]).match(/{.+}/)[0]),
	};

	return auth;
}

const mdRegex = /\[.+?\]\((.+?)\)|#{1,6}\s*|`+/gi

const linkRegex = /\((.+)\)/;

import emojiMap from '@/config/emoji';

const emojiRegex = new RegExp(
	':(?:' +
	Object.keys(emojiMap).join('|')
	+ '):',
	'gi'
)

export function demarkdown(string) {
	return string
		.replaceAll(emojiRegex, x => emojiMap[x.substring(1, x.length - 1)])
		.replaceAll(mdRegex, x => {
			const match = linkRegex.exec(x);
			if (match)
			{ return match[1]; }
			return '';
		});
}

export function isDarkMode() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const lazyConfig = {
	root: null,
	rootMargin: '10%',
};

export const lazyObserver = new IntersectionObserver(
	e => {
		// console.log(e);
		e.forEach(entry => {
			if (entry.isIntersecting)
			{
				entry.target.src = entry.target.dataset.src || '';
				lazyObserver.unobserve(entry.target);
			}
		});
	},
	lazyConfig,
);
