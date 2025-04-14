<template>
	<img ref='img' :data-src='getEmojiUrl(emoji)'>
</template>
<script setup lang='ts'>
import type { Emoji } from '@/types/emoji';
import { getEmojiUrl, lazyObserver } from '@/utilities';
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

const img = ref<HTMLImageElement | void>() as Ref<HTMLImageElement>;
const emoji = defineProps<Emoji>();

onMounted(() => lazyObserver.observe(img.value));
onBeforeUnmount(() => lazyObserver.unobserve(img.value));
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}

.container {
	position: relative;
	max-width: 40em;
	margin: var(--margin) auto 0;
}
.container.text {
	text-align: center;
}

.search {
	width: 50vw;
	margin: auto;
	display: block;
}

.emoji {
	display: flex;
	margin: auto;
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: 1em;
	margin-bottom: var(--margin);
}
.emoji img {
	margin-right: var(--margin);
	max-width: 10em;
	max-height: 5em;
}
.emoji > div {
	display: flex;
	flex-flow: column;
	align-items: flex-start;
}
h2 {
	margin: 0 0 0.5em;
}

.container :last-child {
	margin: 0;
}
</style>
