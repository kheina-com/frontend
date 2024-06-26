<template>
	<div>
		<router-link v-show='!hideGuide' class='guide' to='/md'>markdown guide</router-link>
		<div v-if='preview' class='markdown-container'>
			<Markdown :content='value'/>
		</div>
		<textarea
			ref='mdTextArea'
			class='interactable text'
			v-show='!preview'
			:value='value'
			spellcheck='true'
			@input='$emit(`update:value`, $event.target.value)'
			@keydown.tab.prevent='tab'
			@keydown='quote'
		>
		</textarea>
		<button v-if='!hidePreview' @click='togglePreview' :title='preview ? "Disable preview" : "Show preview"'><i class='material-icons-round'>{{preview ? 'visibility_off' : 'visibility'}}</i></button>
	</div>
</template>

<script>
import { tab } from '@/utilities';
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
		},
		hidePreview: {
			type: Boolean,
			default: false,
		},
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
		this.$refs.mdTextArea.style=`min-height: ${this.height}; resize: ${this.resize}`;
	},
	methods: {
		tab,
		selection(e) {
			return e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
		},
		quote(e) {
			e.target.focus();
			let text;
			switch (e.key) {
				case "(":
					text = "(" + this.selection(e) + ")";
					break;
				case "[":
					text = "[" + this.selection(e) + "]";
					break;
				case "{":
					text = "{" + this.selection(e) + "}";
					break;
				case '"':
				case "'":
				case "*":
				case "_":
					if (e.target.selectionStart !== e.target.selectionEnd) {
						text = e.key + this.selection(e) + e.key;
					}
					else {
						text = e.key;
					}
					break;
				default:
					return;
			}

			e.preventDefault();

			const start = e.target.selectionStart;
			const end = e.target.selectionEnd;
			if (!document.execCommand || !document.execCommand("insertText", false, text)) {
				e.target.value = e.target.value.substring(0, start) + text + e.target.value.substring(end);
			}
			e.target.selectionStart = start + 1;
			e.target.selectionEnd = end + 1;
		},
		togglePreview() {
			this.preview = !this.preview;
		},
	},
}
</script>

<style scoped>
div {
	position: relative;
}
textarea {
	display: block;
	width: 100%;
	padding: 0.5em;
	height: 100%;
}
div:has(button) > textarea.interactable.text {
	padding: 0.5em 2em 0.5em 0.5em;
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
	padding: var(--margin);
	border-radius: var(--border-radius);
}
.markdown {
	--bg3color: var(--bg0color);
	--bg2color: var(--bg1color);
}
.guide {
	position: absolute;
	right: var(--margin);
	top: -1.3em;
	font-size: 0.9em;
	text-decoration: none;
	display: block;
	text-align: right;
}
</style>
