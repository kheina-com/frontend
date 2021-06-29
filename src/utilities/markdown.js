import { getMediaThumbnailUrl, getMediaUrl, khatch } from '@/utilities';
import { postsHost, apiErrorDescriptionToast, apiErrorMessageToast } from '@/config/constants';
import store from '@/global';


const htmlReplace = {
	// '&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};

const htmlEscapeCharacters = new Set(Object.values(htmlReplace));

const htmlRegex = new RegExp(`(?:${Object.keys(htmlReplace).map(x => '\\' + x).join('|')})(?:.{0,4};)?`, 'g');

const mdReplace = {
	'#': '\\#',
	'|': '\\|',
	'^': '\\^',
	'{': '\\{',
	'}': '\\}',
	// '-': '\\-',
	'=': '\\=',
};

const mdEscapeCharacters = new Set(Object.values(mdReplace));

const mdRegex = new RegExp(`[^\\\\]?(?:${Object.keys(mdReplace).map(x => '\\' + x).join('|')})`, 'g');

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


export function htmlEscape(html) {
	return html.replaceAll(htmlRegex, match => {
		if (match.length > 1 && htmlEscapeCharacters.has(match))
		{ return match; }
		return htmlReplace[match];
	});
};


export function mdEscape(md) {
	return md.replaceAll(mdRegex, match => {
		if (match.length > 1 && mdEscapeCharacters.has(match))
		{ return match; }
		return match.length > 1 ? match.substring(0, 1) + mdReplace[match.substring(1)] : mdReplace[match];
	});
};


export const mdTokenizer = {
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


const mdMaxId = parseInt('ffffffff', 16);

const mdRefId = () => Math.round(Math.random() * mdMaxId).toString(16).padStart(8, 0);

const mdRequestCache = { };

const mdRequestCacheLimit = 100;

const mdMakeRequest = (url) => {
	while (Object.keys(mdRequestCache).length > mdRequestCacheLimit)
	{ delete mdRequestCache[Object.keys(mdRequestCache)[0]]; }

	const promise = new Promise(resolve => {

		if (mdRequestCache.hasOwnProperty(url))
		{
			resolve(mdRequestCache[url]);
			return;
		}
	
		khatch(url)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						// description exists in a lot of responses, and is almost always the biggest one
						// delete it just in case it exists to avoid taking up too much storage
						if (r.hasOwnProperty('description'))
						{ delete r.description; }
						mdRequestCache[url] = r;
						resolve(r);
						return;
					}
					else if (response.status < 500)
					{
						store.commit("createToast", {
							title: apiErrorMessageToast,
							description: r.error,
						});
					}
					else
					{
						store.commit("createToast", {
							title: apiErrorMessageToast,
							description: apiErrorDescriptionToast,
							dump: r,
						});
					}
					resolve();
				});
			})
				.catch(error => {
					console.error(error);
					store.commit("createToast", {
						title: apiErrorMessageToast,
						description: error,
					});
					resolve();
				});
	});

	return promise;
};

export const mdExtensions = [
	{
		name: 'handle',
		level: 'inline',
		start(src) {
			const rule = /(^|\s*)\w*@\S/
			const match = rule.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const rule = /^(\w*)@(\w+)/;
			const match = rule.exec(src);
			if (match && userLinks.hasOwnProperty(match[1]))
			{
				return {
					type: 'link',
					raw: match[0],
					text: match[0],
					href: `${userLinks[match[1]]}/${match[2]}`,
					tokens: [
						{
							type: 'text',
							raw: match[0],
							text: match[0],
						},
					],
				};
			}
		},
	},
	{
		name: 'emoji',
		level: 'inline',
		start(src) {
			const rule = /(^|\s*):/;
			const match = rule.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const rule = /^:([a-z-]+):/;
			const match = rule.exec(src);
			if (match)
			{
				return {
					type: 'emoji',
					raw: match[0],
					text: match[1],
					title: match[0],
					href: getMediaUrl('emoji', `${match[1]}.webp`),
				};
			}
		},
		renderer(token) {
			return `<img src="${token.href}" alt="${token.text}" title="${token.title}" class="emoji">`;
		},
	},
	{
		name: 'post',
		level: 'inline',
		start(src) {
			const rule = /(^|\s*)\^/;
			const match = rule.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const rule = /^\^([a-zA-Z0-9_-]{8})/;
			const match = rule.exec(src);

			if (match)
			{
				return {
					type: 'post',
					raw: match[0],
					text: match[1],
					href: getMediaThumbnailUrl(match[1]),
				};
			}
		},
		renderer(token) {
			const id = mdRefId();

			mdMakeRequest(`${postsHost}/v1/post/${token.text}`)
				.then(r => {
					const title = r?.title ? htmlEscape(r.title) : null;
					const element = document.getElementById(id);

					if (!element || !r)
					{ return; }

					element.innerHTML = `
<a id="${id}" class="post" href="/p/${token.text}">
<img src="${token.href}" alt="${title}" title="${title}">
${title ? '<p>' + title + '</p>' : ''}
</a>
					`.trim();
				});

			return `<span id="${id}">${token.raw}</span>`;
		},
	},
];
