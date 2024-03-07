<template>
	<div>
		<router-link v-show='!hideGuide' class='guide' to='/md'>markdown guide</router-link>
		<div v-if='preview' class='markdown-container'>
			<Markdown :content='value'/>
		</div>
		<textarea ref='mdTextArea' class='interactable text' v-show='!preview' :value='value' @input='$emit(`update:value`, $event.target.value)' @keydown.tab.prevent='tab'></textarea>
		<button @click='togglePreview' :title='preview ? `Disable preview` : `Show preview`'><i class='material-icons-round'>{{preview ? 'visibility_off' : 'visibility'}}</i></button>
	</div>
</template>

<script>
import { ref } from 'vue';
import Markdown from '@/components/Markdown.vue';

export default {
	name: 'MarkdownEditor',
	components: {
		Markdown,
	},
	setup() {
		const mdTextArea = ref(null);
		return {
			mdTextArea,
		};
	},
	props: {
		value: {
			type: String,
			default: '',
		},
		height: {
			type: String,
			default: '5rem',
		},
		resize: {
			type: String,
			default: 'both',
		},
		initRendered: {
			type: Boolean,
			default: false,
		},
		hideGuide: {
			type: Boolean,
			default: false,
		}
	},
	emits: [
		'update:value',
	],
	data() {
		return {
			preview: this.initRendered,
		};
	},
	mounted() {
		this.$refs.mdTextArea.style=`height: ${this.height}; resize: ${this.resize}`;
	},
	methods: {
		togglePreview() {
			this.preview = !this.preview;
		},
		tab(e) {
			const start = e.target.selectionStart;
			e.target.value = e.target.value.substring(0, e.target.selectionStart) + "\t" + e.target.value.substring(e.target.selectionEnd);
			e.target.selectionStart = e.target.selectionEnd = start + 1;
			// e.target.focus();
			return "\t";
		}
	},
}
</script>

<style scoped>
div {
	position: relative;
}
textarea.interactable.text {
	display: block;
	width: 100%;
	padding: 0.5em 2em 0.5em 0.5em;
	height: 100%;
}
button {
	position: absolute;
	top: 0;
	right: 0;
	padding: 0.5em;
}
button i {
	font-size: 1em;
	display: block;
}
.markdown-container {
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	padding: 25px;
	border-radius: var(--border-radius);
}
.markdown {
	--bg3color: var(--bg0color);
	--bg2color: var(--bg1color);
}
.guide {
	position: absolute;
	right: 25px;
	top: -1.3em;
	font-size: 0.9em;
	text-decoration: none;
	display: block;
	text-align: right;
}
</style>
