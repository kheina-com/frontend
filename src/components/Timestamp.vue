<template>
	<button @click.prevent.stop='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</button>
</template>

<script>
const yearRepl = `, ${new Date().getFullYear()}`;
export default {
	name: 'Timestamp',
	components: { },
	props: {
		datetime: String,
		live: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			displayAbsolute: false,
			loop: null,
		}
	},
	mounted() {
		if (this.live) {
			this.setLoop();
		}
	},
	unmounted() {
		if (this.loop) {
			clearTimeout(this.loop);
		}
	},
	computed: {
		date() {
			return new Date(this.datetime);
		},
		absoluteTime() {
			return this.date
				.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
				.replace(yearRepl, '')
				+ ', '
				+ this.date.toLocaleTimeString()
				.toLowerCase();
		},
	},
	methods: {
		setLoop(t=0) {
			this.clearLoop();
			if (t > 0x7fffffff) {
				// setTimeout breaks above the 32bit int max value
				return;
			}
			// console.log("t:", t);
			this.loop = setTimeout(this.updateSelf, t);
		},
		clearLoop() {
			if (this.loop) {
				clearTimeout(this.loop);
			}
			this.loop = null;
		},
		updateSelf() {
			// console.log("updateSelf");
			if (!this.loop) {
				return;
			}
			this.loop = null;

			if (this.displayAbsolute) {
				return;
			}

			this.$forceUpdate();
			this.setLoop(this.timeout());
		},
		relativeTime()
		{ return this.prettyTime((Date.now() - this.date.valueOf()) / 1000, 0) + ' ago'; },
		toggleDisplayType() {
			this.displayAbsolute = !this.displayAbsolute;
			if (!this.displayAbsolute && this.live) {
				this.setLoop();
			}
			else {
				this.clearLoop();
			}
		},
		timeout() {
			const conversion = 1000 / this.conversion((Date.now() - this.date.valueOf()) / 1000).conversion;
			return conversion - (Date.now() - this.date.valueOf() - conversion / 2) % conversion;
			// console.log("t:", t, "c:", conversion, "r:", Date.now() - this.date.valueOf());
		},
		conversion(time) {
			let conversion = 1;
			let unit = 'second';
			if (time > 31556952) {
				conversion = 1 / 31556952;
				unit = 'year';
			}
			else if (time > 2592000) {
				conversion = 1 / 2592000;
				unit = 'month';
			}
			else if (time > 86400) {
				conversion = 1 / 86400;
				unit = 'day';
			}
			else if (time > 3600) {
				conversion = 1 / 3600;
				unit = 'hour';
			}
			else if (time > 60) {
				conversion = 1 / 60;
				unit = 'minute';
			}
			else if (time < 0.000001) {
				conversion = 1000000000;
				unit = 'nanosecond';
			}
			else if (time < 0.001) {
				conversion = 1000000;
				unit = 'microsecond';
			}
			else if (time < 1) {
				conversion = 1000;
				unit = 'millisecond';
			}
			return { conversion, unit };
		},
		prettyTime(time, fixed=2) {
			if (time === null) {
				return null;
			}
			const conversion = this.conversion(time);
			const value = (time * conversion.conversion).toFixed(fixed);
			return value + ' ' + conversion.unit + (value === '1' ? '' : 's');
		},
	},
}
</script>

<style scoped>
button {
	color: var(--subtle);
	text-decoration-style: dotted;
	text-decoration-line: underline;
	position: relative;
}
button:hover {
	color: var(--interact);
}
</style>
