<template>
	<button @click.prevent.stop='fav'>
		<div>
			<i class='material-icons-round'>favorite</i>
			<span>{{count !== null ? abbreviate(count) : 'loading'}}</span>
		</div>
	</button>
</template>

<script setup lang="ts">
import store from '@/globals';
import { abbreviate } from '@/utilities';
import { ref } from 'vue';

const props = withDefaults(defineProps<{
	postId?: string | null,
	count?: number,
}>(), {
	count: 0,
});
const count = ref(props.count);
const emits = defineEmits(["update:count"]);
const globals = store();

function fav() {
	emits("update:count", ++count.value);
	globals.createToast({
		title: "This function does not exist yet",
		description: "Sorry!",
		icon: "favorite_border",
	});
}
</script>

<style scoped>
div {
	display: flex;
	padding: 0.375em;
	align-items: center;
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
i {
	padding-right: 0.25em;
	font-size: 1.5em;
	display: block;
}
.tile i {
	font-size: 1.2em;
	padding: 0;
}
button {
	color: var(--subtle);
	background: #0000;
	position: relative;
}
.tile button {
	margin: -0.1em -0.25em -0.25em;
}
.tile span {
	display: none;
}
button:hover div {
	color: var(--interact);
	background: var(--bg2color);
}
.nested button:hover div {
	background: var(--bg1color);
}
</style>
