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

export function edit(regex, opt)
{ // from https://github.com/markedjs/marked/blob/1aba5689a9a292912f876549360c25139a4102d9/src/helpers.js
	regex = regex.source || regex;
	opt = opt || '';
	const obj = {
		replace: (name, val) => {
			val = val.source || val;
			regex = regex.replace(name, val);
			return obj;
		},
		getRegex: () => {
			return new RegExp(regex, opt);
		}
	};
	return obj;
}

export async function khatch(url, options={ })
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

	let response = await fetch(url, options);

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

const htmlReplace = {
	// '&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};
const htmlEscapeCharacters = new Set(Object.values(htmlReplace));

const htmlRegex = new RegExp(`(?:${Object.keys(htmlReplace).join('|')})(?:.{0,4};)?`, 'g');
export function htmlEscape(html) {
	return html.replaceAll(htmlRegex, match => {
		if (match.length > 1 && htmlEscapeCharacters.includes(match))
		{ return match; }
		return htmlReplace[match];
	});
};

const userLinks = {
	'': '', // default
	t: 'https://twitter.com',
	fa: 'https://www.furaffinity.net/user',
	f: 'https://www.facebook.com',
	u: 'https://www.reddit.com/u',
	tw: 'https://www.twitch.tv',
	yt: 'https://www.youtube.com/c',
	tg: 'https://t.me',
};

export const markdownTokenizer = {
	url(src) {
		const match = src.match(/^(\w*)([@#%:^])([^\s\.]+)(\.[^\s]+)?/);
		if (match) {
			switch (match[2]) {
				case '@':
					if (userLinks.hasOwnProperty(match[1]))
					{
						return {
							type: 'link',
							raw: match[0],
							text: match[0],
							href: `${userLinks[match[1]]}/${match[3]}`,
							tokens: [
								{
									type: 'text',
									raw: match[0],
									text: match[0],
								},
							],
						};
					}
					else if (!match[4])
					{
						return {
							type: 'text',
							raw: match[0],
							text: match[0],
						};
					}
				break;

				case '^':
					if (match[3].length === 8)
					{
						return {
							type: 'link',
							raw: match[0],
							text: match[0],
							href: `/p/${match[3]}`,
							tokens: [
								{
									type: 'text',
									raw: match[0],
									text: match[0],
								},
							],
						};
					}
					return {
						type: 'text',
						raw: match[0],
						text: match[0],
					};

				case ':':
					if (match[1].length != 0 || match[4])
					{ return false; }
					else if (!match[3].endsWith(':'))
					{
						return {
							type: 'text',
							raw: match[0],
							text: match[0],
						};
					}
					else
					{
						const emoji = match[3].substring(0, match[3].length - 1);

						// check if emoji exists

						return {
							type: 'image',
							raw: match[0],
							text: emoji,
							title: `:${emoji}:`,
							href: getMediaUrl('emoji', `${emoji}.webp`),
						};
					}
				break;

				default:
					return {
						type: 'text',
						raw: match[0],
						text: match[0],
					};
			}
		}
		return false;
	},
	html(src) {
		const match = src.match(/^.*?\n?.*?<[\s\S]+?>/);
		if (match)
		{
			return {
				type: 'text',
				raw: match[0],
				text: htmlEscape(match[0]),
			};
		}
		return false;
	},
};
