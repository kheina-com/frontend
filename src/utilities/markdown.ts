import { getMediaThumbnailUrl, getEmojiUrl, getIconUrl, khatch } from '@/utilities';
import { type Emoji } from '@/utilities/emoji';
import { host, apiErrorDescriptionToast, apiErrorMessageToast, environment, iconShortcode } from '@/config/constants';
import { type Tokens, type TokenizerAndRendererExtension } from 'marked';
import defaultUserIcon from '$/default-icon.png?url';
import defaultEmoji from '$/default-emoji.png?url';
import store from '@/globals';
import router from '@/router';


                                                       /*::/++++++++ooo++/:.
                                              -//+yhdNNMMMMMMMMMMMMMMMMMMMMMNNmhyys/.
                                       .-/oymmNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh
                                  .-/ydNNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMs
                              .:sdmNMMMMMMMMMMMMMMMMMMMMMMMMMMNNMMMMMMMMMMMMMMMMMMMM.
                          `-+hmNMMMMMMMMMMMMMMMMNNdyyhs+o+----..----//+oyydmNMMMMMMm
                       .-sdNMMMMMMMMMMMMMNmhy++--.`   `               `   ``.-osdmNs
                    `:smMMMMMMMMMMMMMMdy:.`                        ohyy++::.`   `.-.
                  .odMMMMMMMMMMNNho:::`         -yyyso`            yMMMMMMNNdy/..
               `-sNMMMMMMMMMNds-.               :MMMMM/            yMMMMMMMMMMMMNs/`
             `:dMMMMMMMMMMho-``                 :MMMMM/            yMMMMMMMMMMMMMMMmy:`
            /mMMMMMMMMNd+/.                      MMMMM:            odNMMMMMMMMMMMMMMMMd/`
          :mMMMMMMMMd+`                    /d/:  mMMMM:               -//oydMMMMMMMMMMMMmo
        .sMMMMMMMMN/                      dMMMNy dMMMM-                      :ohNMMMMMMMMMN:
       -mMMMMMMNh+`                       -dNmy` hMMMM.                        ``oomMMMMMMMNh
     `yNMMMMMMhs.                    .    .o::-  sMMMM-                            `/dMMMMMMMd`
    `hMMMMMMms.                    smNms` hMNNN: +MMMM:                              `:mMMMMMMh-
   .dMMMMMMm.`            `-..     dMMMM:`hMMMM: /MMMM-                                `smMMMMMm.
  `yMMMMMMo-              sNNm+    dMMMM: hMMMM- :MMMM`                                  .mMMMMMm
  sMMMMMN+        -shddho \NMMNy`  +MMMM+ yMMMM- -MMMM                  ````               .hMMMMN-
 -NMMMMm:       `sNMMNNMMm sNMMMy. -MMMM/ oMMMM.  MMMM                 `hddds`              -hMMMMy
 hMMMMm:        yMMMMssMMh `/NMMMd. NMMM/ +MMMN   NMMM                 `MMMMM-    `...`      .NMMMm
:MMMMM-`       +MMM*  mMN+   sMMMMm+mMMM+ /MMMm   mMMm      `          NMMMM-  `ohmNmmo`      oMMMM
hMMMMs         dMMMMdMMmo.    oNMMMNMMMM/ :MMMm   :///    -yhs`        mMMMM  :mMMMm:NMy      .MMMM:
mMMMN.         mMMMMdy/-       +MMMMMMMN- .+++:          /NMMMd-      /MMMMM -mMMM. .NMs       mMMM-
dMMMh          mMMMd  /yhy      /mNMMNdo                  /NNy:    -smMMMMMM yMMMM::mMd        dMMM:
hMMM+          sMMMNomMMMN                          /mmNh syy+-   oNMMMMMMMM mMMMNdMMs-        MMMM.
dMMM+           hMMMMMMMN+                        .hMMMMd mMMMo  sMMMMhMMMMm mMMMMs/`         +MMMm
hMMMo           `:shhhyo`   .ymh+-.            `sNMMMMm:  mMMM+ :MMMMs.NMMMm mMMMy`:oyhh      dMMMd
sMMMm              ```      sMMMNm .mmmm -oss. +MMMMNh.   mMMM+ hMMMN` mMMMd sMMMNdNMMMd     :MMMN-
-MMMM.                      .sys/. yMMMMyNMMMN.+NMMMh.    mMMM/ NMMMd +MMMMm `yNMMMMMNy.    .dMMMh
 hMMMh                      .mmy-  yMMMMMMMMMMo :dMMMds.  mMMM: mMMMdyMMMMMd  `./s+s/-     .hMMMN`
 -MMMMs                     /MMMM` yMMMMdoNMMMy  -ymMMMd: mMMM: sMMMMMMNMMMs              `hMMMM+
  yMMMM+                    /MMMM  yMMMm` sMMMm    -MMMMm mMMM: .dMMMms+MMMo             .dMMMMo`
  `mMMMMo`                  /MMMN  yMMMy  +MMMN   :dMMMMh NMMM:  .:o:. .sddy           `/NMMMMd`
   -NMMMMd`                 /MMMm  yMMM/  `MMMM` :NMMMMd` ://:     `       `         `:dMMMMNh`
    :mMMMMN/                /MMMm  yMMM/   mMMM:.NMMMNs`                          `/dMMMMMm/
     :dMMMMMd+              /MMMm  yMMM:   oMMM; dNNm:`                          +dMMMMMMy:
      :dMMMMMMN/            /MMMd  :sy+.    :h+`                              -hNMMMMMMh/
       `/NMMMMMMNo-         oNMMh                                          -sNMMMMMMMh+.
          sNMMMMMMMh+-       -:-                                       -:ymMMMMMMMNs+.
           /smMMMMMMMNdh:.                                        `./ymNMMMMMMMNN/``
             `+NMMMMMMMMNNds/:-`                            .-:/ydmNMMMMMMMMNdo.`
               -/smMMMMMMMMMMNNmhhoo:::--..........::::+sydmNNMMMMMMMMMMNms+.`
                  ./odmMMMMMMMMMMMMMMMMNNNmmNmmmmNNMMMMMMMMMMMMMMMMNNdyo-.
                     `.-+hdNNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNmdhs/-.`
                          `.-:sdhddmNNNMMMMMMMMMMMMNNNmdhyo+--.`
                                   `---:::+++++++++::*/


const htmlReplace: { [k: string]: string } = {
	// '&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};

const htmlEscapeCharacters = new Set(Object.values(htmlReplace));

const htmlRegex = new RegExp(`(?:${Object.keys(htmlReplace).map(x => '\\' + x).join('|')})(?:.{0,4};)?`, 'g');

const mdReplace: { [k: string]: string } = {
	'#': '\\#',
	'|': '\\|',
	'^': '\\^',
	'{': '\\{',
	'}': '\\}',
	// '-': '\\-',
	'=': '\\=',
	'<': '&lt;',
	'>': '&gt;',
};

const mdEscapeCharacters = new Set(Object.values(mdReplace));

const mdRegex = new RegExp(`[^\\\\]?(?:${Object.keys(mdReplace).map(x => '\\' + x).join('|')})`, 'g');

const userLinks: { [k: string]: [string, string | null]} = {
	// shortcode: [url, emoji]
	// links get formatted as url + username
	'': ['/', null], // default
	[iconShortcode]: ['/', null],  // unique case, this loads icons
	t:  ['https://twitter.com/',              'twitter'],
	fa: ['https://www.furaffinity.net/user/', 'furaffinity'],
	f:  ['https://www.facebook.com/',         'facebook'],
	u:  ['https://www.reddit.com/u/',         'reddit'],
	tw: ['https://www.twitch.tv/',            'twitch'],
	yt: ['https://www.youtube.com/c/',        'youtube'],
	tt: ['https://www.tiktok.com/@',          'tiktok'],
	tg: ['https://t.me/',                     'telegram'],
	p:  ['https://www.patreon.com/',          'patreon'],
	pi: ['https://www.picarto.tv/',           'picarto'],
	kf: ['https://ko-fi.com/',                'ko-fi'],
	gr: ['https://gumroad.com/',              'gumroad'],
	st: ['https://subscribestar.adult/',      'subscribestar'],
	rf: ['https://ref.st/',                   'refsheet'],
	pp: ['https://www.paypal.me/',            'paypal'],
	fn: ['https://www.furrynetwork.com/',     'furrynetwork'],
	w:  ['https://www.weasyl.com/~',          'weasyl'],
	b:  ['https://boosty.to/',                'boosty'],
	th: ['https://toyhou.se/',                'toyhouse'],
	cm: ['https://commiss.io/',               'commissio'],
	ig: ['https://www.instagram.com/',        'instagram'],
	tm: ['https://www.tumblr.com/',           'tumblr'],
	vk: ['https://vk.com/',                   'vk'],
};

const mdMaxId = 0xffffffff;

const mdRefId = () => Math.round(Math.random() * mdMaxId).toString(16).padStart(8, "0");

const mdRequestCache: { [url: string]: any } = { };

const mdRequestCacheLimit = 100;

const mdEmojiCache: { [emoji: string]: Emoji | null } = { };

let tempUrl = null;

switch (environment) {
	case 'local':
		tempUrl = /https?:\/\/localhost(?:\:\d{1,4})?/;
		break;

	case 'dev':
		tempUrl = /https:\/\/dev\.fuzz\.ly/;
		break;

	case 'prod':
	default:
		tempUrl = /https:\/\/fuzz\.ly/;
		break;
}

const url = new RegExp(`^${tempUrl.source}\/|^\/`);


export function htmlEscape(html: string): string {
	return html.replaceAll(htmlRegex, match => {
		if (match.length > 1 && htmlEscapeCharacters.has(match)) return match;

		return htmlReplace[match];
	});
};


export function mdEscape(md: string): string {
	return md.replaceAll(mdRegex, match => {
		if (match.length > 1 && mdEscapeCharacters.has(match)) return match;

		return match.length > 1 ? match.substring(0, 1) + mdReplace[match.substring(1)] : mdReplace[match];
	});
};

const mdEmojiUrl = (emoji: string) => {
	// TODO: this is a PRIME candidate for an indexeddb
	return new Promise<Emoji>((resolve, reject) => {
		const cached = mdEmojiCache[emoji];
		if (cached) {
			// a render must occur, queue the execution
			setTimeout(() => resolve(cached), 0);
			return;
		}
		else if (cached === null) {
			// a render must occur, queue the execution
			setTimeout(reject, 0);
			return;
		}

		khatch(`${host}/v1/emoji/${emoji}`, {
			errorHandlers: {
				404: () => {
					mdEmojiCache[emoji] = null;
					reject();
				},
			},
		}).then(r => r.json())
		.then(r => {
			mdEmojiCache[emoji] = r;
			resolve(r);
		}).catch(reject);
	});
}

// return a rendered html img element as a string containing the formatted emoji
export const emoji = (emoji: string): string => {
	const id = mdRefId();

	mdEmojiUrl(emoji)
	.then(r => {
		const element = document.getElementById(id) as HTMLImageElement;
		if (!element) return;

		element.addEventListener("error", e => element.src = defaultEmoji, { once: true });
		element.addEventListener("load", e => element.className = "emoji");

		element.src = getEmojiUrl(r.filename);
		element.alt = r.alt ?? element.alt;
	}).catch(() => {
		const element = document.getElementById(id) as HTMLImageElement;
		if (!element) return;

		element.addEventListener("load", e => element.className = "emoji");
		element.src = defaultEmoji;
	});

	return `<img id="${id}" alt="${emoji}" title=":${emoji}:" class="emoji loading wave">`;
};

const mdMakeRequest = (url: string, silent=false) => {
	while (Object.keys(mdRequestCache).length > mdRequestCacheLimit) {
		delete mdRequestCache[Object.keys(mdRequestCache)[0]];
	}

	return new Promise<object | void>(resolve => {
		if (mdRequestCache.hasOwnProperty(url)) {
			return resolve(mdRequestCache[url]);
		}

		khatch(url).then(response => {
			if (response.status === 204) {
				return resolve();
			}

			response.json().then((r: any) => {
				if (response.status < 300) {
					// description exists in a lot of responses, and is almost always the biggest one
					// delete it just in case it exists to avoid taking up too much storage
					if (r.hasOwnProperty('description')) delete r.description;
					mdRequestCache[url] = r;
					return resolve(r);
				}
				else if (silent)
				{ }
				else if (response.status < 500) {
					store().createToast({
						title: apiErrorMessageToast,
						description: r?.error,
					});
				}
				else {
					store().createToast({
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
			store().createToast({
				title: apiErrorMessageToast,
				description: error,
			});
			resolve();
		});
	});
};


const mdRegex1 = /\[.+?\]\((.+?)\)|#{1,6}\s*|`+/gi;
const mdRegex2 = /(\_{1,2}|\*{1,2})(.+?)\1/gi;
const linkRegex = /\((.+)\)/;

export function demarkdown(string: string): Promise<string> {
	return new Promise<string>(resolve => {
		let emojis = 0;
		let str = string.replaceAll(mdRules.emoji.standalone, m => {
			emojis++;
			const id = "<" + mdRefId() + ">";

			mdEmojiUrl(m.slice(1, -1))
			.then(r => str = str.replace(id, r.alt ?? "❌"))
			.catch(() => str = str.replace(id, "❌"))
			.finally(() => {
				if (!--emojis) resolve(str);
			});

			return id;
		}).replaceAll(mdRegex1, m => {
			const match = linkRegex.exec(m);
			if (match) return match[1];
			return "";
		}).replaceAll(mdRegex2, m => m[2]);

		if (!emojis) resolve(str);
	});
}


export const mdTokenizer = {
	emStrong(src: string) {
		// this prevents marked from rendering *furry rp text*
		if (!src.match(/^\*[^\*]/)) return false;

		return {
			type: "text",
			raw: "*",
			text: "*",
		};
	},
};

export const mdRenderer = {
	html: htmlEscape,
	link(href: string, title: string, text: string) {
		const id = mdRefId();

		if (href.match(url)) {
			setTimeout(() => {
				const element = document.getElementById(id) as HTMLAnchorElement;
				if (!element) return;

				element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(href); });
			}, 0);

			return `<a href="${htmlEscape(href)}" id="${id}" title="${title || href}">${text || href}</a>`;
		}
		else if (href.startsWith("#")) {
			setTimeout(() => {
				const element = document.getElementById(id) as HTMLAnchorElement;
				if (!element) return;

				element.addEventListener('click', e => e.stopPropagation());
			}, 0);

			return `<a href="${htmlEscape(href)}" id="${id}" title="${title || href}">${text || href}</a>`;
		}
		else {
			setTimeout(() => {
				const element = document.getElementById(id) as HTMLAnchorElement;
				if (!element) return;

				element.target = '_blank';
				element.addEventListener('click', e => e.stopPropagation());
			}, 0);

			return `<a href="${htmlEscape(href)}" id="${id}" class="external-link" title="${title || href}">${text || href}</a>`;
		}
	},
};


const mdRules = {
	handle: {
		start: /(^|\s*)\w*@[\w_-]/,
		rule: /^(\w*)@([\w_-]+)/,
	},
	icon: {
		start: /(^|\s*)\[@\]\w/,
		rule: /^\[@\](\w+)/,
	},
	emoji: {
		start: /(^|\s*):([a-z0-9\-\.]+):/,
		rule: /^:([a-z0-9\-\.]+):/,
		standalone: /:([a-z0-9\-\.]+):/g,
	},
	post: {
		start: /(^|\s*)\^/,
		rule: /^\^([a-zA-Z0-9_-]{8})(?=[^a-zA-Z0-9_-]|$)/,
	},
	gigamoji: {
		start: /(\s*\n):/,
		rule: /^\n?([^\S\n]*)((?::[a-z0-9\-\.]+:[^\S\n]*)+)(?:$|\n)/,
		single: /^(:([a-z0-9\-\.]+):)(\s*)/,
	},
	alignment: {
		start: /(?:^|\n)[><]/,
		rule: /^(>|<) ?([^\n]+) ?(>|<)((?:\n(?:(?![><])|\1) ?(?:[^\n]*[^><\n]|$) ?(?:(?![><])|\3)(?=\n|$))*)(?:$|\n)/,
		center: /> ?([^\n]+) ?<|([^\n]+)(?=$|\n)/g,
		right: /(>?) ?([^\n]+?) ?\1(?=$|\n)/g,
		left: /(<?) ?([^\n]+?) ?\1(?=$|\n)/g,
	},
	tag: {
		start: /(^|\s+)\#/,
		rule: /^\#([^\s0-9\#][^\s\#]*)/i,
	},
	color: {
		start: /(^|\s+)\%\w+/,
		rule: /^\%(\w+)\s+(.+?)\s+\%/,
	},
};


interface HandleToken extends Tokens.Generic {
	type:     "handle",
	raw:      string,
	text:     string,
	title:    string,
	href:     string,
	code:     string,
	icon:     string | null,
	username: string,
}

interface PostToken extends Tokens.Generic {
	type: "post",
	raw:  string,
	text: string,
	href: string,
}

interface TagToken extends Tokens.Generic {
	type: "tag",
	raw:  string,
	text: string,
	href: string,
}

interface EmojiToken extends Tokens.Generic {
	type:  "emoji",
	raw:   string,
	text:  string,
	title: string,
}

interface ColorToken extends Tokens.Generic {
	type:   "color",
	raw:    string,
	text:   string,
	color:  string,
	tokens: Tokens.Generic[],
}

interface GigamojiToken extends Tokens.Generic {
	type:   "gigamoji",
	raw:    string,
	tokens: (EmojiToken | Tokens.Text)[],
}

interface AlignmentToken extends Tokens.Generic {
	type:   "alignment",
	raw:    string,
	tokens: any[],
	align:  "left" | "center" | "right",
	text:   string,
}

export const mdExtensions: TokenizerAndRendererExtension[] = [
	{
		name: 'handle',
		level: 'inline',
		start(src: string): number | void {
			const match = mdRules.handle.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): HandleToken | Tokens.Text | undefined {
			const match = mdRules.handle.rule.exec(src);
			if (!match) return;

			if (userLinks.hasOwnProperty(match[1])) {
				const [site, emoji] = userLinks[match[1]];
				return {
					type: 'handle',
					raw: match[0],
					text: emoji ? match[2] : match[0],
					title: match[0],
					href: site + match[2],
					code: match[1],
					icon: emoji,
					username: match[2],
				};
			}
			else {
				return {
					type: 'text',
					raw: match[0],
					text: match[0],
				};
			}
		},
		renderer(token: Tokens.Generic) {
			const id = mdRefId();

			if (token.raw[0] === '@') {
				mdMakeRequest(`${host}/v1/user/${token.username}`, true).then(r => {
					const element = document.getElementById(id);
					if (!element) return;

					if (r) {
						element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(token.href); });
					}
					else {
						const span = document.createElement("span");
						span.id = id;
						span.title = token.title;
						span.innerText = token.text;
						element.parentElement?.replaceChild(span, element);
					}
				});

				return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}" class="handle">${token.text}</a>`;
			}
			else if (token.code === iconShortcode) {
				mdMakeRequest(`${host}/v1/user/${token.username}`, true).then((r: any) => {
					const element = document.getElementById(id);
					if (!element) return;

					if (r) {
						// const response = r as { handle: string , icon?: string};
						const img = document.createElement("img");
						img.className = "profile-user-icon loading wave";
						img.src = r.icon ? getIconUrl(r.icon, r.handle.toLowerCase()) : defaultUserIcon;
						img.addEventListener("load", e => img.className = "profile-user-icon");
						element.appendChild(img);
						element.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); router.push(token.href); });
					}
					else {
						const span = document.createElement("span");
						span.id = id;
						span.title = token.username;
						span.innerText = token.text;
						element.parentElement?.replaceChild(span, element);
					}
				});

				return `<a href="${htmlEscape(token.href)}" id="${id}" title="@${token.username}"><span class="profile-user-icon loading wave"/></a>`;
			}
			else {
				return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}" class="handle" target="_blank">${emoji(token.icon)}${token.text}</a>`;
			}
		},
	},
	{
		name: 'icon',
		level: 'inline',
		start(src: string): number | void {
			const match = mdRules.icon.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string) {
			const match = mdRules.icon.rule.exec(src);
			if (!match) return;

			return {
				type: 'handle',
				raw: match[0],
				text: '@' + match[1],
				title: '@' + match[1],
				href: '/' + match[1],
				code: iconShortcode,
				icon: null,
				username: match[1],
			};
		},
	},
	{
		name: 'emoji',
		level: 'inline',
		start(src: string): number | void {
			const match = mdRules.emoji.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): EmojiToken | undefined {
			const match = mdRules.emoji.rule.exec(src);
			if (!match) return;

			return {
				type: 'emoji',
				raw: match[0],
				text: match[1],
				title: match[0],
			};
		},
		renderer: (token: Tokens.Generic) => emoji(token.text),
	},
	{
		name: 'post',
		level: 'inline',
		start(src: string): number | void {
			const match = mdRules.post.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): PostToken | undefined {
			const match = mdRules.post.rule.exec(src);
			if (!match) return;

			return {
				type: 'post',
				raw: match[0],
				text: match[1],
				href: getMediaThumbnailUrl(match[1]),
			};
		},
		renderer(token: Tokens.Generic) {
			const id = mdRefId();

			mdMakeRequest(`${host}/v1/post/${token.text}`)
			.then(r => {
				const element = document.getElementById(id);
				if (!element || !r) return;

				const response = r as { title?: string };
				const title = response?.title ? htmlEscape(response.title) : "";

				const a = document.createElement("a") as HTMLAnchorElement;
				a.id = id;
				a.className = "post";
				a.href = "/p/" + token.text;
				const img = document.createElement("img") as HTMLImageElement;
				img.src = token.href;
				img.alt = title;
				img.title = title;
				a.appendChild(img);
				a.appendChild(document.createTextNode("\n"));
				const p = document.createElement("p") as HTMLParagraphElement;
				p.innerText = title;
				a.appendChild(p);
				element.appendChild(a);
				element.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); router.push("/p/" + token.text); });
			});

			return `<span id="${id}">${token.raw}</span>`;
		},
	},
	{
		name: 'tag',
		level: 'inline',
		start(src: string): number | void {
			const match = mdRules.tag.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): TagToken | undefined {
			const match = mdRules.tag.rule.exec(src);
			if (!match) return;

			return {
				type: 'tag',
				raw: match[0],
				text: match[1],
				href: `/t/${encodeURIComponent(match[1])}`,
			};
		},
		renderer(token: Tokens.Generic) {
			const id = mdRefId();

			setTimeout(() => {
				const element = document.getElementById(id);
				if (!element) return;

				element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(token.href); });
			}, 0);

			return `<a id="${id}" href="${token.href}">${token.raw}</a>`;
		},
	},
	{
		name: "color",
		level: "inline",
		start(src: string): number | void {
			const match = mdRules.color.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): ColorToken | undefined {
			const match = mdRules.color.rule.exec(src);
			if (!match) return;

			const token: ColorToken = {
				type:   "color",
				raw:    match[0],
				text:   match[2],
				color:  match[1],		
				tokens: [],
			};

			this.lexer.inlineTokens(token.text, token.tokens);

			return token;
		},
		renderer(token_: Tokens.Generic): string {
			const token = token_ as ColorToken;
			const color = token.color.match(/^[a-f0-9]{6}$/i) ? "#" + token.color : "var(--" + token.color + ")";
			return `<span style="color: ${htmlEscape(color)}">` + this.parser.parseInline(token.tokens) + '</span>';
		},
	},
	{
		name: 'gigamoji',
		level: 'block',
		start(src: string): number | void {
			const match = mdRules.gigamoji.start.exec(src);
			return match ? match.index + match[1].length : undefined;
		},
		tokenizer(src: string): GigamojiToken | undefined {
			let match = mdRules.gigamoji.rule.exec(src);
			if (!match) return;

			const raw = match[0];
			src = match[2];
			const tokens: (EmojiToken | Tokens.Text)[] = [];

			if (match[1]) {
				tokens.push({ type: 'text', raw: match[1], text: match[1] });
			}

			while (src) {
				match = mdRules.gigamoji.single.exec(src);
				if (!match) continue;

				src = src.substr(match[0].length);
				tokens.push({
					type: 'emoji',
					raw: match[1],
					text: match[2],
					title: match[1],
				});

				if (match[3]) {
					tokens.push({ type: 'text', raw: match[3], text: match[3] });
				}
			}
			return {
				type: 'gigamoji',
				raw,
				tokens,
			};
		},
		renderer(token_: Tokens.Generic) {
			const token = token_ as GigamojiToken;
			let rendered = '<p class="gigamoji">';
			for (const t of token.tokens) {
				if (t.type === 'emoji') {
					rendered += emoji(t.text);
				}
				else {
					rendered += `<span>${t.text}</span>`;
				}
			}
			return rendered + '</p>';
		},
	},
	{
		name: 'alignment',
		level: 'block',
		start: (src: string): number | void => mdRules.alignment.start.exec(src)?.index,
		tokenizer(src: string): AlignmentToken | undefined {
			const match = mdRules.alignment.rule.exec(src);
			if (!match) return;

			let text = match[2].trim();
			const align = match[1] === '>' ? (
				// > text ?
				match[3] === '<' ? 'center' : 'right'
			) : (
				// < text ?
				match[3] === '>' ? null : 'left'
			);

			if (!align) return;

			if (match[4]) {
				for (const m of match[4].trim().matchAll(mdRules.alignment[align])) {
					text += '\n' + (m[2] || m[1]).trim();
				}
			}

			const token: AlignmentToken = {
				type: 'alignment',
				raw: match[0],
				tokens: [],
				align,
				text,
			};

			this.lexer.blockTokens(token.text, token.tokens);

			return token;
		},
		renderer(token_: Tokens.Generic): string {
			const token = token_ as AlignmentToken;
			return `<div class="alignment ${token.align}">` + this.parser.parse(token.tokens) + '</div>';
		},
	},
];
