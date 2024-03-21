<template>
	<div>
		<i class='material-icons'>timer</i>
		<button @click.prevent.stop='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</button>
	</div>
</template>

<script>
export default {
	name: 'Countdown',
	components: { },
	props: {
		endtime: String,
		endstring: {
			type: String,
			default: 'ended',
		},
		live: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			displayAbsolute: false,
		}
	},
	mounted() {
		if (this.live)
		{ setTimeout(this.updateSelf, 1000); }
	},
	computed: {
		date() {
			return new Date(this.endtime);
		},
		absoluteTime() {
			return this.date
				.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
				.replace(`, ${new Date().getFullYear()}`, '')
				+ ', '
				+ this.date.toLocaleTimeString()
				.toLowerCase();
		},
	},
	methods: {
		updateSelf() {
			if (this.displayAbsolute)
			{ return; }
			this.$forceUpdate();
			if (this.date.valueOf() - Date.now() > 0)
			{ setTimeout(this.updateSelf, this.timeout()); }
		},
		relativeTime() {
			let time = (this.date.valueOf() - Date.now()) / 1000;
			if (time <= 0)
			{ return this.endstring; }
			time = Math.round(time)
			let seconds = time % 60;
			time -= seconds;
			let minutes = time % 3600;
			time -= minutes;
			let hours = time % 86400;
			time -= hours;
			// days is now the time left in `time`
			return `${String(time/86400).padStart(2, '0')}:${String(hours/3600).padStart(2, '0')}:${String(minutes/60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		},
		toggleDisplayType() {
			this.displayAbsolute = !this.displayAbsolute;
			if (!this.displayAbsolute && this.live)
			{ setTimeout(this.updateSelf, this.timeout()); }
		},
		timeout() {
			return (this.date.valueOf() - Date.now()) % 1000;
		},
		conversion(time) {
			let conversion = 1;
			if (time > 31556952)
			{ conversion = 1 / 31556952; }
			else if (time > 2592000)
			{ conversion = 1 / 2592000; }
			else if (time > 86400)
			{ conversion = 1 / 86400; }
			else if (time > 3600)
			{ conversion = 1 / 3600; }
			else if (time > 60)
			{ conversion = 1 / 60; }
			else if (time < 0.000001)
			{ conversion = 1000000000; }
			else if (time < 0.001)
			{ conversion = 1000000; }
			else if (time < 1)
			{ conversion = 1000; }
			return conversion;
		},
	},
}
</script>

<style scoped>
button {
	text-decoration-style: dotted;
	text-decoration-line: underline;
}
button:hover {
	color: var(--interact);
}
i {
	font-size: 1.2em;
	margin-right: 0.25em;
}
div {
	display: flex;
	align-items: center;
}
</style>
