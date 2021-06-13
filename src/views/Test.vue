<template>
	<main>
		<Error v-model:dump='errorDump' v-model:message='errorMessage'>
			<Countdown :endtime='date'/>
			<Timestamp :datetime='datetime' live/>
			<div>
				<Button @click='audio.play()'>
					play me
				</Button>
			</div>
		</Error>
		<ThemeMenu />
	</main>
</template>

<script>
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Countdown from '@/components/Countdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Button from '@/components/Button.vue';


export default {
	name: 'Test',
	components: {
		ThemeMenu,
		Error,
		Countdown,
		Timestamp,
		Button,
	},
	data() {
		return {
			date: new Date(Date.now() + 500000000).toString(),
			datetime: new Date(Date.now()).toString(),
			audio: null,
		}
	},
	mounted() {
		this.audio = new Audio('assets/sounds/notify.ogg');
	},
	computed: {
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
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol li a {
	display: block;
}
ol li div {
	display: flex;
}
ol li div div {
	flex-direction: column;
}

ol > :last-child {
	margin-bottom: 0;
}

.user-field {
	display: flex;
	align-items: center;
	color: var(--textcolor);
}
.user-field span button {
	color: var(--textcolor);
}
.user-field span button:hover {
	color: var(--icolor);
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
</style>