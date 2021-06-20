export default 0;

import { environment } from '@/config/constants'
export function setCookie(name, value, maxage=86400, samesite='strict', path='/')
{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; ${environment !== 'local' ? 'secure' : ''}`; };

export function getCookie(cookieName)
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
	return null;
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
};

export function getMediaUrl(postId, filename)
{
	return `https://cdn.kheina.com/file/kheina-content/${postId}/${filename}`;
}

export function getMediaThumbnailUrl(postId, resolution=800, extension='webp')
{
	return `https://cdn.kheina.com/file/kheina-content/${postId}/thumbnails/${resolution}.${extension}`;
}

export function round(num, precision)
{
	let multiplier = 10 ** precision;
	return Math.round(num * multiplier) / multiplier;
}

export function isMobile()
{
	return navigator.userAgent.toLowerCase().includes('mobile');
}

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

export async function khatch(url, options={ }, attempts=3)
{
	if (url.match(/https:\/\/(?:\w+\.)?kheina.com|http:\/\/localhost/))
	{
		let headers = { };
		if (options.hasOwnProperty('headers'))
		{ headers = options.headers; }
		let auth = getCookie('kh-auth');
		if (auth)
		{
			headers.Authorization = auth;
			options.credentials = 'include';
		}
		options.headers = headers;
	}

	if (options.hasOwnProperty('body') && typeof(options.body) != 'string')
	{
		if (!options.hasOwnProperty('headers'))
		{ options.headers = { }; }
		options.headers['Content-Type'] = 'application/json';
		options.body = JSON.stringify(options.body);
	}

	let attempt = 1;
	let response;

	while (attempt <= attempts)
	{
		response = await fetch(url, options);

		// we only want to retry when we think it might succeed
		if (response.status <= 500)
		{ break; }

		await new Promise(r => setTimeout(r, attempt ** 2 * 1000));
	}

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

export function authCookie()
{
	let auth = getCookie('kh-auth');
	if (!auth)
	{ return null; }
	return JSON.parse(atob(auth.split('.')[1]).match(/{.+}/)[0]);
}
