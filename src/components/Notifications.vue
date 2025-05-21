<template>
	<div class='notifications' v-if='show'>
		<div/>
		<p v-translate:enable_notifications>Enable push notifications</p>
		<Button class='interactable' @click='enableNotifications' :isLoading='loading'><span v-translate:enable>Enable</span></Button>
		<button class='close' @click='hide = true'><i class='material-icons'>close</i></button>
	</div>
</template>
<script setup lang='ts'>
import { computed, ref, toRef, type Ref } from 'vue';
import store from '@/globals';
import { GetConfig, SetConfig } from '@/config/store';
import startNotifications, { conf, logstr } from '@/notifications';
import Button from '@/components/Button.vue';

const loading: Ref<boolean> = ref(false);
const registered: Ref<boolean> = ref(true);
const hide: Ref<boolean> = ref(false);
const user = toRef(store(), "user");
console.debug(logstr, "user:", user.value, "hide:", hide.value, "registered:", registered.value);
const show = computed(() => user.value && !hide.value && !registered.value);

GetConfig(conf, null, "number").then(config => {
	// TODO: check if there is an authcookie before attempting to enable notifs
	registered.value = config !== null;
	if (registered.value) {
		console.debug(logstr, "attempting bind listener");
		loading.value = true;
		enableNotifications();
	}
});

function enableNotifications(): Promise<boolean> {
	loading.value = true;
	return startNotifications().then(() => {
		registered.value = true;
		return SetConfig(conf, new Date().valueOf());
	}).then(() =>
		hide.value = true
	).finally(() =>
		loading.value = false
	);
}
</script>
<style scoped>
.notifications {
	position: fixed;
	left: var(--margin);
	top: calc(2rem + var(--margin));
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	padding: calc(var(--margin) - 0.5em) var(--margin);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	display: flex;
	align-items: center;
}
.notifications div {
	border-top: var(--border-size) solid var(--bordercolor);
	border-left: var(--border-size) solid var(--bordercolor);
	width: 1.2em;
	height: 1.2em;
	border-top-left-radius: var(--border-radius);
	position: absolute;
	top: -0.67em;
	background: var(--bg2color);
	left: 1.5rem;
	transform: rotate(45deg);
}
.interactable {
	margin: 0 0 0 var(--margin);
	display: inline-block;
}
.close {
	color: var(--subtle);
	margin-left: var(--margin);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.close:hover {
	color: var(--red);
}
.mobile {
	.notifications {
		top: unset;
		padding: var(--margin) calc(var(--margin) * 2);
		left: var(--margin);
		bottom: var(--margin);
	}
	.notifications div {
		display: none;
	}
	.close {
		margin: var(--neg-margin) var(--neg-margin) var(--neg-margin) 0;
		padding: var(--margin);
	}
}
</style>
