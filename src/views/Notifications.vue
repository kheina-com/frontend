<template>
	<main>
		<Title>Notifications</Title>
		<Notification class='notification' v-bind='n' v-for='n in globals.notifications'/>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import store from '@/globals';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Notification from '@/components/Notification.vue';
const globals = store();
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}

.notification {
	margin: 0 auto var(--margin);
	max-width: 45em;
}

button {
	margin: 0 auto;
}
</style>
