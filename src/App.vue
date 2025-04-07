<template>
	<!-- <DeveloperConsole v-if='globals.auth?.isAdmin'/> -->
	<input type='checkbox' name='animated-accents' value='animated-accents' id='animated-accents' @click='setAnimated' v-show='false'>
	<Banner :message='bannerContent' :onResize='onResize'/>
	<div id='content'>
		<router-view :key='route.path'/>
		<Footer :costs='costs' :funds='funds'/>
	</div>
	<Toast/>
	<Cookies/>
	<Notifications/>
</template>
<script setup lang='ts'>
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { authCookie, getCookie, khatch, isDarkMode } from '@/utilities';
import { host, isMobile } from '@/config/constants';
import { PopulateEmojiDb } from './utilities/emoji';
// import DeveloperConsole from '@/components/DeveloperConsole.vue';
import store from '@/globals';
import Footer from '@/components/Footer.vue';
import Cookies from '@/components/Cookies.vue';
import Banner from '@/components/Banner.vue';
import Toast from '@/components/Toast.vue';
import Notifications from '@/components/Notifications.vue';

import light32 from '$/favicon/light/32.png?url';
import light64 from '$/favicon/light/64.png?url';
import light128 from '$/favicon/light/128.png?url';
import light256 from '$/favicon/light/256.png?url';

import dark32 from '$/favicon/dark/32.png?url';
import dark64 from '$/favicon/dark/64.png?url';
import dark128 from '$/favicon/dark/128.png?url';
import dark256 from '$/favicon/dark/256.png?url';

const globals = store();
const route = useRoute();
PopulateEmojiDb();

globals.cookiesAllowed(getCookie("cookies", false, "boolean"));
globals.setTheme(getCookie("theme", "kheina"));
globals.setAccent(getCookie("accent", "none"));
globals.animatedAccents(getCookie("animated-accents", true, "boolean"));
globals.cssTransitions(getCookie("css-transitions", true, "boolean"));
globals.searchResultsTiles(getCookie("search-results-tiles", !isMobile, "boolean"));
globals.maxRating(getCookie("max-rating", "general"));

const auth = authCookie();
if (auth) {
	globals.setAuth(auth);

	khatch(`${host}/v1/config/user`, {
		errorMessage: "Could Not Retrieve User Config!",
		errorHandlers: {
			// do nothing, we don't care
			401: () => { },
		},
	}).then(response => response.json().then(r =>
		globals.userConfig(r)
	));
}
document.documentElement.classList.add(isMobile ? "mobile" : "desktop");

const fontFamily = document.getElementById("font-family") as HTMLStyleElement;
const customFont = getCookie("font-family");
if (customFont) {
	fontFamily.innerText = `html * { font-family: ${customFont}, Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif }`;
}

// sadly, these must be strings for vite to catch assets
const favicons: { [k: number]: string } = { };
if (isDarkMode()) {
	favicons[32]  = dark32;
	favicons[64]  = dark64;
	favicons[128] = dark128;
	favicons[256] = dark256;
}
else {
	favicons[32]  = light32;
	favicons[64]  = light64;
	favicons[128] = light128;
	favicons[256] = light256;
}

Object.entries(favicons).forEach(([key, value]) => {
	const link = document.createElement("link");

	link.rel = "icon";
	link.type = "image/png";
	link.setAttribute("sizes", `${key}x${key}`);
	link.href = value;

	document.head.appendChild(link);
});

const link = document.createElement("link");
link.rel = "stylesheet";	
link.href = `${host}/v1/config/theme.css`;
document.head.appendChild(link);

let content: HTMLDivElement | undefined;
let banner:  HTMLDivElement | undefined;

onMounted(() => {
	banner = document.getElementById("banner") as HTMLDivElement;
	content = document.getElementById("content") as HTMLDivElement;

	ResizeSensor(content, onResize);
	onResize();
	configsLoop();

	(document.getElementById("animated-accents") as HTMLInputElement).checked = globals.animations;

	// NOTE: we use this to change the behavior of certain functions during startup. don't remove it.
	globals.init = false;
});

function setAnimated(e: MouseEvent) {
	globals.animatedAccents((e.target as HTMLInputElement).checked);
}

function onResize() {
	let offset: number;
	if (route.meta.applyOffset ?? true) {
		offset = Math.max((banner as HTMLDivElement).clientHeight + 25, (window.innerHeight - (content as HTMLDivElement).clientHeight) / 2);
	}
	else {
		offset = (banner as HTMLDivElement).clientHeight;
	}
	(content as HTMLDivElement).style.top = offset.toString() + "px";
	document.dispatchEvent(new CustomEvent<ResizeDetails>("resize", { detail: { offset } }));
}

let bannerContent: Ref<string | null> = ref(null);
let costs:         Ref<number | null> = ref(null);
let funds:         Ref<number | null> = ref(null);

function configsLoop() {
	khatch(`${host}/v1/configs`, {
		errorMessage: "Error Occurred While Fetching Configs",
	}).then(r => r.json())
	.then((r: { banner: string | null, funding: { funds: number, costs: number } }) => {
		bannerContent.value = r.banner;
		costs.value         = r.funding.costs;
		funds.value         = r.funding.funds;
	}).catch(() => {
		costs.value = null;
		funds.value = null;
	});
	setTimeout(configsLoop, 300e3); // 5 minutes
}

function ResizeSensor(element: HTMLElement, callback: Function) {
	// https://stackoverflow.com/a/47965966
	const expand = document.createElement("div");
	expand.className = "expand";
	expand.appendChild(document.createElement("div"));

	const shrink = document.createElement("div");
	shrink.className = "shrink";
	shrink.appendChild(document.createElement("div"));

	element.appendChild(expand);
	element.appendChild(shrink);

	const setScroll = () => {
		expand.scrollLeft = 10000000;
		expand.scrollTop = 10000000;

		shrink.scrollLeft = 10000000;
		shrink.scrollTop = 10000000;
	};
	setScroll();

	let s = element.getBoundingClientRect();
	let currentWidth = s.width;
	let currentHeight = s.height;

	const onScroll = () => {
		const size = element.getBoundingClientRect();

		if (size.width !== currentWidth || size.height !== currentHeight) {
			currentWidth = size.width;
			currentHeight = size.height;

			callback();
		}

		setScroll();
	};

	expand.addEventListener("scroll", onScroll);
	shrink.addEventListener("scroll", onScroll);
}
</script>
<style scoped>
#content {
	position: absolute;
	width: 100%;
}
</style>
<style>
html.mobile {
	font-size: 30px;
}
body.menu-open {
	overflow: hidden;
}

html.transitions {
	--transition: ease;
}

.expand {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	z-index: -1000;
	visibility: hidden;
}
.expand div {
	position: absolute;
	left: 0;
	top: 0;
	width: 10000000px;
	height: 10000000px;
}
.shrink {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	z-index: -1000;
	visibility: hidden;
}
.shrink div {
	position: absolute;
	left: 0;
	top: 0;
	width: 200%;
	height: 200%;
}

code, code *, .code, .code *, textarea, pre {
	font-family: Hack, DejaVu Sans Mono, Inconsolata, monospace;
}
html {
	background: var(--bg0color);	
	background-size: cover;
}
body {
	min-height: 100vh;
	display: block;
	overflow-x: hidden;
}
body, html {
	margin: 0;
	padding: 0;
	color: var(--textcolor);
}
html, html * {
	text-rendering: optimizelegibility;
	scrollbar-color: var(--subtle) var(--bg2color);
	scrollbar-width: thin;
}

a, input, label, textarea {
	cursor: pointer;
	pointer-events: all;
	text-decoration: none;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
input, textarea, select {
	font-size: 0.9em;
	color: var(--textcolor);
}
*::placeholder, *::-webkit-input-placeholder {
	color: var(--subtle);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
input:hover::placeholder {
	color: var(--interact);
}
a:link, a:visited
{ color: var(--textcolor); }
a:hover {
	color: var(--interact) !important;
	opacity: 1 !important;
}
button {
	font-size: 1em;
	padding: 0;
	border: none;
	background: none;
	color: inherit;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	cursor: pointer;
}
button:hover /*, button:active, button:focus */
{ color: var(--interact); }
textarea {
	margin: 0;
	background: var(--bg2color);
	color: var(--textcolor);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: 0.5em;
}

::-webkit-scrollbar {
	width: 12px;
	height:12px;
}
::-webkit-scrollbar-track
{ background: var(--bg2color); }
::-webkit-scrollbar-thumb {
	background: #4D535A;
	border-radius: 4px;
	border: 2px solid var(--bg2color);
}
::-webkit-scrollbar-thumb:hover
{ background: var(--interact); }
::-webkit-scrollbar-corner
{ background: var(--bg0color); }
form, p
{ margin: 0; }

.interactable {
	cursor: pointer;
	position: relative;
	border-radius: var(--border-radius);
	padding: 0.5em 1em;
	border: var(--border-size) solid var(--bordercolor);
	display: inline-block;
	font-weight: normal;
	background: var(--bg2color);
	box-sizing: border-box;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.interactable.text {
	cursor: text;
	padding: 0.5em;
}
.interactable:hover /*, .interactable:active, .interactable:focus */ {
	border-color: var(--borderhover);
	color: var(--interact);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
.interactable.text:hover
{ color: var(--interact); }
.interactable.text:active, .interactable.text:focus {
	color: var(--textcolor);
	border-color: var(--interact);
}

html {
	--transition: none;
	--fadetime: 0.15s;
	--interact: #F29B17;
	--bg0color: #000000;
	--bg1color: #1e1f25;
	--bg2color: #151416;
	--bg3color: #1B1B20;
	--blockquote: var(--bordercolor);
	--textcolor: #DDD;
	--bordercolor: #2D333A;
	--linecolor: var(--bordercolor);
	--nestedlinecolor: #5b6775;
	--borderhover: var(--interact);
	--subtle: #EEEEEE80;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;
	--screen-cover: #00000080;
	--border-size: 1px;
	--border-radius: 3px;
	--wave-color: var(--bordercolor);
	--stripe-color: var(--subtle);
	--main: var(--bg1color);

	--pink: #cc35cc;
	--yellow: #c8c80f;
	--green: forestgreen;
	--blue: steelblue;
	--orange: #c44f3b;
	--red: #d7242d;
	--cyan: darkcyan;
	--violet: #9451d7;

	--general: #70ca16;
	--mature: #009DA6;
	--explicit: #A32121;

	--warning: yellow;
	--error: darkred;
	--valid: green;

	--bright: #DDD;
	--funding: forestgreen;

	--notification-text: #eee;
	--notification-bg: var(--red);

	--margin: 25px;
	--half-margin: calc(var(--margin) / 2);
	--neg-margin: calc(var(--margin) * -1);
	--neg-half-margin: calc(var(--margin) * -0.5);
}
html.mobile {
	--border-size: 2px;	
	--border-radius: 5px;
}

html.kheina, html.gay {
	--stripe-color: #222430;
	--main: #25262ecc;
}

div.loadingicon img
{ filter: sepia(100%) saturate(382%) hue-rotate(-2.8deg) brightness(113.5%); }

html.light, .high-contrast-light {
	--interact: #F28817;
	--bg0color: #C3C4CE;
	--bg1color: #E0E4E8;
	--bg2color: #D8D9E0;
	--textcolor: #222222;
	--bordercolor: #2D333A;
	--subtle: #00000080;
	--shadowcolor: #6D718680;
	--activeshadowcolor: #6D7186B3;
	--wave-color: #b4b9c4;
	--stripe-color: #b4b9c4;
	--main: #e7eceecc;
}

html.midnight {
	--interact: #2676D5;
	--bg0color: #000000;
	--bg1color: #151416;
	--bg2color: #151416;
	/* --bg2color: #1b1a1c; */
	--bg3color: #000000;
	--main: #1a191bcc;
}


html.e621 {
	--interact: #2E76B4;
	--bg0color: #031131;
	--bg1color: #152F56;
	--bg2color: #213A5F;
	--bg3color: hsla(0, 0%, 100%, 0.05);
	--textcolor: #EEE;
	--bordercolor: var(--subtle);
	--border-size: 0;
	--linecolor: var(--subtle);
	--borderhover: var(--interact);
	--blockquote: var(--subtle);
	--subtle: #B4C7D9;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	--main: #19365fcc;

	--pink: #f2ac08;
	--green: #0a0;
	--orange: #ed5d1f;
	--cyan: #b4c7d9;
	--blue: #d0d;
	/* sienna */

	--general: #3e9e49;
	--mature: #ffe666;
	--explicit: #e45f5f;

	background-image: url(/assets/themes/stripe.png) var(--bg0color);
	background-repeat: repeat;
	background-position: center top;
	background-size: auto;
}
html.e621 main {
	margin-left: 0.82em;
	margin-right: 0.82em;
	border-radius: 6px;
}
html.e621 div.themes
{ border-bottom-right-radius: 6px; }
html.e621 .source {
	padding: 0 0 8px;
	border: none;
}
html.e621 .top .source h2
{ margin-top: 8px; }
html.e621 .more .source .left
{ margin-bottom: 8px; }

html.youtube {
	--interact: #FFF;
	--bg0color: #121212;
	--bg1color: #272727;
	--bg2color: #383838;
	--textcolor: #EEE;
	--bordercolor: #404040;
	--borderhover: #747474;
	--subtle: #909090;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	--main: #2c2c2ccc;
}

html.wikipedia {
	--interact: #0645AD;
	--bg0color: #F6F6F6;
	--bg1color: #FFF;
	--bg2color: #F8F9FA;
	--textcolor: #222222;
	--bordercolor: #C8CCD1;
	--borderhover: #A7D7F9;
	--subtle: #54595D;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	--main: #ffffffcc;
}
html.wikipedia body
{ background-image: linear-gradient(#FFF 2.5em,#F6F6F6 5em); }
html.wikipedia main {
	border-top: var(--border-size) solid #A7D7F9;
	border-bottom: var(--border-size) solid #A7D7F9;
}
html.wikipedia .nav-backdrop {
	border-bottom: var(--border-size) solid var(--bordercolor);
}

html.terminal {
	--interact: #008000;
	--bg0color: #000000;
	--bg1color: #000000;
	--bg2color: #000000;
	--textcolor: #00FF00;
	--bordercolor: #00FF00;
	--subtle: #008000;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	filter: sepia(100%) saturate(550%) hue-rotate(90deg);
	--main: #000000cc
}

html.high-contrast-dark *, html.high-contrast-light * {
	font-family: Atkinson Hyperlegible;
}
html.high-contrast-dark, html.high-contrast-light {
	font-size: 1.1em;
}

/*
spare high contrast colors:
#aefcd6
#cfbdf0
*/

html.high-contrast-dark {
	--interact:    #F1B636; /* #d9a216 / #efe006 */
	--bg3color:    #2D333A;
	--blockquote:   var(--bg3color);
	--textcolor:   #FFFFFF;
	--bordercolor: #7f848a;
	--subtle:      #FFFFFFC0;

	--pink:   #f587ea;
	--yellow: #e8ec6b;
	--green:  #1ff160; /* #abd017 */
	--blue:   #5de0f0; /* #14bbde */
	--orange: #e19c69;	
	--red:    #ff8888;
	--cyan:   #81d9e3; /* #bbfdf8 / #47f4cf / #2396a1 */
	--violet: #d3aae2; /* #d1bae7 / #e2c7fc */

	--general:  var(--green); /* TODO */
	--mature:   var(--yellow); /* TODO */
	--explicit: var(--red);

	--funding: #044721;
}

html.high-contrast-light {
	--interact: #5c098a; /* #5906c4 */
	--textcolor: #000000;
	--subtle: #000000C0;

	--pink: #800960; /* #c03d7e */
	--yellow: #9e8900;
	--green: #083a12; /* 0f4948 #0f4948 #294328 #155027 #1e4119 */
	--blue: #0a2188; /* #162946 5b06bd #160979 #213d84 #1d166b #23366f */
	--orange: #8d1214; /* #b50615 */
	--red: #880f22; /* #6f1e20 */
	--cyan: darkcyan;  /* #075f91 #2d4668 #24386f */
	--violet: #5b0b8d; /* #5a0d76 #8d06a0 #480f77 #561977 */

	--general:  #3e9e49; /* TODO */
	--mature:   #ffe666; /* TODO */
	--explicit: #800210;

	--funding: #78c535;
}

html.solarized-dark {
	--interact: #b58900;
	--bg0color: #002b36;
	--bg1color: #073642;
	--bg2color: #002b36;
	--bg3color: var(--bg1color);
	--textcolor: #93a1a1;
	--subtle: #657b83;
	--shadowcolor: #002b36;
	--activeshadowcolor: #2aa19820;
	--screen-cover: #002b3680;
	--main: #083845cc;
}

html.solarized-light {
	--interact: #cb4b16;
	--bg0color: #fdf6e3;
	--bg1color: #eee8d5;
	--bg2color: #fdf6e3;
	--textcolor: #586e75;
	--subtle: #839496;
	--shadowcolor: #93a1a1;
	--activeshadowcolor: #dc322f40;
	--screen-cover: #fdf6e380;
	--main: #eae4d1cc;
}

html.solarized-light, html.solarized-dark {
	--bordercolor: #586e75;

	--yellow: #b58900;
	--orange: #cb4b16;
	--red:    #dc322f;
	--pink:   #d33682;
	--violet: #6c71c4;
	--blue:   #268bd2;
	--cyan:   #2aa198;
	--green:  #859900;

	--funding: var(--green);

	--error: var(--red);
	--warning: var(--orange);
	--valid: var(--green);

	--general: var(--green);
	--mature: var(--cyan);
	--explicit: var(--red);
}

html.furaffinity {
	--interact: #AFAFAF;
	--bg0color: #2E3B41;
	--bg1color: #2E3B41;
	--bg2color: #6A7283;
	--textcolor: #FFF;
	--bordercolor: #DCDCDC;
	--subtle: #CFCFCF;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	--main: #2e3b41cc;
}
html.furaffinity main {
	border-top: var(--border-size) solid var(--bordercolor);
	border-bottom: var(--border-size) solid var(--bordercolor);
}

html.discord {
	--interact: #7289DA;
	--bg0color: #202225;
	--bg1color: #2F3136;
	--bg2color: #26272B;
	--textcolor: #DCDDDE;
	--bordercolor: #1E1F23;
	--linecolor: var(--bg1color);
	--subtle: #72767D;
	--shadowcolor: #202225;
	--activeshadowcolor: #202225;
	--main: #32343acc;
}

html.xfire {
	--interact: #3D73D7;
	--bg0color: #000000;
	--bg1color: #12283F;
	--bg2color: #1D1C22;
	--textcolor: #ABC6E3;
	--bordercolor: #00020A;
	--linecolor: var(--subtle);
	--subtle: #ABC6E3A0;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;
	--main: #16324ecc;
}
html.xfire div.loadingicon img
{ filter: sepia(100%) saturate(2000%) hue-rotate(201deg) brightness(83%) }

html.xfire main {
	background-image: linear-gradient(#8BA0E3 0, #2D6191 2px, #2D6191 4px, #00022C 5px, #0000 5px), linear-gradient(#0000 calc(100% - 5px), #8BA0E3 calc(100% - 5px), #2D6191 calc(100% - 3px), #2D6191 calc(100% - 1px), #00022C 100%), linear-gradient(#0000 0, #12283F 12.5em), url(https://cdn.fuzz.ly/bc83a6cc07e0c47c9b7d226ef47f556b4aeddfcf.png), linear-gradient(#030316 0, #030316 100%);
	background-position: left top, left top, left top, left top, left bottom;
}

@keyframes gay {
	0%, 100%
	{ color: red }
	16.666%
	{ color: yellow }
	33.333%
	{ color: green }
	50%
	{ color: cyan }
	66.666%
	{ color: blue }
	83.333%
	{ color: purple }
}
html.gay *
{ animation: gay 1s linear infinite; }

/* accent */

/*body main.none
{ / * having "nothing" here allows us to apply accent to themes without having them be overridden by none * / }*/

html.aurora main, html.hex main, html.space main, html.stars main {
	background-repeat: repeat-x;
	background-position: center top;
}

html.aurora main {
	background-image: url(/assets/themes/aurora.png);
}

html.autumn main {
	background-image: url(/assets/themes/autumn.png);
	background-repeat: repeat-x;
	background-position: center bottom;
	padding-bottom: 50px;
}

html.hex main {
	background-image: url(/assets/themes/hex.png);
}

html.summer main {
	background-image: url(/assets/themes/summer.png);
}

html.space main {
	background-image: url(/assets/themes/space.png);
}

html.spring main {
	background-image: url(/assets/themes/spring/1.png), url(/assets/themes/spring/2.png), url(/assets/themes/spring/3.png), url(/assets/themes/spring/4.png);
	background-repeat: repeat-x, no-repeat, no-repeat, repeat-x;
	background-position: center bottom, right bottom, top right, center top;
	padding-bottom: 50px;
}

html.stars main {
	background-image: url(/assets/themes/stars.png);
}

html.winter main {
	background-image: url(/assets/themes/winter/1.png), url(/assets/themes/winter/2.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: var(--margin);
}

/*
html.fox main {
	background-image: url(/assets/themes/fox.png);
	background-repeat: no-repeat;
	background-position: left bottom;
}

html.snep main {
	background-image: url(/assets/themes/snep.png);
	background-repeat: no-repeat;
	background-position: left bottom;
}
*/

/* animations */

@keyframes scroll-bg-x {
	00%
	{ background-position-x: 0, 0 }
	100%
	{ background-position-x: 481px, 2405px }
}

html.aurora.animated main, html.space.animated main, html.stars.animated main, html.winter.animated main {
	animation: scroll-bg-x 20s linear infinite;
}
</style>
