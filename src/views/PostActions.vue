<template>
	<main>
		<Title>Actions Performed against {{postId}}</Title>
		<div class='container text' v-if='!actions'>
			<span>Loading...</span>
		</div>
		<div class='container' v-else-if='actions.length !== 0'>
			<Action class='action' v-bind='action' v-for='action in actions' nested/>
		</div>
		<div class='container text' v-else>
			No actions have been taken against <code>{{ postId }}</code>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import type { ModAction } from '@/types/report';
import { ref, type Ref } from 'vue';
import { khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import Action from '@/components/Action.vue';

const props = defineProps<{
	postId: string,
}>();
const actions: Ref<ModAction[] | undefined> = ref();

khatch(`${host}/v1/actions/${props.postId}`, {
	handleError: true
}).then(r => r.json())
.then(r => {
	actions.value = r;
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
