<template>
	<input ref='animatedAccents' type='checkbox' name='animated-accents' value='animated-accents' id='animated-accents' @click='setAnimated' v-show='false'>
	<Banner :onResize='onResize'/>
	<div ref='content' id='content'>
		<router-view :key='$route.path' v-if='$store.state?.error === null'/>
		<Error v-bind='$store.state.error' v-else/>
		<Footer/>
	</div>
	<Toast/>
	<Cookies/>
</template>

<script>
import { ref } from 'vue';
import { authCookie, getCookie, isDarkMode, isMobile, setCookie, setMeta } from '@/utilities';
import Footer from '@/components/Footer.vue';
import Cookies from '@/components/Cookies.vue';
import Banner from '@/components/Banner.vue';
import Toast from '@/components/Toast.vue';
import Error from '@/components/Error.vue';


export default {
	name: 'App',
	components: {
		Footer,
		Cookies,
		Banner,
		Toast,
		Error,
	},
	setup() {
		const content = ref(null);
		const animatedAccents = ref(null);
		return {
			content,
			animatedAccents,
		};
	},
	data() {
		return {
			
		};
	},
	async created() {
		const theme = getCookie('theme');
		const accent = getCookie('accent');
		document.documentElement.classList.add(theme);
		document.documentElement.classList.add(accent);

		this.$store.state.theme = {
			theme,
			accent,
		};
		this.$store.commit('animatedAccents', "false" !== getCookie('animated-accents'));

		const auth = authCookie();
		if (auth)
		{ this.$store.commit('setAuth', authCookie()); }
		document.documentElement.classList.add(isMobile() ? 'mobile' : 'desktop');

		// sadly, these must be strings for vite to catch assets
		const favicons = { };
		if (isDarkMode())
		{
			favicons[32] = (await import('$/favicon/dark/32.png?url')).default;
			favicons[64] = (await import('$/favicon/dark/64.png?url')).default;
			favicons[128] = (await import('$/favicon/dark/128.png?url')).default;
			favicons[256] = (await import('$/favicon/dark/256.png?url')).default;
		}
		else
		{
			favicons[32] = (await import('$/favicon/light/32.png?url')).default;
			favicons[64] = (await import('$/favicon/light/64.png?url')).default;
			favicons[128] = (await import('$/favicon/light/128.png?url')).default;
			favicons[256] = (await import('$/favicon/light/256.png?url')).default;
		}

		[32, 64, 128, 256].forEach(x => {
			const link = document.createElement('link');

			link.rel = 'icon';
			link.type = 'image/png';
			link.sizes = `${x}x${x}`;
			link.href = favicons[x];

			document.head.appendChild(link);
		});
	},
	mounted() {
		this.ResizeSensor(this.$refs.content, this.onResize);
		this.onResize();
		this.$refs.animatedAccents.checked = this.$store.state.animatedAccents;
	},
	computed: {
		banner() {
			return document.getElementsByClassName('banner')[0];
		},
	},
	methods: {
		setAnimated(e) {
			this.$store.commit("animatedAccents", e.target.checked);
			setCookie('animated-accents', e.target.checked);
		},
		onResize() {
			let offset = Math.max(this.banner.clientHeight + 25, (window.innerHeight - this.$refs.content.clientHeight) / 2);
			this.$store.contentOffset = offset - this.banner.clientHeight;

			if (this.$store.state.error || (this.$route?.meta.applyOffset ?? true))
			{ this.$refs.content.style.top = `${offset}px`; }
			else
			{ this.$refs.content.style.top = `${this.banner.clientHeight}px`; }
		},
		ResizeSensor(element, callback)
		{ // https://stackoverflow.com/a/47965966
			let expand = document.createElement('div');
			expand.className = 'expand';
			expand.appendChild(document.createElement('div'));

			let shrink = document.createElement('div');
			shrink.className = 'shrink';
			shrink.appendChild(document.createElement('div'));

			element.appendChild(expand);
			element.appendChild(shrink);

			function setScroll() {
				expand.scrollLeft = 10000000;
				expand.scrollTop = 10000000;

				shrink.scrollLeft = 10000000;
				shrink.scrollTop = 10000000;
			};
			setScroll();

			let size = element.getBoundingClientRect();

			let currentWidth = size.width;
			let currentHeight = size.height;

			function onScroll() {
				let size = element.getBoundingClientRect();

				let newWidth = size.width;
				let newHeight = size.height;

				if(newWidth !== currentWidth || newHeight !== currentHeight)
				{
					currentWidth = newWidth;
					currentHeight = newHeight;

					callback();
				}

				setScroll();
			};

			expand.addEventListener('scroll', onScroll);
			shrink.addEventListener('scroll', onScroll);
		},
	},
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

html *
{ font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }
code, .code, textarea
{ font-size: 0.9em; }
code, code *, .code, .code *, textarea
{ font-family: Hack, DejaVu Sans Mono, Inconsolata, monospace; }
html {
	background: var(--bg0color);	
}
body {
	min-height: 100vh;
	display: block;
	background-size: cover;
	background-position: center;
	overflow-x: hidden;
}
body, html {
	text-rendering: optimizelegibility;
	margin: 0;
	padding: 0;
	color: var(--textcolor);
	scrollbar-color: #4D535A #151416;
}
a, input, label, textarea
{
	cursor: pointer;
	pointer-events: all;
	text-decoration: none;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
input, textarea, select {
	font-size: 0.9em;
	color: var(--textcolor);
}
*::placeholder {
	color: var(--subtle);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
input:hover::placeholder {
	color: var(--icolor);
}
a:link, a:visited
{ color: var(--textcolor); }
a:hover
{
	color: var(--icolor) !important;
	opacity: 1 !important;
}
button
{
	font-size: 1em;
	padding: 0;
	border: none;
	background: none;
	color: var(--textcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	cursor: pointer;
}
button:hover /*, button:active, button:focus */
{ color: var(--icolor); }
textarea {
	margin: 0;
	background: var(--bg2color);
	color: var(--textcolor);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: 0.5em;
}

::-webkit-scrollbar
{
	width: 12px;
	height:12px;
}
::-webkit-scrollbar-track
{ background: var(--bg2color); }
::-webkit-scrollbar-thumb
{
	background: #4D535A;
	border-radius: 4px;
	border: 2px solid var(--bg2color);
}
::-webkit-scrollbar-thumb:hover
{ background: var(--icolor); }
::-webkit-scrollbar-corner
{ background: var(--bg0color); }
form, p
{ margin: 0; }

.interactable
{
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
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.interactable.text {
	cursor: text;
	padding: 0.5em;
}
.interactable:hover /*, .interactable:active, .interactable:focus */
{
	border-color: var(--borderhover);
	color: var(--icolor);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
.interactable.text:hover
{ color: var(--icolor); }
.interactable.text:active, .interactable.text:focus
{
	color: var(--textcolor);
	border-color: var(--icolor);
}
.header
{ text-align: right; }
.header p
{ margin: 0 25px 6px; }



p.center
{
	text-align: center;
	margin: 0;
	color: var(--subtle);
}
.searchstats
{
	text-align: left;
	margin: 5.5em 0 0 25px;
	position: absolute;
	font-size: 1em;
	max-width: 300px;
}
.source
{
	position: relative;
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 8px;
	border: var(--border-size) solid var(--bordercolor);
	display: inline-block;
	min-height: 128px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.source img
{
	max-width: 256px;
	max-height: 128px;
}
.source h2
{ margin: 0; }
.source .thumbnail
{
	top: 64px;
	transform: translateY(-50%);
	position: relative;
	float: left;
}
a.source:hover, a.source:active, a.source:focus
{
	border-color: var(--borderhover);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
h3#percent
{
	position: absolute;
	font-weight: bold;
	right: 8px;
	bottom: 8px;
	margin: 0;
	background: var(--bg2color);
}

.source span
{ padding: 0; }

html
{
	--fadetime: 0.15s;
	--warning: yellow;
	--error: darkred;
	--valid: green;
	--general: #70ca16;
	--mature: #009DA6;
	--explicit: #A32121;
	--icolor: #F29B17; /* F1B636 */
	--bg0color: #000000;
	--bg1color: #1E1F25;
	--bg2color: #151416;
	--bg3color: var(--bordercolor);
	--blockquote: var(--bordercolor);
	--textcolor: #DDD;
	--bordercolor: #2D333A;
	--linecolor: var(--bordercolor);
	--borderhover: var(--icolor);
	--subtle: #EEEEEE80;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;
	--screen-cover: #00000080;
	--border-size: 1px;
	--border-radius: 3px;

	--pink: #cc35cc;
	--yellow: #c8c80f;
	--green: forestgreen;
	--blue: steelblue;
	--orange: #c44f3b;
	--red: #d7242d;
	--cyan: darkcyan;
	--violet: #9451d7;

	--notification-text: #eee;
	--notification-bg: var(--red);
}
html.mobile {
	--border-size: 2px;
	--border-radius: 5px;
}

div.loadingicon img
{ filter: sepia(100%) saturate(382%) hue-rotate(-2.8deg) brightness(113.5%); }

html.light
{
	--icolor: #F28817;
	--bg0color: #C3C4CE;
	--bg1color: #E0E4E8;
	--bg2color: #D8D9E0;
	--textcolor: #222222;
	--bordercolor: #2D333A;
	--subtle: #00000080;
	--shadowcolor: #6D718680;
	--activeshadowcolor: #6D7186B3;
}

html.midnight
{
	--icolor: #2676D5;
	--bg0color: #000000;
	--bg1color: #151416;
	--bg2color: #151416;
	/* --bg2color: #1b1a1c; */
	--bg3color: #000000;
}


html.e621
{
	--icolor: #2E76B4;
	--bg0color: #031131;
	--bg1color: #152F56;
	--bg2color: #213A5F;
	--bg3color: hsla(0,0%,100%,.05);
	--textcolor: #EEE;
	--bordercolor: var(--subtle);
	--border-size: 0;
	--linecolor: var(--subtle);
	--borderhover: #0000;
	--blockquote: var(--subtle);
	--subtle: #B4C7D9;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;

	--pink: #f2ac08;
	--green: #0a0;
	--orange: #ed5d1f;
	--cyan: #b4c7d9;
	--blue: #d0d;
	/* sienna */

	background: url(/assets/themes/stripe.png) var(--bg0color);
	background-repeat: repeat;
	background-position: center top;
	background-size: auto;
}
html.e621 main
{
	margin-left: 0.82em;
	margin-right: 0.82em;
	border-radius: 6px;
}
html.e621 div.themes
{ border-bottom-right-radius: 6px; }

html.youtube
{
	--icolor: #FFF;
	--bg0color: #121212;
	--bg1color: #272727;
	--bg2color: #383838;
	--textcolor: #EEE;
	--bordercolor: #404040;
	--borderhover: #747474;
	--subtle: #909090;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
}

html.wikipedia
{
	--icolor: #0645AD;
	--bg0color: #F6F6F6;
	--bg1color: #FFF;
	--bg2color: #F8F9FA;
	--textcolor: #222222;
	--bordercolor: #C8CCD1;
	--borderhover: #A7D7F9;
	--subtle: #54595D;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
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
html.e621 .source
{
	padding: 0 0 8px;
	border: none;
}
html.e621 .top .source h2
{ margin-top: 8px; }
html.e621 .more .source .left
{ margin-bottom: 8px; }

html.terminal {
	--icolor: #008000;
	--bg0color: #000000;
	--bg1color: #000000;
	--bg2color: #000000;
	--textcolor: #00FF00;
	--bordercolor: #00FF00;
	--subtle: #008000;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	filter: sepia(100%) saturate(550%) hue-rotate(90deg);
}

html.solarized-dark {
	--icolor: #b58900;
	--bg0color: #002b36;
	--bg1color: #073642;
	--bg2color: #002b36;
	--bg3color: var(--bg1color);
	--textcolor: #93a1a1;
	--bordercolor: #586e75;
	--subtle: #657b83;
	--shadowcolor: #002b36;
	--activeshadowcolor: #2aa19820;
	--screen-cover: #002b3680;

	--yellow:    #b58900;
	--orange:    #cb4b16;
	--red:       #dc322f;
	--pink:   #d33682;
	--violet:    #6c71c4;
	--blue:      #268bd2;
	--cyan:      #2aa198;
	--green:     #859900;

	--error: var(--red);
	--warning: var(--orange);
	--valid: var(--green);

	--general: var(--green);
	--mature: var(--cyan);
	--explicit: var(--red);
}

html.solarized-light {
	--icolor: #cb4b16;
	--bg0color: #fdf6e3;
	--bg1color: #eee8d5;
	--bg2color: #fdf6e3;
	--textcolor: #586e75;
	--bordercolor: #586e75;
	--subtle: #839496;
	--shadowcolor: #93a1a1;
	--activeshadowcolor: #dc322f40;
	--screen-cover: #fdf6e380;

	--error: #dc322f;
	--warning: #cb4b16;
	--valid: #859900;

	--pink: #d33682;
	--green: #859900;
	--blue: #268bd2;
	--orange: #cb4b16;
	--cyan: #2aa198;
	--violet: #6c71c4;
}

html.furaffinity {
	--icolor: #AFAFAF;
	--bg0color: #2E3B41;
	--bg1color: #2E3B41;
	--bg2color: #6A7283;
	--textcolor: #FFF;
	--bordercolor: #DCDCDC;
	--subtle: #CFCFCF;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
}
html.furaffinity main {
	border-top: var(--border-size) solid var(--bordercolor);
	border-bottom: var(--border-size) solid var(--bordercolor);
}

html.discord {
	--icolor: #7289DA;
	--bg0color: #202225;
	--bg1color: #2F3136;
	--bg2color: #26272B;
	--textcolor: #DCDDDE;
	--bordercolor: #1E1F23;
	--linecolor: var(--bg1color);
	--subtle: #72767D;
	--shadowcolor: #202225;
	--activeshadowcolor: #202225;
}

html.xfire {
	--icolor: #3D73D7;
	--bg0color: #000000;
	--bg1color: #12283F;
	--bg2color: #1D1C22;
	--textcolor: #ABC6E3;
	--bordercolor: #00020A;
	--linecolor: var(--subtle);
	--subtle: #ABC6E3A0;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;
}
html.xfire div.loadingicon img
{ filter: sepia(100%) saturate(2000%) hue-rotate(201deg) brightness(83%) }

html.xfire main {
	background-image: linear-gradient(#8BA0E3 0, #2D6191 2px, #2D6191 4px, #00022C 5px, #0000 5px), linear-gradient(#0000 calc(100% - 5px), #8BA0E3 calc(100% - 5px), #2D6191 calc(100% - 3px), #2D6191 calc(100% - 1px), #00022C 100%), linear-gradient(#0000 0, #12283F 12.5em), url(https://cdn.kheina.com/file/kheinacom/bc83a6cc07e0c47c9b7d226ef47f556b4aeddfcf.png), linear-gradient(#030316 0, #030316 100%);
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
	padding-bottom: 25px;
}

html.stars main {
	background-image: url(/assets/themes/stars.png);
}

html.winter main {
	background-image: url(/assets/themes/winter/1.png), url(/assets/themes/winter/2.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: 25px;
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
	{ background-position-x: 0 }
	100%
	{ background-position-x: 481px }
}

html.aurora.animated main, html.space.animated main, html.stars.animated main, html.winter.animated main {
	animation: scroll-bg-x 20s linear infinite;
}
</style>
