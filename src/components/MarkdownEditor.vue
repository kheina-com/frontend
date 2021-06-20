<template>
	<div>
		<div v-if='preview' class='markdown-container'>
			<Markdown :content='value'/>
		</div>
		<textarea ref='mdTextArea' class='interactable text' v-show='!preview' v-model='value' @input='$emit(`update:value`, $event.target.value)' :style='`height: ${height}; resize: ${resize}`'></textarea>
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
	},
	emits: [
		'update:value',
	],
	data() {
		return {
			preview: this.initRendered,
		};
	},
	methods: {
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
</style>
