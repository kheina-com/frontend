<template>
	<main>
		<h3 class='swagger'>
			<a :href='`https://${environment != "prod" ? "dev." : ""}fuzz.ly/docs`' target='_blank'>swagger docs</a>
		</h3>
		<div class='clicky-things'>
			<div class='timers'>
				<Countdown :endtime='date'/>
				<div><Timestamp :datetime='datetime' live/></div>
				<div><Timestamp :datetime='epoch' live/></div>
			</div>
			<div class='buttons'>
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
			<textarea class='interactable text' v-model='content'/>
			<div>
				<Markdown :content='cookie'/>
				<p>note: signature is not checked</p>
			</div>
		</div>
		<div class='color-text'>
			<div v-for='color in colors' :style='"color: " + color'>
				<p>{{color}} text</p>
				<p style='font-weight: bold'>bold {{color}} text</p>
			</div>
		</div>
		<div class='color-comparer'>
			<div v-for='i in colors.length' :style='"background: " + colors[i-1]'>
				<p style='color: white'>white text</p>
				<p style='color: black'>black text</p>
				<input claceholder='color' class='interactable' v-model='colors[i-1]'/>
				<Button @click='colors.splice(i-1, 1);'><i class='material-icons-outline'>delete</i>Remove</Button>
			</div>
		</div>
		<div class='color-bar'>
			<div v-for='i in colors.length' :style='"background: " + colors[colors.length-i]'/>
		</div>
		<Button @click='colors.push("")'><i class='material-icons'>add</i>Add Color</Button>
		<ThemeMenu/>
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


export default {
	name: 'Test',
	components: {
		ThemeMenu,
		Countdown,
		Timestamp,
		Button,
		Markdown,
	},
	data() {
		return {
			epoch: new Date(epoch).toString()	,
			date: new Date(Date.now() + 500000000).toString(),
			datetime: new Date(Date.now()).toString(),
			audio: new Audio(notify),
			content: authCookie()?.token,
			audioLoading: false,
			environment,
			colors: [],
		}
	},
	methods: {
		createToast,
		uuid() {
			let uuid = '';
			for (let i = 0; i < 32; i++)
			{ uuid += Math.floor(Math.random() * 16).toString(16); }
			return uuid;
		},
		playAudio() {
			this.audioLoading = true;
			this.audio.play();
			setTimeout(() => this.audioLoading = false, this.audio.duration * 1000);
		},
	},
	computed: {
		cookie() {
			try
			{
				const c = authCookie(this.content);
				if (c)
				{ delete c.token; }
				return '```json\n' + JSON.stringify(c, null, 4) + '\n```';
			}
			catch (e)
			{
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
main > div {
	margin: 0.5em 0;
}
main > :first-child {
	margin-top: 0;
}
main > :last-child {
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
ol li a {
	display: block;
}
ol li div {
	display: flex;
}
ol li div div {
	flex-direction: column;
}

ol > :last-child {
	margin-bottom: 0;
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
	color: var(--icolor);
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
.token textarea {
	grid-area: editor;
	resize: vertical;
	line-height: 1.5;
}
.token div {
	grid-area: preview;
}
.color-comparer, .color-bar, .color-text {
	display: flex;
}
.color-comparer, .color-comparer div, .color-bar, .color-bar div, .color-text, .color-text div {
	width: 100%;
	margin: 0;
}
.color-comparer input {
	margin-right: 25px;
}
.color-comparer div {
	padding: 5em 25px;
}
.color-comparer div > * {
	margin: 1em 0;
}
.color-bar div {
	height: 50px;
}
.color-bar, .color-text {
	margin-bottom: 25px;
}
</style>