<template>
	<button @click.stop='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</button>
</template>

<script>
export default {
	name: 'Timestamp',
	components: { },
	props: {
		datetime: String,
	},
	data() {
		return {
			displayAbsolute: false,
		}
	},
	computed: {
		date() {
			return new Date(this.datetime);
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
		relativeTime()
		{ return this.prettyTime((Date.now() - this.date.valueOf()) / 1000, 0) + ' ago'; },
		toggleDisplayType()
		{ this.displayAbsolute = !this.displayAbsolute; },
		prettyTime(time, fixed=2) {
			if (time === null)
			{ return null; }
			let conversion = 1;
			let unit = 'second';
			if (time > 31556952)
			{
				conversion = 1 / 31556952;
				unit = 'year';
			}
			else if (time > 2592000)
			{
				conversion = 1 / 2592000;
				unit = 'month';
			}
			else if (time > 86400) // 24 hours in seconds
			{
				conversion = 1 / 86400;
				unit = 'day';
			}
			else if (time > 3600)
			{
				conversion = 1 / 3600;
				unit = 'hour';
			}
			else if (time > 60)
			{
				conversion = 1 / 60;
				unit = 'minute';
			}
			else if (time < 0.000001)
			{
				conversion = 1000000000;
				unit = 'nanosecond';
			}
			else if (time < 0.001)
			{
				conversion = 1000000;
				unit = 'microsecond';
			}
			else if (time < 1)
			{
				conversion = 1000;
				unit = 'millisecond';
			}
			let value = (time * conversion).toFixed(fixed);
			return value + ' ' + unit + (value === '1' ? '' : 's');
		},
	},
}
</script>

<style scoped>
button {
	color: var(--subtlecolor);
	text-decoration-style: dotted;
	text-decoration-line: underline;
}
button:hover {
	color: var(--icolor);
}
</style>
