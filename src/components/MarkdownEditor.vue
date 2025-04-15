<template>
	<div @keydown.esc='clearEmojis'>
		<router-link v-show='!hideGuide' class='guide' to='/md'>markdown guide</router-link>
		<ol v-if='emojis' class='emojis markdown'>
			<li v-for='(e, i) in emojis' :id='`${refId}-${i}`' :class='i === selectedEmoji ? "selected" : ""' @mouseover='selectedEmoji = i'><button @click='() => emojiReplace(e)'><img class='emoji' :title='e.emoji' :alt='e.alt ?? e.emoji' :src='getEmojiUrl(e)'>{{ e.emoji }}</button></li>
		</ol>
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
			@keydown.tab.prevent='onTab'
			@keydown.enter='onEnter'
			@keydown.up='onUp'
			@keydown.down='onDown'
			@keydown='quote'
			@selectionchange='input'
		>
		</textarea>
		<button class='visibility' v-if='!hidePreview' @click='togglePreview' :title='preview ? "Disable preview" : "Show preview"'><i class='material-icons-round'>{{preview ? "visibility_off" : "visibility"}}</i></button>
	</div>
</template>
<script setup lang='ts'>
import type { Emoji } from '@/types/emoji';
import { getEmojiUrl, RefId, tab } from '@/utilities';
import { onMounted, ref, toRef, watch, type Ref } from 'vue';
import Markdown from '@/components/Markdown.vue';
import { LookupEmoji } from '@/utilities/emoji';

const mdTextArea = ref<HTMLTextAreaElement | null>(null) as Ref<HTMLTextAreaElement>;
const props = withDefaults(defineProps<{
	value:         string | null,
	height?:       string,
	resize?:       string,
	initRendered?: boolean,
	hideGuide?:    boolean,
	hidePreview?:  boolean,
}>(), {
	height:       "5rem",
	resize:       "both",
	initRendered: false,
	hideGuide:    false,
	hidePreview:  false,
});
const emits = defineEmits(["update:value"]);
const content = toRef(props, "value");
const preview: Ref<boolean> = ref(props.initRendered);
const emojis: Ref<Emoji[] | null> = ref(null);
const selectedEmoji: Ref<number | null> = ref(null);
const refId = RefId();

onMounted(() => {
	mdTextArea.value.style.minHeight = props.height;
	mdTextArea.value.style.resize = props.resize;
});

function clearEmojis() {
	emojis.value = null;
	selectedEmoji.value = null;
}

function partialEmoji(target: HTMLTextAreaElement): { start: number, end: number, match: string } | undefined {
	if (target.selectionStart !== target.selectionEnd) return;

	const cursor = target.selectionStart ?? 0;
	const start = target.value.lastIndexOf(":", cursor ? cursor - 1 : cursor);
	const end = (() => {
		const m = target.value.substring(cursor).match(/:|\s|$/);
		if (m?.index) return m.index + cursor;
		return cursor;
	})();

	if (start < 0 || start === end) return;
	const match = (() => {
		const m = target.value.substring(start + 1, end).match(/^([a-z0-9\-\.]+)$/);
		if (m) return m[0];
		return null;
	})();

	if (!match) return;

	return {
		start,
		end,
		match,
	}
}

function emojiReplace(e: Emoji) {
	const target = mdTextArea.value;
	const m = partialEmoji(target);
	if (!m) return;
	if (target.value.length > m.end + 1 && target.value.substring(m.end, m.end + 1) === ":") m.end++;

	const text = `:${e.emoji}:`;
	target.selectionStart = m.start;
	target.selectionEnd = m.end;
	if (!document.execCommand || !document.execCommand("insertText", false, text)) {
		target.value = target.value.substring(0, m.start) + text + target.value.substring(m.end);
	}
	target.selectionEnd = target.selectionStart = m.start + text.length;
	emits("update:value", target.value);
	clearEmojis();
}

async function input(e: Event) {
	const m = partialEmoji(e.target as HTMLTextAreaElement);
	if (!m) return clearEmojis();

	LookupEmoji(m.match).then(em => {
		emojis.value = em;
		if (em) selectedEmoji.value = 0;
	});
}

function emit(e: Event): void {
	input(e);
	return emits("update:value", (e.target as HTMLTextAreaElement).value);
}

function onEnter(e: KeyboardEvent) {
	if (!emojis.value || selectedEmoji.value === null || selectedEmoji.value >= emojis.value.length) return;
	e.preventDefault();
	emojiReplace(emojis.value[selectedEmoji.value]);
}

function onTab(e: KeyboardEvent) {
	if (!emojis.value || selectedEmoji.value === null || selectedEmoji.value >= emojis.value.length) return tab(e);
	emojiReplace(emojis.value[selectedEmoji.value]);
}

function onUp(e: KeyboardEvent) {
	if (!emojis.value) return;
	e.preventDefault();

	if (selectedEmoji.value === null) {
		const i = emojis.value.length - 1;
		const e = document.getElementById(`${refId}-${i}`);
		if (e === null || e.parentElement === null) return selectedEmoji.value = i;

		e.parentElement.scrollTo(0, e.offsetTop);
		selectedEmoji.value = i;
		return;
	}
	selectedEmoji.value = Math.max(selectedEmoji.value - 1, 0);
}

function onDown(e: KeyboardEvent) {
	if (!emojis.value) return;
	e.preventDefault();

	if (selectedEmoji.value === null) return selectedEmoji.value = 0;
	selectedEmoji.value = Math.min(selectedEmoji.value + 1, emojis.value.length - 1);
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

watch(selectedEmoji, i => {
	if (i === null) return;
	const e = document.getElementById(`${refId}-${i}`);
	if (e === null || e.parentElement === null) return;

	const offset = e.offsetTop - e.parentElement.scrollTop;
	if (offset + e.offsetHeight > e.parentElement.offsetHeight) {
		e.parentElement.scrollBy(0, e.offsetHeight);
	}
	else if (offset < 0) {
		e.parentElement.scrollBy(0, -e.offsetHeight);
	}
});
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
button.visibility {
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
.emojis {
	position: absolute;
	list-style: none;
	z-index: 1;
	bottom: 100%;
	bottom: calc(100% - var(--border-size));
	background: var(--bg2color);
	border-radius: var(--border-radius) var(--border-radius) 0 0;
	border: var(--border-size) solid var(--bordercolor);
	border-bottom: none;
	padding: 0.25em;
	margin: 0;
	max-height: 11em;
	overflow: scroll;
}
.emojis li {
	padding: 0.25em 0.5em;
}
.emojis .selected {
	background: var(--bg1color);
	border-radius: var(--border-radius);
}
.emoji {
	margin-right: 0.25em;
}
</style>
