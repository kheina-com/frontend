<template>
	<div class='content' v-show='content'>
		<div ref='popup' class='popup'>
			<div/>
			<p style="position: relative;">copied!</p>
		</div>
		<input ref='text' type='text' class='code' :value='copyValue' readonly/>
		<a role='button' @click='copy'><i class='material-icons'>content_copy</i></a>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	setup() {
		const text = ref(null);
		const popup = ref(null);
		return {
			text,
			popup,
		};
	},
	props: {
		content: Object,
	},
	computed: {
		copyValue() {
			if (this.content instanceof Error) {
				return JSON.stringify({ 'error': this.content.toString(), 'stacktrace': this.content.stack.split('\n').filter(x => x) });
			}
			if (this.content instanceof Object) {
				return JSON.stringify(this.content);
			}
			return this.content;
		},
	},
	methods: {
		copy() {
			navigator.clipboard.writeText(this.copyValue)
			.catch(() => {
				this.$refs.text.select();
				document.execCommand('copy');
			})
			.then(() => {
				this.$refs.popup.style.display = 'block';
				if (this.t) {
					clearTimeout(this.t);
				}
				this.t = setTimeout(() => { this.t = null; this.$refs.popup.style.display = null }, 5000);
			});
		},
	},
}
</script>

<style scoped>
i {
	font-size: inherit;
}
a {
	font-size: 1.2em;
	position: absolute;
	right: 0.3em;
	top: 0.4em;
	background: linear-gradient(to right, #0000 0, var(--bg1color) 50%);
	padding-left: 1.5em;
	height: 1em;
}

.content {
	position: relative;
	margin: 0 auto var(--margin);
	width: 400px;
}

input {
	font-size: 0.9em;
	width: 100%;
	width: calc(100% - 16px);
	cursor: text;
	color: var(--textolor);
	padding: 8px;
	background: var(--bg1color);
	white-space: pre-wrap;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}

.popup {
	display: none;
	position: absolute;
	pointer-events: none;
	color: var(--textcolor);
	bottom: 150%;
	right: -1.4em;
	background: var(--bg1color);
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.popup div {
	border-bottom: var(--border-size) solid var(--bordercolor);
	border-right: var(--border-size) solid var(--bordercolor);
	width: 1.2em;
	height: 1.2em;
	border-bottom-right-radius: var(--border-radius);
	position: absolute;
	bottom: -0.67em;
	background: var(--bg1color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
.popup p {
	position: relative;
	white-space: nowrap;
}
</style>
