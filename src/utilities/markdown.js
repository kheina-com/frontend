import { getMediaUrl } from '@/utilities'


const htmlReplace = {
	// '&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};

const htmlEscapeCharacters = new Set(Object.values(htmlReplace));

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


const htmlRegex = new RegExp(`(?:${Object.keys(htmlReplace).join('|')})(?:.{0,4};)?`, 'g');
export function htmlEscape(html) {
	return html.replaceAll(htmlRegex, match => {
		if (match.length > 1 && htmlEscapeCharacters.includes(match))
		{ return match; }
		return htmlReplace[match];
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
			const rule = /^(\w*)@(\S+)/;
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
			const rule = /^:(\S+):/;
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
];
