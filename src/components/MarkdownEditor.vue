<template>
	<div>
		<router-link v-show='!hideGuide' class='guide' to='/md'>markdown guide</router-link>
		<div v-if='preview' class='markdown-container'>
			<Markdown :content='content'/>
		</div>
		<textarea
			ref='mdTextArea'
			class='interactable text'
			v-show='!preview'
			v-model='content'
			spellcheck='true'
			@input='emit'
			@keydown.tab.prevent='tab'
			@keydown='quote'
		>
		</textarea>
		<button v-if='!hidePreview' @click='togglePreview' :title='preview ? "Disable preview" : "Show preview"'><i class='material-icons-round'>{{preview ? 'visibility_off' : 'visibility'}}</i></button>
	</div>
</template>

<script setup lang="ts">
import { tab } from '@/utilities';
import { onMounted, ref, toRef, watch, type Ref } from 'vue';
import Markdown from '@/components/Markdown.vue';

const mdTextArea = ref<HTMLTextAreaElement | null>(null) as Ref<HTMLTextAreaElement>;
const props = withDefaults(defineProps<{
	value: string | null,
	height: string,
	resize: string,
	initRendered: boolean,
	hideGuide: boolean,
	hidePreview: boolean,
}>(), {
	height: "5rem",
	resize: "both",
	initRendered: false,
	hideGuide: false,
	hidePreview: false,
});
const emits = defineEmits(["update:value"]);
const content = toRef(props, "value");
const preview: Ref<boolean> = ref(props.initRendered);

onMounted(() => {
	mdTextArea.value.style.minHeight = props.height;
	mdTextArea.value.style.resize = props.resize;
})

function emit(e: Event): void {
	return emits("update:value", (e.target as HTMLTextAreaElement).value);
}

function selection(target: HTMLTextAreaElement) {
	return target.value.substring(target.selectionStart, target.selectionEnd);
}

function quote(e: KeyboardEvent) {
	const target = e.target as HTMLTextAreaElement;
	target.focus();
	let text;
	switch (e.key) {
	case "(":
		text = "(" + selection(target) + ")";
		break;
	case "[":
		text = "[" + selection(target) + "]";
		break;
	case "{":
		text = "{" + selection(target) + "}";
		break;
	case '"':
	case "'":
	case "*":
	case "_":
		if (target.selectionStart !== target.selectionEnd) {
			text = e.key + selection(target) + e.key;
		}
		else {
			text = e.key;
		}
		break;
	default:
		return;
	}

	e.preventDefault();

	const start = target.selectionStart ?? 0;
	const end = target.selectionEnd ?? 0;
	if (!document.execCommand || !document.execCommand("insertText", false, text)) {
		target.value = target.value.substring(0, start) + text + target.value.substring(end);
	}
	target.selectionStart = start + 1;
	target.selectionEnd = end + 1;
}
 
function togglePreview() {
	preview.value = !preview.value;
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
