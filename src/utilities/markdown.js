import { getMediaThumbnailUrl, getMediaUrl, khatch } from '@/utilities';
import { postsHost, usersHost, apiErrorDescriptionToast, apiErrorMessageToast, environment } from '@/config/constants';
import store from '@/global';
import router from '@/router';


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
	'': ['', null], // default
	t: ['https://twitter.com', 'twitter'],
	fa: ['https://www.furaffinity.net/user', 'furaffinity'],
	f: ['https://www.facebook.com', 'facebook'],
	u: ['https://www.reddit.com/u', 'reddit'],
	tw: ['https://www.twitch.tv', 'twitch'],
	yt: ['https://www.youtube.com/c', 'youtube'],
	tg: ['https://t.me', 'telegram'],
	p: ['https://www.patreon.com', 'patreon'],
	pi: ['https://www.picarto.tv', 'picarto'],
	kf: ['https://ko-fi.com', 'ko-fi'],
	gr: ['https://gumroad.com', 'gumroad'],
	st: ['https://subscribestar.adult', 'subscribestar'],
};

const mdMaxId = 0xffffffff;

const mdRefId = () => Math.round(Math.random() * mdMaxId).toString(16).padStart(8, 0);

const mdRequestCache = { };

const mdRequestCacheLimit = 100;

let tempUrl = null;

switch (environment)
{
	case 'local':
		tempUrl = /https?:\/\/localhost(?:\:\d{1,4})?/;
		break;

	case 'dev':
		tempUrl = /https?:\/\/dev\.kheina\.com/;
		break;

	case 'prod':
		tempUrl = /https?:\/\/kheina\.com/;
		break;
}

const url = new RegExp(`^${tempUrl.source}|^\/`);


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


const mdMakeRequest = (url, silent=false) => {
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
					else if (silent)
					{ }
					else if (response.status < 500)
					{
						store.commit('createToast', {
							title: apiErrorMessageToast,
							description: r.error,
						});
					}
					else
					{
						store.commit('createToast', {
							title: apiErrorMessageToast,
							description: apiErrorDescriptionToast,
							dump: r,
						});
					}
					mdRequestCache[url] = null;
					resolve();
				});
			}).catch(error => {
				console.error(error);
				store.commit('createToast', {
					title: apiErrorMessageToast,
					description: error,
				});
				resolve();
			});
	});

	return promise;
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


export const mdRenderer = {
	link(href, title, text) {
		const id = mdRefId();

		if (href.match(url))
		{
			setTimeout(() => {
				const element = document.getElementById(id);
				element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(href); })
			}, 0);
		}
		else
		{
			setTimeout(() => {
				const element = document.getElementById(id);
				element.addEventListener('click', e => e.stopPropagation())
			}, 0);
		}

		return `<a href="${htmlEscape(href)}" id="${id}" title="${title}">${text || href}</a>`;
	},
};


const mdRules = {
	whitespace: {
		start: /^\n[ ]+|[ ]{2,}/,
		rule: /^(\n)?([ ]+)/,
	},
	handle: {
		start: /(^|\s*)\w*@\S/,
		rule: /^(\w*)@(\w+)/,
	},
	emoji: {
		start: /(^|\s*):([a-z0-9\-]+):/,
		rule: /^:([a-z0-9\-]+):/,
	},
	gigamoji: {
		start: /(\s*\n):/,
		rule: /^\s*((?::[a-z0-9\-]+:)+)(?:$|\n)/,
		single: /^:([a-z0-9\-]+):/,
	},
	post: {
		start: /(^|\s*)\^/,
		rule: /^\^([a-zA-Z0-9_-]{8})(?=[^a-zA-Z0-9_-]|$)/,
	},
};

import emojiMap from '@/config/emoji';

export const mdExtensions = [
	{
		name: 'handle',
		level: 'inline',
		start(src) {
			const match = mdRules.handle.start.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const match = mdRules.handle.rule.exec(src);

			if (match)
			{
				if (userLinks.hasOwnProperty(match[1]))
				{
					const link = userLinks[match[1]];
					return {
						type: 'handle',
						raw: match[0],
						text: link[1] ? match[2] : match[0],
						title: match[0],
						href: `${link[0]}/${match[2]}`,
						icon: getMediaUrl('emoji', `${link[1]}.webp`),
						username: match[2],
					};
				}
				else
				{
					return {
						type: 'text',
						raw: match[0],
						text: match[0],
					};
				}
			}
		},
		renderer(token) {
			const id = mdRefId();

			if (token.raw[0] === '@')
			{
				mdMakeRequest(`${usersHost}/v1/fetch_user/${token.username}`, true).then(r => {
					const element = document.getElementById(id);
					if (r)
					{ element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(token.href); }) }
					else
					{ element.outerHTML = `<span id="${id}" title="${token.title}">${token.text}</span>`; }
				});
			}
			else
			{
				setTimeout(() => {
					const element = document.getElementById(id);
					element.addEventListener('click', e => e.stopPropagation())
				}, 0);

				return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}"><img src="${token.icon}" class="emoji handle-icon">${token.text}</a>`;
			}

			return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}">${token.text}</a>`;
		},
	},
	{
		name: 'emoji',
		level: 'inline',
		start(src) {
			const match = mdRules.emoji.start.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const match = mdRules.emoji.rule.exec(src);

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
			return `<img src="${token.href}" alt="${emojiMap[token.text] || token.text}" title="${token.title}" class="emoji">`;
		},
	},
	{
		name: 'gigamoji',
		level: 'block',
		start(src) {
			const match = mdRules.gigamoji.start.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			let match = mdRules.gigamoji.rule.exec(src);

			if (!match)
			{ return; }

			const raw = match[0];
			src = match[1];
			const tokens = [];

			while (src)
			{
				match = mdRules.gigamoji.single.exec(src);
				src = src.substr(match[0].length);
				tokens.push({
					type: 'emoji',
					raw: match[0],
					text: match[1],
					title: match[0],
					href: getMediaUrl('emoji', `${match[1]}.webp`),
				});
			}
			return {
				type: 'gigamoji',
				raw,
				tokens,
			};
	},
		renderer(token) {
			let rendered = '<p class="gigamoji">';
			for (const t of token.tokens)
			{ rendered += `<img src="${t.href}" alt="${emojiMap[t.text] || t.text}" title="${t.title}">`; }
			return rendered + '</p>';
		},
	},
	{
		name: 'post',
		level: 'inline',
		start(src) {
			const match = mdRules.post.start.exec(src);
			return match ? match.index + match[1].length : null;
		},
		tokenizer(src) {
			const match = mdRules.post.rule.exec(src);

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

					element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push('/p/' + token.text); })
				});

			return `<span id="${id}">${token.raw}</span>`;
		},
	},
];
