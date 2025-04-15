<template>
	<main>
		<Title>Notifications</Title>
		<div class='container text' v-if='!notifications'>
			<span>Loading...</span>
		</div>
		<div class='container text' v-else-if='notifications.length === 0'>
			<span>You have no notifications yet!</span>
		</div>
		<div class='container' v-else>
			<NComponent class='notification' v-bind='n' v-for='n in notifications'/>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import type { Notification } from '@/types/notifications';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import NComponent from '@/components/Notification.vue';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { ClearUnreads, GetNotifications } from '@/utilities/notifications';

const notifications: Ref<Notification[] | void> = ref();
const loadNotifications = () => GetNotifications().then((n: Notification[]) => notifications.value = n);
loadNotifications();
document.addEventListener("notification", loadNotifications);

onMounted(ClearUnreads);
onUnmounted(() => {
	ClearUnreads();
	document.removeEventListener("notification", loadNotifications);
});
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
.text {
	text-align: center;
}

.notification {
	margin: 0 auto var(--margin);
	max-width: 45em;
}

button {
	margin: 0 auto;
}
</style>
