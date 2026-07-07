<template>
	<div :class='props.user.self ? "message self" : "message"'>
		<MicroProfile v-bind='user'/>
		<div class='bubble'>
			<Markdown :content='content' lazy/>
			<div class='info'>
				<p class='username' :style='"color:" + color'>{{ user.name }}</p>
				<p class='timestamp' :title='absoluteTime'>{{ created.toLocaleTimeString().toLowerCase() }}</p>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import type { Message } from '@/types/chat';
import MicroProfile from './MicroProfile.vue';
import Markdown from './Markdown.vue';

interface Props extends Message {
	color: string,
}

const props = defineProps<Props>();
const yearRepl = `, ${new Date().getFullYear()}`;
const absoluteTime = props.created
.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })
.replace(yearRepl, "")
+ ", "
+ props.created.toLocaleTimeString()
.toLowerCase()
</script>
<style>
.self .bubble .markdown .gigamoji {
	justify-content: flex-end;
}
</style>
<style scoped>
.message {
	display: flex;
	align-items: flex-end;
	flex-direction: row;
}
.message.self {
	flex-direction: row-reverse;
}
.bubble {
	font-size: 0.9em;
	display: flex;
	background: var(--bg1color);
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	margin: 0 0.25em;
	flex-direction: column;
	align-items: flex-start;
	max-width: 80%;
}
.bubble > .info {
	display: flex;
}
.self .bubble {
	align-items: flex-end;
	background: var(--bg3color);
}
.bubble:has(p.gigamoji:only-child) {
	background: none;
}
.username {
	font-size: 0.8em;
	margin-right: 1em;
}
.timestamp {
	color: var(--subtle);
	font-size: 0.75em;
}
</style>
