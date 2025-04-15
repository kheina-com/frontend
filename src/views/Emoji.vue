<template>
	<main>
		<input v-model='search' placeholder='Search' class='search interactable text'>
		<div class='container text' v-if='!emoji'>
			<span>Loading...</span>
		</div>
		<div class='container text' v-else-if='emoji.length === 0'>
			<span>No emoji found!</span>
		</div>
		<div class='container' v-else>
			<div class='emoji' v-for='e in emoji'>
				<EmojiC :key='e.emoji' v-bind='e'/>
				<div>
					<h2>{{ e.emoji }}</h2>
					<Profile v-bind='e.owner' v-if='e.owner'/>
				</div>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import type { Emoji } from '@/types/emoji';
import { GetAll, LookupEmoji } from '@/utilities/emoji';
import { ref, watch, type Ref } from 'vue';
import Profile from '@/components/Profile.vue';
import EmojiC from '@/components/Emoji.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const search: Ref<string | void> = ref();
const emoji: Ref<Emoji[] | void> = ref();

GetAll().then((e: Emoji[]) => emoji.value = e);

let timeout: number | null = null;
watch(search, (value: string | void) => {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}

	if (value) timeout = setTimeout(() => LookupEmoji(value).then((e: Emoji[]) => emoji.value = e), 200);
	else GetAll().then((e: Emoji[]) => emoji.value = e);
});
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
	height: 5em;
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
