<template>
	<main>
		<h3 class='swagger'>
			<a :href='`https://${environment != "prod" ? "dev." : ""}fuzz.ly/docs`' target='_blank'>swagger docs</a>
		</h3>
		<div class='clicky-things'>
			<div class='timers'>
				<Countdown :endtime='date' />
				<div>
					<Timestamp :datetime='datetime' live />
				</div>
				<div>
					<Timestamp :datetime='epoch' live />
				</div>
			</div>
			<div class=''>
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
					})">
						toast
					</Button>
				</div>
			</div>
		</div>
		<div class='token'>
			<textarea class='interactable text' v-model='content' />
			<div>
				<Markdown :content='cookie' />
				<p>note: signature is not checked</p>
			</div>
		</div>
		<div class='post-tiles'>
			<ol>
				<li>
					<PostTile :key='postId' :postId='postId' :nested='true' v-bind='post' :thumbhash='thumbhash'/>
				</li>
			</ol>
			<div class='buttons'>
				<Button @click='togglePost'>toggle</Button>
				<Button @click='toggleThumbhash'>thumbhash</Button>
			</div>
		</div>
		<div class='color-text' v-show='colors.length'>
			<div v-for='color in colors' :style='"color: " + color'>
				<p>{{ color }} text</p>
				<p style='font-weight: bold'>bold {{ color }} text</p>
				<p v-for='i in [0, 1, 2]'>bg<code>{{ i }}</code> contrast: {{ contrastWithBg(color, i).toFixed(2) }}</p>
			</div>
		</div>
		<div class='color-comparer' v-show='colors.length'>
			<div v-for='i in colors.length' :style='"background: " + colors[i - 1]'>
				<p style='color: white'>white text: {{ contrast(textToColor(colors[i - 1]), textToColor('#fff')).toFixed(2)
				}}
				</p>
				<p style='color: black'>black text: {{ contrast(textToColor(colors[i - 1]), textToColor('#000')).toFixed(2)
				}}
				</p>
				<input placeholder='color' class='interactable' v-model='colors[i - 1]' />
				<Button @click='colors.splice(i - 1, 1);'><i class='material-icons-outline'>delete</i>Remove</Button>
			</div>
		</div>
		<div class='color-bar' v-show='colors.length'>
			<div v-for='i in colors.length' :style='"background: " + colors[colors.length - i]' />
		</div>
		<div class='buttons'>
			<Button @click='colors.push("#" + uuid(6))'><i class='material-icons'>add</i>Add Color</Button>
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
import ThemeMenu from '@/components/ThemeMenu.vue';
import Countdown from '@/components/Countdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Button from '@/components/Button.vue';
import notify from '$/sounds/notify.ogg';
import { authCookie, createToast } from '@/utilities';
import epoch from '@/config/constants';
import { environment } from '@/config/constants';
import Markdown from '@/components/Markdown.vue';
import PostTile from '@/components/PostTile.vue';


export default {
	name: 'Test',
	components: {
		ThemeMenu,
		Countdown,
		Timestamp,
		Button,
		Markdown,
		PostTile,
	},
	data() {
		return {
			epoch: new Date(epoch).toString(),
			date: new Date(Date.now() + 500000000).toString(),
			datetime: new Date(Date.now()).toString(),
			audio: new Audio(notify),
			content: authCookie()?.token,
			audioLoading: false,
			environment,
			colors: [],
			cutoff: null,
			thumbhash: null,
			postId: 'ugE_qTJL',
			post: {
				"post_id": "ugE_qTJL",
				"title": "Sleep With the Machine",
				"description": null,
				"user": {
					"name": "dani :trans-flag: :two-hearts:",
					"handle": "dani",
					"privacy": "public",
					"icon": "ceKamUGR",
					"verified": "admin",
					"following": true,
				},
				"score": {
					"up": 1,
					"down": 0,
					"total": 1,
					"user_vote": 1,
				},
				"rating": "mature",
				"parent": null,
				"privacy": "public",
				"created": "2023-05-09T06:30:53.743075+00:00",
				"updated": "2023-05-09T06:30:53.743075+00:00",
				"filename": "1234-web.png",
				"media_type": {
					"file_type": "png",
					"mime_type": "image/png",
				},
				"size": {
					"width": 2805,
					"height": 3000,
				},
				"blocked": false,
			},
		};
	},
	mounted() {
		this.toggleThumbhash();
	},
	methods: {
		createToast,
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
			return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
		},
		contrastWithBg(color, bg) {
			return this.contrast(this.textToColor(color), this.textToColor(getComputedStyle(document.documentElement).getPropertyValue(`--bg${bg}color`)));
		},
		toggleGray() {
			document.documentElement.style.filter ? document.documentElement.style.filter = null : document.documentElement.style.filter = "grayscale(1)";
		},
		loadTheme() {
			this.colors.length = 0;
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--textcolor`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--interact`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--pink`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--yellow`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--green`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--blue`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--orange`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--red`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--cyan`));
			this.colors.push(getComputedStyle(document.documentElement).getPropertyValue(`--violet`));
		},
		generateColors() {
			const cutoff = Math.min(parseInt(this.cutoff || 0), 20); // don't fucking crash
			this.colors.length = 0;
			while (this.colors.length < 10) {
				const newColor = '#' + this.uuid(6);
				if (this.contrastWithBg(newColor, 0) >= cutoff || this.contrastWithBg(newColor, 1) >= cutoff) { this.colors.push(newColor); }
			}
		},
		togglePost() {
			this.postId = this.postId ? null : this.post.post_id;
			console.log(this.postId);
		},
		toggleThumbhash() {
			this.thumbhash = this.thumbhash ? null : 'ktcJDwQHmWh2dJiFeGeIiHeXlp8HunYA';
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
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: 25px;
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
	margin: 0 0 25px;
}
ol > :last-child {
	margin-bottom: 0;
}

.post-tiles {
	margin-bottom: 25px;
}
.post-tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: -12.5px;
}
.post-tiles ol li {
	margin: 12.5px;
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
	grid-template-columns: [editor-start] 1fr [editor-end] 25px [preview-start] 1fr [preview-end];
	margin: 0 auto 25px;
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
	margin-bottom: 25px;
}

.token div {
	grid-area: preview;
}

.buttons {
	display: flex;
}
.buttons > * {
	margin-right: 25px;
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
	padding: 5em 25px;
}

.color-comparer div>* {
	margin: 1em 0;
}

.color-bar div {
	height: 50px;
}

.color-bar,
.color-text {
	margin-bottom: 25px;
}
</style>
