<template>
	<main>
		<p>
			You found the placeholder page for notifications! Notifications are not currently implemented, but feel free to play the notification noise using the button below.
		</p>
		<div>
			<Button @click='audio.play()'>
				<i class='material-icons'>volume_up</i>
				<span>play me!</span>
			</Button>
		</div>
	</main>
</template>

<script>
import Button from '@/components/Button.vue';
import notify from '$/sounds/notify.ogg';


export default {
	name: 'Notifications',
	components: {
		Button,
	},
	data() {
		return {
			audio: new Audio(notify),
		}
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}

p {
	text-align: center;
	margin: 0 auto var(--margin);
	width: 70vw;
}

button {
	margin: 0 auto;
}
</style>