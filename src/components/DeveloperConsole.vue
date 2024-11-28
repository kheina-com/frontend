<template>
	<div ref='devConsole' id='developer-console'></div>
</template>
<script setup lang="ts">
import { onUnmounted, ref, type Ref } from 'vue';
const devConsole = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

let entries = 0;
let open = false;

const activator = "`";
const listener = (e: KeyboardEvent) => {
	if (e.key !== activator) return;
	if (devConsole.value.classList.contains("open")) {
		devConsole.value.classList.remove("open");
	}
	else {
		devConsole.value.classList.add("open");
	}
};

addEventListener("keydown", listener);
const i = setInterval(() => {
	let c = 1000 - devConsole.value.childElementCount;
	for (const e of Array.from(devConsole.value.children)) {
		if (c <= 0) return;
		devConsole.value.removeChild(e);
		c--;
	}
}, 300e3);

onUnmounted(() => {
	removeEventListener("keydown", listener);
	clearInterval(i);
});
</script>
<style scoped>
#developer-console {
	background: var(--bg0color);
	position: fixed;
	width: 100vw;
	height: 50vh;
	top: -50vh;
	z-index: 1000000;
	-webkit-transition: linear 1s;
	-moz-transition: linear 1s;
	-o-transition: linear 1s;
	transition: linear 1s;
}
#developer-console.open {
	top: 0;
}
</style>
