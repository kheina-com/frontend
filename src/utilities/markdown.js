import { getMediaThumbnailUrl, getEmojiUrl, getMediaUrl, khatch } from '@/utilities';
import { postsHost, usersHost, apiErrorDescriptionToast, apiErrorMessageToast, environment } from '@/config/constants';
import store from '@/global';
import router from '@/router';


                                                       /*::/++++++++ooo++/:.
                                              -//+yhdNNMMMMMMMMMMMMMMMMMMMMMNNmhyys/.
                                       .-/oymmNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMh
                                  .-/ydNNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMs
                              .:sdmNMMMMMMMMMMMMMMMMMMMMMMMMMMNNMMMMMMMMMMMMMMMMMMMM.
                          `-+hmNMMMMMMMMMMMMMMMMNNdyyhs+o+----..----//+oyydmNMMMMMMm
                       .-sdNMMMMMMMMMMMMMNmhy++--.`   `               `   ``.-osdmNs
                    `:smMMMMMMMMMMMMMMdy:.`                        ohyy++::.`   `.-.
                  .odMMMMMMMMMMNNho:::`        -yyyso`             yMMMMMMNNdy/..
               `-sNMMMMMMMMMNds-.              :MMMMM/             yMMMMMMMMMMMMNs/`
             `:dMMMMMMMMMMho-``                :MMMMM/             yMMMMMMMMMMMMMMMmy:`
            /mMMMMMMMMNd+/.                     MMMMM:             odNMMMMMMMMMMMMMMMMd/`
          :mMMMMMMMMd+`                   /d/:  mMMMM:                -//oydMMMMMMMMMMMMmo
        .sMMMMMMMMN/                     dMMMNy`dMMMM-                       :ohNMMMMMMMMMN:
       -mMMMMMMNh+`                      -dNmy` hMMMM.                         ``oomMMMMMMMNh
     `yNMMMMMMhs.                   .    .o::-  sMMMM-                             `/dMMMMMMMd`
    `hMMMMMMms.                   smNms` hMNNN: +MMMM:                               `:mMMMMMMh-
   .dMMMMMMm.`           `-..     dMMMM:`hMMMM: /MMMM-                                 `smMMMMMm.
  `yMMMMMMo-             sNNm+    dMMMM: hMMMM- :MMMM`                                   .mMMMMMm
  sMMMMMN+        -shddhodNMMNy`  +MMMM+ yMMMM- -MMMM                  ````               .hMMMMN-
 -NMMMMm:       `sNMMNNMMmsNMMMy. -MMMM/ oMMMM.  MMMM                 `hddds`              -hMMMMy
 hMMMMm:        yMMMMssMMh`/NMMMd. NMMM/ +MMMN   NMMM                 `MMMMM-    `...`      .NMMMm
:MMMMM-`       +MMM*  mMN+  sMMMMm+mMMM+ /MMMm   mMMm        `         NMMMM-  `ohmNmmo`     oMMMM
hMMMMs         dMMMMdMMmo.   oNMMMNMMMM/ :MMMm   :///      -yhs`       mMMMM  :mMMMm:NMy     .MMMM:
mMMMN.         mMMMMdy/-      +MMMMMMMN- .+++:            /NMMMd-     /MMMMM -mMMM. .NMs      mMMM-
dMMMh          mMMMd  /yhy     /mNMMNdo                    /NNy:   -smMMMMMM yMMMM::mMd       dMMM:
hMMM+          sMMMNomMMMN                          /mmNh  syy+-  oNMMMMMMMM mMMMNdMMs-       MMMM.
dMMM+           hMMMMMMMN+                        .hMMMMd  mMMMo sMMMMhMMMMm mMMMMs/`        +MMMm
hMMMo           `:shhhyo`    .ymh+-.            `sNMMMMm:  mMMM+:MMMMs.NMMMm mMMMy`:oyhh     dMMMd
sMMMm              ```       sMMMNm/smmmm -oss: +MMMMNh.   mMMM+hMMMN` mMMMd sMMMNdNMMMd    :MMMN-
-MMMM.                       .sys/. yMMMMyNMMMN:+NMMMh.    mMMM/NMMMd +MMMMm `yNMMMMMNy.   .dMMMh
 hMMMh                       ommdy  yMMMMMMMMMMo :dMMMds.  mMMMomMMMdyMMMMMd  `./s+s/-    .hMMMN`
 -MMMMs                      /MMMM` yMMMMdoNMMMy  -ymMMMd: mMMM/sMMMMMMNMMMs             `hMMMM+
  yMMMM+                     /MMMM  yMMMm` sMMMm    -MMMMm mMMM:.dMMMms+MMMo            .dMMMMo`
  `mMMMMo`                   /MMMN  yMMMy  +MMMN   :dMMMMh NMMM: .:o:. .sddy          `/NMMMMd`
   -NMMMMd`                  /MMMm  yMMM/  `MMMM` :NMMMMd` ://:    `       `        `:dMMMMNh`
    :mMMMMN/                 /MMMm  yMMM/   mMMM+-NMMMNs`                         `/dMMMMMm/
     :dMMMMMd+               /MMMm  yMMM:   oMMM/-dNNm:`                         +dMMMMMMy:
      :dMMMMMMN/             /MMMd  :sy+.    :h+`                             -hNMMMMMMh/
       `/NMMMMMMNo-          oNMMh                                         -sNMMMMMMMh+.
          sNMMMMMMMh+-        -:-                                      -:ymMMMMMMMNs+.
           /smMMMMMMMNdh:.                                        `./ymNMMMMMMMNN/``
             `+NMMMMMMMMNNds/:-`                            .-:/ydmNMMMMMMMMNdo.`
               -/smMMMMMMMMMMNNmhhoo:::--..........::::+sydmNNMMMMMMMMMMNms+.`
                  ./odmMMMMMMMMMMMMMMMMNNNmmNmmmmNNMMMMMMMMMMMMMMMMNNdyo-.
                     `.-+hdNNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNmdhs/-.`
                          `.-:sdhddmNNNMMMMMMMMMMMMNNNmdhyo+--.`
                                   `---:::+++++++++::*/


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
	'<': '&lt;',
	'>': '&gt;',
};

const mdEscapeCharacters = new Set(Object.values(mdReplace));

const mdRegex = new RegExp(`[^\\\\]?(?:${Object.keys(mdReplace).map(x => '\\' + x).join('|')})`, 'g');

const userLinks = {
	// shortcode: [url, emoji]
	// links get formatted as url + username
	'': ['', null], // default
	t: ['https://twitter.com/', 'twitter'],
	fa: ['https://www.furaffinity.net/user/', 'furaffinity'],
	f: ['https://www.facebook.com/', 'facebook'],
	u: ['https://www.reddit.com/u/', 'reddit'],
	tw: ['https://www.twitch.tv/', 'twitch'],
	yt: ['https://www.youtube.com/c/', 'youtube'],
	tg: ['https://t.me/', 'telegram'],
	p: ['https://www.patreon.com/', 'patreon'],
	pi: ['https://www.picarto.tv/', 'picarto'],
	kf: ['https://ko-fi.com/', 'ko-fi'],
	gr: ['https://gumroad.com/', 'gumroad'],
	st: ['https://subscribestar.adult/', 'subscribestar'],
	rf: ['https://ref.st/', 'refsheet'],
	pp: ['https://www.paypal.me/', 'paypal'],
	fn: ['https://www.furrynetwork.com/', 'furrynetwork'],
	w: ['https://www.weasyl.com/~', 'weasyl'],
	// need to add tumblr, but tumblr urls are formatted user.tumblr.com
	// tm: ['https://{username}.tumblr.com', 'tumblr'],
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

		khatch(url).then(response => {
			if (response.status === 204)
			{ resolve(); return; }

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


export const mdRenderer = {
	html: htmlEscape,
	link(href, title, text) {
		const id = mdRefId();

		if (href.match(url))
		{
			setTimeout(() => {
				const element = document.getElementById(id);
				element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push(href); });
			}, 0);
		}
		else
		{
			setTimeout(() => {
				const element = document.getElementById(id);
				element.addEventListener('click', e => e.stopPropagation());
			}, 0);
		}

		if (title)
		{ return `<a href="${htmlEscape(href)}" id="${id}" title="${title}">${text || href}</a>`; }
		return `<a href="${htmlEscape(href)}" id="${id}">${text || href}</a>`;
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
	post: {
		start: /(^|\s*)\^/,
		rule: /^\^([a-zA-Z0-9_-]{8})(?=[^a-zA-Z0-9_-]|$)/,
	},
	gigamoji: {
		start: /(\s*\n):/,
		rule: /^\n?([^\S\n]*)((?::[a-z0-9\-]+:[^\S\n]*)+)(?:$|\n)/,
		single: /^(:([a-z0-9\-]+):)(\s*)/,
	},
	alignment: {
		start: /^[><]/,
		rule: /^(>|<) ?([^\n]+) ?(>|<)((?:\n(?:(?![><])|\1) ?(?:[^\n]*[^><\n]|$) ?(?:(?![><])|\3)(?=\n|$))*)(?:$|\n)/,
		center: /> ?([^\n]+) ?<|([^\n]+)(?=$|\n)/g,
		right: /(>?) ?([^\n]+?) ?\1(?=$|\n)/g,
		left: /(<?) ?([^\n]+?) ?\1(?=$|\n)/g,
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
						href: link[0] + match[2],
						icon: getEmojiUrl(link[1]),
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

				return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}" class="handle"><img src="${token.icon}" class="emoji">${token.text}</a>`;
			}

			return `<a href="${htmlEscape(token.href)}" id="${id}" title="${token.title}" class="handle">${token.text}</a>`;
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
					href: getEmojiUrl(match[1]),
				};
			}
		},
		renderer(token) {
			return `<img src="${token.href}" alt="${emojiMap[token.text] || token.text}" title="${token.title}" class="emoji">`;
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

					element.innerHTML = `<a id="${id}" class="post" href="/p/${token.text}">\n<img src="${token.href}" alt="${title}" title="${title}">\n${title ? '<p>' + title + '</p>' : ''}</a>`;
					element.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); router.push('/p/' + token.text); });
				});

			return `<span id="${id}">${token.raw}</span>`;
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
			src = match[2];
			const tokens = [];

			if (match[1])
			{ tokens.push({ type: 'text', raw: match[1], text: match[1] }); }

			while (src)
			{
				match = mdRules.gigamoji.single.exec(src);
				src = src.substr(match[0].length);
				tokens.push({
					type: 'emoji',
					raw: match[1],
					text: match[2],
					title: match[1],
					href: getEmojiUrl(match[2]),
				});

				if (match[3])
				{ tokens.push({ type: 'text', raw: match[3], text: match[3] }); }
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
			{ rendered += t.type === 'emoji' ? `<img src="${t.href}" alt="${emojiMap[t.text] || t.text}" title="${t.title}">` : `<span>${t.text}</span>`; }
			return rendered + '</p>';
		},
	},
	{
		name: 'alignment',
		level: 'block',
		start: (src) => mdRules.alignment.start.exec(src)?.index,
		tokenizer(src) {
			const match = mdRules.alignment.rule.exec(src);

			if (!match)
			{ return; }

			let text = match[2].trim();
			const align = match[1] === '>' ? (
				match[3] === '<' ? 'center' : 'right'
			) : (
				match[3] === '>' ? null : 'left'
			);

			if (!align)
			{ return; }

			if (match[4])
			{
				for (const m of match[4].trim().matchAll(mdRules.alignment[align]))
				{ text += '\n' + (m[2] || m[1]).trim(); }
			}

			const token = {
				type: 'alignment',
				raw: match[0],
				tokens: [],
				align,
				text,
			};

			this.lexer.blockTokens(token.text, token.tokens);

			return token;
		},
		renderer(token) {
			return `<div class="alignment ${token.align}">` + this.parser.parse(token.tokens) + '</div>';
		},
	},
];
