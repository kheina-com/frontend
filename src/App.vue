/* eslint-disable vue/no-multiple-template-root */
<template>
	<Banner>
		Black Lives Matter. <a href='https://blacklivesmatters.carrd.co/' target='_blank'>blacklivesmatters.carrd.co</a>
	</Banner>
	<div id='content' class='centery' v-resize='onResize'>
		<router-view />
		<Footer :stats='stats' />
	</div>
	<Cookies />
</template>

<script>
import Footer from './components/Footer.vue'
import Cookies from './components/Cookies.vue'
import Banner from './components/Banner.vue'

export default {
	name: 'App',
	components: {
		Footer,
		Cookies,
		Banner,
	},
	data() {
		return {
			stats: null,
		}
	},
	computed: {
		content()
		{ return document.getElementById('content') || null; },
	},
	mounted() {
		this.ResizeSensor(this.content, this.onResize);
		onResize();
	},
	methods: {
		onResize() {
			// console.log('top', this.content.offsetTop, 'content', this.content.clientHeight, 'window', window.innerHeight);
			if (this.content.offsetTop - this.content.clientHeight / 2 <= 128)
			{
				this.content.className = 'topy';
				if (this.content.clientHeight + 256 < window.innerHeight)
				{ this.content.className = 'centery'; }
			}
		},
		ResizeSensor(element, callback)
		{ // https://stackoverflow.com/a/47965966
			let zIndex = parseInt(getComputedStyle(element));
			if(isNaN(zIndex)) { zIndex = 0; };
			zIndex--;

			let expand = document.createElement('div');
			expand.style.position = 'absolute';
			expand.style.left = '0px';
			expand.style.top = '0px';
			expand.style.right = '0px';
			expand.style.bottom = '0px';
			expand.style.overflow = 'hidden';
			expand.style.zIndex = zIndex;
			expand.style.visibility = 'hidden';

			let expandChild = document.createElement('div');
			expandChild.style.position = 'absolute';
			expandChild.style.left = '0px';
			expandChild.style.top = '0px';
			expandChild.style.width = '10000000px';
			expandChild.style.height = '10000000px';
			expand.appendChild(expandChild);

			let shrink = document.createElement('div');
			shrink.style.position = 'absolute';
			shrink.style.left = '0px';
			shrink.style.top = '0px';
			shrink.style.right = '0px';
			shrink.style.bottom = '0px';
			shrink.style.overflow = 'hidden';
			shrink.style.zIndex = zIndex;
			shrink.style.visibility = 'hidden';

			let shrinkChild = document.createElement('div');
			shrinkChild.style.position = 'absolute';
			shrinkChild.style.left = '0px';
			shrinkChild.style.top = '0px';
			shrinkChild.style.width = '200%';
			shrinkChild.style.height = '200%';
			shrink.appendChild(shrinkChild);

			element.appendChild(expand);
			element.appendChild(shrink);

			function setScroll()
			{
				expand.scrollLeft = 10000000;
				expand.scrollTop = 10000000;

				shrink.scrollLeft = 10000000;
				shrink.scrollTop = 10000000;
			};
			setScroll();

			let size = element.getBoundingClientRect();

			let currentWidth = size.width;
			let currentHeight = size.height;

			let onScroll = function()
			{
				let size = element.getBoundingClientRect();

				let newWidth = size.width;
				let newHeight = size.height;

				if(newWidth != currentWidth || newHeight != currentHeight)
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

<style>
html *
{ font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }
pre, code, .code
{
	font-size: 0.9em;
	font-family: Hack, DejaVu Sans Mono, Inconsolata, monospace;
}
body
{
	height: 100vh;
	width: 100vw;
	position: absolute;
	background: var(--bg0color);
	background-size: cover;
	background-position: center;
}
body, html
{
	background: var(--bg0color);	
	position: relative;
	z-index: -5;
	margin: 0;
	padding: 0;
	color: var(--textcolor);
	overflow-x: hidden;
	scrollbar-color: #4D535A #151416;
}
a, input, label
{
	cursor: pointer;
	pointer-events: all;
	text-decoration: none;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
a:link, a:visited
{ color: var(--textcolor); }
a:hover
{
	color: var(--icolor) !important;
	opacity: 1 !important;
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
.mascot
{
	position: absolute;
	height: 256px;
	left: 0;
	pointer-events: none;
}
.mascot img
{
	height: 100%;
	top: -150px;
	position: relative;
}
.mascot span
{
	position: relative;
	color: var(--subtlecolor);
	left: 0.4em;
	top: calc(-100% - 0.3em);
}

.centery
{
	top: 50%;
	transform: translateY(-50%);
	position: relative;
}
.topy
{
	top: 128px;
	position: relative;
}
.interactable
{
	cursor: pointer;
	position: relative;
	border-radius: 3px;
	padding: 0.5em 1em;
	border: 1px solid var(--bordercolor);
	display: inline-block;
	font-weight: normal;
	white-space: nowrap;
	background: var(--bg2color);
	box-sizing: border-box;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	cursor: pointer;
}
.interactable.text
{ cursor: text; }
.interactable:hover, .interactable:active, .interactable:focus
{
	border-color: var(--borderhover);
	color: var(--icolor);
}
.interactable:hover
{ box-shadow: 0 0 10px 3px var(--activeshadowcolor); }
.interactable img
{
	margin-bottom: -0.125em;
	height: 1em;
}
.header
{ text-align: right; }
.header p
{ margin: 0 25px 6px; }



p.center
{
	text-align: center;
	margin: 0;
	color: var(--subtlecolor);
}
.centerx
{
	left: 50%;
	transform: translateX(-50%);
	position: relative;
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
	border-radius: 3px;
	padding: 8px;
	border: 1px solid var(--bordercolor);
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

data
{ display: none; }

.source span
{ padding: 0; }


@media screen and (max-width:90rem)
{
	.title
	{
		position: relative;
		text-align: center;
		padding: 25px 0 0;
		margin-bottom: -25px;
	}
	.searchstats
	{
		text-align: center;
		margin: 15px 0 0;
		font-size: 1em;
		position: relative;
		max-width: 100%;
	}
}
body
{ display: block !important;}


html
{
	--fadetime: 0.15s;
	--warning: yellow;
	--error: darkred;
	--valid: green;
	--mature: #009DA6;
	--explicit: #A32121;
	--icolor: #F29B17; /* F1B636 */
	--bg0color: #000000;
	--bg1color: #1E1F25;
	--bg2color: #151416;
	--bg3color: var(--bordercolor);
	--textcolor: #DDD;
	--bordercolor: #2D333A;
	--borderhover: #F29B17;
	--subtlecolor: #EEEEEE80;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;

	--pink: #aa23aa;
	--green: forestgreen;
	--blue: steelblue;
	--red: #c44f3b;
	--cyan: darkcyan;
	--violet: rebeccapurple;
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
	--borderhover: #F28817;
	--subtlecolor: #00000080;
	--shadowcolor: #6D718680;
	--activeshadowcolor: #6D7186B3;
}

html.e621
{
	--icolor: #2E76B4;
	--bg0color: #031131;
	--bg1color: #152F56;
	--bg2color: #213A5F;
	--textcolor: #EEE;
	--bordercolor: #0000;
	--borderhover: #0000;
	--subtlecolor: #B4C7D9;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;

	--pink: #f2ac08;
	--green: #0a0;
	--red: #ed5d1f;
	--cyan: #b4c7d9;
	--blue: #d0d;
	/* sienna */
}
html.e621 body
{
	background-image: url(/static/themes/stripe.png);
	background-repeat: repeat;
	background-position: center top;
	background-size: auto;
}
html.e621 main
{
	margin: 0 0.82em;
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
	--subtlecolor: #909090;
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
	--subtlecolor: #54595D;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
}
html.wikipedia body
{ background-image: linear-gradient(#FFF 2.5em,#F6F6F6 5em); }
html.wikipedia main
{
	border-top: 1px solid #A7D7F9;
	border-bottom: 1px solid #A7D7F9;
}
html.e621 .source
{
	padding: 0 0 8px;
	border: none;
}
html.e621 .top .source h2
{ margin-top: 8px; }
html.e621 .more .source .left
{ margin: 0 0 0 8px; }

html.terminal
{
	--icolor: #008000;
	--bg0color: #000000;
	--bg1color: #000000;
	--bg2color: #000000;
	--textcolor: #00FF00;
	--bordercolor: #00FF00;
	--borderhover: #008000;
	--subtlecolor: #008000;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
	filter: sepia(100%) saturate(550%) hue-rotate(90deg);
}

html.solarized-dark
{
	--icolor: #b58900;
	--bg0color: #002b36;
	--bg1color: #073642;
	--bg2color: #002b36;
	--textcolor: #93a1a1;
	--bordercolor: #586e75;
	--borderhover: #b58900;
	--subtlecolor: #657b83;
	--shadowcolor: #002b36;
	--activeshadowcolor: #2aa19820;

	--pink: #d33682;
	--green: #859900;
	--blue: #268bd2;
	--red: #cb4b16;
	--cyan: #2aa198;
	--violet: #6c71c4;
}

html.solarized-light
{
	--icolor: #cb4b16;
	--bg0color: #fdf6e3;
	--bg1color: #eee8d5;
	--bg2color: #fdf6e3;
	--textcolor: #586e75;
	--bordercolor: #586e75;
	--borderhover: #cb4b16;
	--subtlecolor: #839496;
	--shadowcolor: #93a1a1;
	--activeshadowcolor: #dc322f40;

	--pink: #d33682;
	--green: #859900;
	--blue: #268bd2;
	--red: #cb4b16;
	--cyan: #2aa198;
	--violet: #6c71c4;
}

html.furaffinity
{
	--icolor: #AFAFAF;
	--bg0color: #2E3B41;
	--bg1color: #2E3B41;
	--bg2color: #6A7283;
	--textcolor: #FFF;
	--bordercolor: #DCDCDC;
	--borderhover: #AFAFAF;
	--subtlecolor: #CFCFCF;
	--shadowcolor: #0000;
	--activeshadowcolor: #0000;
}
html.furaffinity main
{
	border-top: 1px solid var(--bordercolor);
	border-bottom: 1px solid var(--bordercolor);
}

html.discord
{
	--icolor: #7289DA;
	--bg0color: #202225;
	--bg1color: #2F3136;
	--bg2color: #26272B;
	--textcolor: #DCDDDE;
	--bordercolor: #1E1F23;
	--borderhover: #7289DA;
	--subtlecolor: #72767D;
	--shadowcolor: #202225;
	--activeshadowcolor: #202225;
}

html.xfire
{
	--icolor: #3D73D7;
	--bg0color: #000000;
	--bg1color: #12283F;
	--bg2color: #1D1C22;
	--textcolor: #ABC6E3;
	--bordercolor: #00020A;
	--borderhover: #3D73D7;
	--subtlecolor: #ABC6E3A0;
	--shadowcolor: #00000080;
	--activeshadowcolor: #000000B3;
}
html.xfire div.loadingicon img
{ filter: sepia(100%) saturate(2000%) hue-rotate(201deg) brightness(83%) }

html.xfire main
{
	background-image: linear-gradient(#8BA0E3 0, #2D6191 2px, #2D6191 4px, #00022C 5px, #0000 5px), linear-gradient(#0000 calc(100% - 5px), #8BA0E3 calc(100% - 5px), #2D6191 calc(100% - 3px), #2D6191 calc(100% - 1px), #00022C 100%), linear-gradient(#0000 0, #12283F 12.5em), url(https://cdn.kheina.com/file/kheinacom/bc83a6cc07e0c47c9b7d226ef47f556b4aeddfcf.png), linear-gradient(#030316 0, #030316 100%);
	background-position: left top, left top, left top, left top, left bottom;
}

@keyframes gay
{
	00%
	{ color: red }
	20%
	{ color: yellow }
	40%
	{ color: green }
	60%
	{ color: cyan }
	80%
	{ color: blue }
	100%
	{ color: purple }
}
html.gay *
{ animation: gay 1s infinite; }

/* accent */

/*body main.none
{ / * having "nothing" here allows us to apply accent to themes without having them be overridden by none * / }*/
/*
html.winter main
{
	background-image: url(/static/themes/snow_bottom.png), url(/static/themes/snow_top.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: 25px;
}

html.spring main
{
	background-image: url(/static/themes/snow_bottom.png), url(/static/themes/snow_top.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: 25px;
}

html.summer main
{
	background-image: url(/static/themes/snow_bottom.png), url(/static/themes/snow_top.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: 25px;
}

html.autumn main
{
	background-image: url(/static/themes/snow_bottom.png), url(/static/themes/snow_top.png);
	background-repeat: repeat-x;
	background-position: center bottom, center top;
	padding-bottom: 25px;
}

html.hex main
{
	background-image: url(/static/themes/hex.png);
	background-repeat: repeat-x;
	background-position: center top;
}

html.fox main
{
	background-image: url(/static/themes/fox.png);
	background-repeat: no-repeat;
	background-position: left bottom;
}

html.snep main
{
	background-image: url(/static/themes/snep.png);
	background-repeat: no-repeat;
	background-position: left bottom;
}
*/
</style>
