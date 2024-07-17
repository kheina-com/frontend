<template>
	<main>
		<h3 class='swagger'>
			<a :href='`${host}/docs`' target='_blank'>swagger docs</a>
		</h3>
		<div class='clicky-things'>
			<div class='timers'>
				<Countdown :endtime='date'/>
				<div>
					<Timestamp :datetime='datetime' live/>
				</div>
				<div>
					<Timestamp :datetime='epoch' live/>
				</div>
			</div>
			<div>
				<div>
					<Button @click='playAudio' :isLoading='audioLoading'>
						play me
					</Button>
				</div>
				<div>
					<Button @click="createToast({
						title: 'You just created an error toast',
						description: 'If you submit a bug report, please include the data below.',
						dump: {
							error: 'This Is Not A Real Error',
							refid: uuid(),
							status: 0xdeadbeef,
						},
						time: 10000,
					})">
						toast
					</Button>
				</div>
			</div>
		</div>
		<div class='token'>
			<textarea class='interactable text' v-model='content'/>
			<div>
				<Markdown :content='cookie'/>
				<p>note: signature is not checked</p>
			</div>
		</div>
		<div class='post-tiles'>
			<ol>
				<li>
					<PostTile :postId='post?.post_id' v-bind='post' :nested='true'/>
				</li>
			</ol>
			<div class='buttons'>
				<Button @click='togglePost'>toggle</Button>
				<Button @click='toggleThumbhash'>thumbhash</Button>
				<input placeholder='post' class='interactable' v-model='postId'/>
			</div>
		</div>
		<div class='post-tiles'>
			<div class='buttons'>
				<Button @click='dumpStore'>dump</Button>
			</div>
		</div>
		<Spinner :loaded='loaded' :total='1000000000' style='margin: auto'/>
		<div class='slider'>
			<input type='range' min='0' max='1000000000' step='10000' v-model='loaded'>
			<span>{{ loaded }}</span>
		</div>
		<div ref='ellipse' class='ellipse'>
		</div>
		<div class='slider'>
			<input type='range' min='0' max='10' step='0.001' v-model='speed'>
			<span>{{ speed }}</span>
		</div>
		<div class='color-text' v-show='colors.length'>
			<div v-for='color in colors' :style='"color: " + color'>
				<p>{{ color }} text</p>
				<p style='font-weight: bold'>bold text</p>
				<p v-for='i in [0, 1, 2]' :style='`background: var(--bg${i}color)`'>bg<code>{{ i }}</code> contrast: {{ contrastWithBg(color, i).toFixed(2) }}</p>
			</div>
		</div>
		<div class='color-comparer' v-show='colors.length'>
			<div v-for='i in colors.length' :style='"background: " + colors[i - 1]'>
				<p style='color: white'>white text: {{ contrast(textToColor(colors[i - 1]), textToColor('#fff')).toFixed(2) }}</p>
				<p style='color: black'>black text: {{ contrast(textToColor(colors[i - 1]), textToColor('#000')).toFixed(2) }}</p>
				<input placeholder='color' class='interactable' v-model='colors[i - 1]' />
				<Button @click='colors.splice(i - 1, 1);'><i class='material-icons-outline'>delete</i><span>Remove</span></Button>
			</div>
		</div>
		<div class='color-bar' v-show='colors.length'>
			<div v-for='i in colors.length' :style='"background: " + colors[colors.length - i]'/>
		</div>
		<div class='buttons'>
			<Button @click='colors.push("#" + uuid(6))'><i class='material-icons'>add</i><span>Add Color</span></Button>
			<Button @click='loadTheme'>Load Theme</Button>
			<Button @click='toggleGray'>Toggle Grayscale</Button>
			<Button @click='generateColors'>Generate!</Button>
			<input placeholder='contrast cutoff' class='interactable' v-model='cutoff' />
		</div>
		{{ colors }}
		<ThemeMenu />
	</main>
</template>

<script>
import { ref } from 'vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Countdown from '@/components/Countdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Button from '@/components/Button.vue';
import notify from '$/sounds/notify.ogg';
import { authCookie, createToast, khatch } from '@/utilities';
import epoch from '@/config/constants';
import { host } from '@/config/constants';
import Markdown from '@/components/Markdown.vue';
import PostTile from '@/components/PostTile.vue';
import Spinner from '@/components/Spinner.vue';


export default {
	name: 'Test',
	components: {
		ThemeMenu,
		Countdown,
		Timestamp,
		Button,
		Markdown,
		PostTile,
		Spinner,
	},
	setup() {
		const ellipse = ref(null);
		return {
			ellipse,
		};
	},
	data() {
		return {
			epoch: new Date(epoch).toString(),
			date: new Date(Date.now() + 500000000).toString(),
			datetime: new Date(Date.now()).toString(),
			audio: new Audio(notify),
			content: authCookie()?.token,
			audioLoading: false,
			host,
			colors: [],
			cutoff: null,
			postId: null,
			post: null,
			speed: 1,
			loaded: 1,
			animate: true,
			thumbhash: null,
		};
	},
	mounted() {
		this.postId = "ugE_qTJL";
		this.$refs.ellipse.style = "position: relative; margin: auto";
		const width = 500;
		const x = width / 2;
		const y = width / 2;
		this.$refs.ellipse.style.width = `${width}px`;
		this.$refs.ellipse.style.height = `${width}px`;
		const c = 3;
		const orbsize = 4;
		const squish = 1/3;
		for (let i = 0; i < c; i++) {
			this.drawEllipse(x + orbsize / 2 + 1, y + orbsize / 2 + 1, x, squish, i / c / 2);
		}
		for (let i = 0; i < c; i++) {
			const e = document.createElement("div");
			e.className = "dot";
			// e.style.border = `${orbsize}px solid var(--interact)`;
			for (let data in this.$refs.ellipse.dataset) {
				e.dataset[data] = "";
			}
			this.$refs.ellipse.appendChild(e);
			this.rotator(x, y, x, squish, i / c / 2, 1, e, i / c);
		}
	},
	unmounted() {
		document.documentElement.style.filter = null;
		this.animate = false;
	},
	methods: {
		createToast,
		rotator(x, y, radius, squish, rotation, speed, element, position=0) {
			// element = this.$refs.ellipse.childNodes[0];
			// console.log(x, y, radius, squish, rotation, speed, element);
			let lastruntime = Date.now();
			const r = () => {
				const runtime = Date.now();
				position += (runtime - lastruntime) / 1000 * this.speed;
				const [xi, yi] = this.ellipsePoint(radius, squish, rotation, position);
				// console.log(position, xi, yi);
				element.style.left = `${x + xi}px`;
				element.style.top = `${y + yi}px`;
				lastruntime = runtime;
				if (this.animate) {
					setTimeout(r, 0);
				}
			};
			r();
		},
		ellipsePoint(radius, squish, rotation, percent) {
			const rads = Math.PI * percent * 2;
			const x = (radius * Math.cos(rads));
			const y = (radius * Math.sin(rads)) * squish;

			const rot = Math.PI * rotation * 2;
			return [x * Math.cos(rot) - y * Math.sin(rot), y * Math.cos(rot) + x * Math.sin(rot)];
		},
		drawEllipse(x, y, radius, squish, rotation) {
			const rot = Math.PI * rotation * 2;
			const e = document.createElement("div");
			e.style.position = "absolute";
			e.style.width = `${radius * 2}px`;
			e.style.height = `${radius * squish * 2}px`;
			e.style.left = `${x - radius}px`;
			e.style.top = `${y - radius * squish}px`;
			e.style.border = "var(--border-size) solid var(--bordercolor)";
			e.style.rotate = `${rot}rad`;
			e.style.borderRadius = "50%";
			this.$refs.ellipse.appendChild(e);
		},
		uuid(len = 32) {
			let uuid = '';
			for (let i = 0; i < len; i++) { uuid += Math.floor(Math.random() * 16).toString(16); }
			return uuid;
		},
		playAudio() {
			this.audioLoading = true;
			this.audio.play();
			setTimeout(() => this.audioLoading = false, this.audio.duration * 1000);
		},
		textToColor(string) {
			if (string.startsWith('#')) {
				if (string.length === 7) {
					return {
						R: parseInt(string.substr(1, 2), 16),
						G: parseInt(string.substr(3, 2), 16),
						B: parseInt(string.substr(5, 2), 16),
					};
				}

				if (string.length === 4) {
					return {
						R: parseInt(string.substr(1, 1) + string.substr(1, 1), 16),
						G: parseInt(string.substr(2, 1) + string.substr(2, 1), 16),
						B: parseInt(string.substr(3, 1) + string.substr(3, 1), 16),
					};
				}
			}

			if (string.toLowerCase().startsWith('rgb')) {
				const match = string.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/i);
				return {
					R: parseInt(match[1]),
					G: parseInt(match[2]),
					B: parseInt(match[3]),
				};
			}

			return {
				R: 0,
				G: 0,
				B: 0,
			};
		},
		lum(c) {
			const RsRGB = c.R / 255;
			const GsRGB = c.G / 255;
			const BsRGB = c.B / 255;

			const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : ((RsRGB + 0.055) / 1.055) ** 2.4;
			const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : ((GsRGB + 0.055) / 1.055) ** 2.4;
			const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : ((BsRGB + 0.055) / 1.055) ** 2.4;

			return 0.2126 * R + 0.7152 * G + 0.0722 * B;
		},
		contrast(c1, c2) {
			const l1 = this.lum(c1);
			const l2 = this.lum(c2);
			return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
		},
		contrastWithBg(color, bg) {
			return this.contrast(this.textToColor(color), this.textToColor(getComputedStyle(document.documentElement).getPropertyValue(`--bg${bg}color`)));
		},
		toggleGray() {
			document.documentElement.style.filter ? document.documentElement.style.filter = null : document.documentElement.style.filter = "grayscale(1)";
		},
		ctoh(c) {
			return Math.floor(c / 16).toString(16) + (c % 16).toString(16);
		},
		loadTheme() {
			const colors = [
				getComputedStyle(document.documentElement).getPropertyValue(`--textcolor`),
				getComputedStyle(document.documentElement).getPropertyValue(`--interact`),
				getComputedStyle(document.documentElement).getPropertyValue(`--pink`),
				getComputedStyle(document.documentElement).getPropertyValue(`--yellow`),
				getComputedStyle(document.documentElement).getPropertyValue(`--green`),
				getComputedStyle(document.documentElement).getPropertyValue(`--blue`),
				getComputedStyle(document.documentElement).getPropertyValue(`--orange`),
				getComputedStyle(document.documentElement).getPropertyValue(`--red`),
				getComputedStyle(document.documentElement).getPropertyValue(`--cyan`),
				getComputedStyle(document.documentElement).getPropertyValue(`--violet`),
			];
			this.colors = colors.map(e => {
				const m = e.match(/^\w+$/);
				if (!m) {
					return e;
				}
				const d = document.createElement("div");
				d.style.color = e;
				document.documentElement.appendChild(d);
				const c = this.textToColor(getComputedStyle(d, null).color);
				document.documentElement.removeChild(d);
				return `#${this.ctoh(c.R)}${this.ctoh(c.G)}${this.ctoh(c.B)}`;
			});
		},
		generateColors() {
			const cutoff = Math.min(parseInt(this.cutoff || 0), 20); // don't fucking crash
			this.colors.length = 0;
			for (let i = 0; i < 10000 && this.colors.length < 10; i++) {
				const newColor = '#' + this.uuid(6);
				if (this.contrastWithBg(newColor, 0) >= cutoff || this.contrastWithBg(newColor, 1) >= cutoff) {
					this.colors.push(newColor);
				}
			}
		},
		togglePost() {
			this.postId = this.postId ? null : this.post.post_id;
			console.log(this.postId);
		},
		dumpStore() {
			console.log('this.$store.state:', this.$store.state);
		},
		toggleThumbhash() {
			const th = this.thumbhash;
			this.thumbhash = this.post?.thumbhash;
			this.post.thumbhash = th;
			if (th === null) {
				document.getElementsByClassName("th")[0].dispatchEvent(new Event('load'));
			}
		},
	},
	computed: {
		cookie() {
			try {
				const c = authCookie(this.content);
				if (c) { delete c.token; }
				return '```json\n' + JSON.stringify(c, null, 4) + '\n```';
			}
			catch (e) {
				console.error(e);
				return 'could not decode token';
			}
		},
	},
	watch: {
		postId(value) {
			console.log(value);
			if (value && value.length === 8) {
					khatch(`${host}/v1/post/${value}`, {
					errorMessage: 'Could not retrieve post!',
				}).then(response => {
					response.json().then(r => {
						r.favorites = 0;
						r.reposts = 0;
						this.post = r;
					});
				});
			}
		},
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}

main>div {
	margin: 0.5em 0;
}

main> :first-child {
	margin-top: 0;
}

main> :last-child {
	margin-bottom: 0;
}

ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}

.ellipse .dot {
	position: absolute;
	width: 0;
	height: 0;
	border: 4px solid var(--interact);
	border-radius: 50%;
}
.post-tiles {
	margin-bottom: var(--margin);
}
.post-tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: var(--neg-half-margin);
}
.post-tiles ol li {
	margin: var(--half-margin);
}

.user-field {
	display: flex;
	align-items: center;
	color: var(--textcolor);
}

.user-field span button {
	color: var(--textcolor);
}

.user-field span button:hover {
	color: var(--interact);
}

i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}

.swagger {
	text-align: center;
}

.clicky-things {
	display: flex;
	justify-content: space-around;
}

.clicky-things div div {
	margin: 0.5em 0;
}

.token {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] var(--margin) [preview-start] 1fr [preview-end];
	margin: 0 auto var(--margin);
	min-width: 1000px;
	position: relative;
}

.mobile .token {
	display: flex;
	flex-direction: column;
	min-width: initial;
}

.token textarea {
	grid-area: editor;
	width: 100%;
	resize: vertical;
	line-height: 1.5;
}

.mobile .token textarea {
	height: 15em;
	margin-bottom: var(--margin);
}

.token div {
	grid-area: preview;
}

.buttons {
	display: flex;
}
.buttons > * {
	margin-right: var(--margin);
}
.buttons > *:last-child {
	margin-right: 0;
}

.color-comparer,
.color-bar,
.color-text {
	display: flex;
}

.color-comparer,
.color-comparer div,
.color-bar,
.color-bar div,
.color-text,
.color-text div {
	width: 100%;
	margin: 0;
}

.color-comparer input {
	width: 7em;
}

.color-comparer div {
	padding: 5em var(--margin);
}

.color-comparer div>* {
	margin: 1em 0;
}

.color-bar div {
	height: 50px;
}

.color-bar,
.color-text {
	margin-bottom: var(--margin);
}

.slider {
	display: flex;
	width: 100%;
	height: 1.5em;
	align-items: center;
	margin-top: var(--margin);
}
.slider span {
	width: 2em;
	text-align: right;
	margin-left: 0.5em;
}
.slider input {
	/* margin-top: 0.75em; */
	display: initial;
	width: 100%;
	border-top: solid 1px var(--subtle);
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	height: 0.25em;
	background: var(--subtle);
	opacity: 0.75;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	border-radius: 0.25em;
	outline: none;
}
.slider input:hover {
	opacity: 1;
}
.slider input::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 1em;
	height: 1.5em;
	background: var(--interact);
	cursor: pointer;
	border-radius: 0.5em;
}
.slider input::-moz-range-thumb {
	outline: none;
	width: 1em;
	height: 1.5em;
	background: var(--interact);
	cursor: pointer;
	border-radius: 1em;
}

.spinner svg {
	margin: auto;
	display: block;
}
.spinner circle {
	fill: transparent;
	stroke: black;
	stroke-width: 2;
	stroke-dasharray: 250;
	stroke-dashoffset: 1000;
	animation: rotate 5s linear infinite;
}

@keyframes rotate {
	to {
		stroke-dashoffset: 0;
	}
}
</style>
