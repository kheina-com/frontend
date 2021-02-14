export default 0;

export function setCookie(name, value, maxage=86400, samesite='strict', path='/')
{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=${samesite}; path=${path}; secure`; };

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

export function getMediaThumbnailUrl(postId, resolution=800)
{
	return `https://cdn.kheina.com/file/kheina-content/${postId}/thumbnails/${resolution}.jpg`;
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
	return tags.split(',').map(x => x.trim());
}

export function sortTagGroups(tags)
{
	let sorted = { };
	['artist', 'sponsor', 'participant', 'species', 'gender', 'misc']
	.forEach(i => {
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

export function khatch(url, options={ })
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
	console.log(options);

	return fetch(url, options);
}

const userLinks = {
	'': '', // default
	t: 'https://twitter.com',
	fa: 'https://www.furaffinity.net/user',
	f: 'https://www.facebook.com',
	u: 'https://www.reddit.com/u',
	tw: 'https://www.twitch.tv',
	yt: 'https://www.youtube.com/c',
};

export const markdownTokenizer = {
	url(src) {
		const match = src.match(/^(\w*)([@#%^&:])([^\s\.]+)(\.[^\s]+)?/);
		if (match) {
			// console.log(`match: ${match[0]}`);
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
			break;
				case ':':
					if (match[1].length != 0 || !match[4].endsWith(':'))
					{ return false; }
					// check if emoji exists
					
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
	// codespan(src) {
	// 	console.log(`source: ${src}`);
	// 	const match = src.match(/\$+([^\$\n]+?)\$+/);
	// 	if (match) {
	// 		return {
	// 		type: 'codespan',
	// 		raw: match[0],
	// 		text: match[1].trim()
	// 		};
	// 	}
	// 	// return false to use original codespan tokenizer
	// 	return false;
	// },
};
