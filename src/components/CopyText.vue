<template>
	<div v-show='content'>
		<input ref='text' type='text' class='code' :value='copyValue' readonly />
		<a role='button' @click='copy'><i class='material-icons'>content_copy</i></a>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	setup() {
		const text = ref(null);
		return {
			text,
		};
	},
	props: {
		content: Object,
	},
	computed: {
		copyValue() {
			if (this.content instanceof Error)
			{ return JSON.stringify({ 'error': this.content.toString(), 'stacktrace': this.content.stack.split('\n').filter(x => x) }); }
			return JSON.stringify(this.content);
		},
	},
	methods: {
		copy() {
			this.$refs.text.select();
			document.execCommand('copy');
		},
	},
}
</script>

<style scoped>
i
{ font-size: inherit; }
a
{
	font-size: 1.2em;
	position: absolute;
	right: 0.3em;
	top: 0.4em;
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50%);
	padding-left: 1.5em;
	height: 1em;
}

div
{
	position: relative;
	margin: 0 auto 25px;
	width: 400px;
}

input
{
	font-size: 0.9em;
	width: 100%;
	width: calc(100% - 16px);
	cursor: text;
	color: var(--textolor);
	padding: 8px;
	background: var(--bg2color);
	white-space: pre-wrap;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
</style>
