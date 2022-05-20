<template>
	<main>
		<p>
			You found the placeholder page for notifications! Notifications are not currently implemented, but feel free to play the notification noise using the button below.
		</p>
		<div>
			<Button @click='audio.play()'>
				<i class='material-icons'>volume_up</i> play me!
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
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	display: block;
}

p {
	text-align: center;
	margin: 0 auto 25px;
	width: 70vw;
}

button {
	margin: 0 auto;
}
</style>