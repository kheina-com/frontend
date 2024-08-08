<template>
	<div class='cookies' v-show='!cookies'>
		<div>
			<p>This website uses cookies.</p>
			<p><a href='https://en.wikipedia.org/wiki/HTTP_cookie'>what are cookies?</a></p>
		</div>
		<button id='cookies' class='interactable' @click='cookies = true'>coolio</button>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import store from '@/globals';

const globals = store();
const cookies: Ref<boolean> = ref(globals.cookies);
watch(cookies, globals.cookiesAllowed);
</script>

<style scoped>
.cookies {
	position: fixed;
	left: var(--margin);
	bottom: var(--margin);
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: var(--margin);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	z-index: 1;
	display: flex;
}
.interactable {
	margin: 0 0 0 var(--margin);
	display: inline-block;
}
.cookies a:link, .cookies a:visited {
	font-size: 0.8em;
	color: var(--subtle);
}
#cookies {
	background: var(--bg3color);
}
</style>
