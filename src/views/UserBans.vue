<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>@{{handle}} Bans</Title>
		<div class='container text' v-if='!bans'>
			<span>Loading...</span>
		</div>
		<div class='container' v-else-if='bans.length !== 0'>
			<p v-for='ban in bans'>ban: {{ ban }}</p>
		</div>
		<div class='container text' v-else>
			@{{handle}} has not been banned
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import { ref, type Ref } from 'vue';
import type { Ban } from '@/types/report';
import { khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';

const props = defineProps<{
	handle: string,
}>();
const bans: Ref<Ban[] | undefined> = ref();

khatch(`${host}/v1/bans/${props.handle}`, {
	handleError: true
}).then(
	r => r.json()
).then((r: Ban[]) => {
	bans.value = r;
	console.log(r);
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
	width: 50vw;
	min-width: 600px;
	margin: var(--margin) auto 0;
}
.mobile .container {
	width: 100%;
}
.text {
	text-align: center;
}

.action {
	margin-bottom: var(--margin);
}
.action:last-child {
	margin: 0;
}

@media only screen and (max-width: 1200px) {
	.container {
		width: auto;
	}
}
</style>
