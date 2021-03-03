<template>
	<a @click='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</a>
</template>

<script>
export default {
	name: 'Timestamp',
	components: { },
	props: {
		time: Number,
	},
	data() {
		return {
			displayAbsolute: false,
		}
	},
	computed: {
		date() {
			return new Date(this.time * 1000);
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
		{ return this.prettyTime((Date.now() / 1000) - this.time, 0) + ' ago'; },
		toggleDisplayType()
		{ this.displayAbsolute = !this.displayAbsolute; },
		prettyTime(time, fixed=2) {
			if (time === null)
			{ return null; }
			let conversion = 1;
			let units = 'seconds';
			if (time > 31556952)
			{
				conversion = 1 / 31556952;
				units = 'years';
			}
			else if (time > 2592000)
			{
				conversion = 1 / 2592000;
				units = 'months';
			}
			else if (time > 86400) // 24 hours in seconds
			{
				conversion = 1 / 86400;
				units = 'days';
			}
			else if (time > 5400) // 90 minutes in seconds
			{
				conversion = 1 / 3600;
				units = 'hours';
			}
			else if (time > 60)
			{
				conversion = 1 / 60;
				units = 'minutes';
			}
			else if (time < 0.000001)
			{
				conversion = 1000000000;
				units = 'nanoseconds';
			}
			else if (time < 0.001)
			{
				conversion = 1000000;
				units = 'microseconds';
			}
			else if (time < 1)
			{
				conversion = 1000;
				units = 'milliseconds';
			}
			return (time * conversion).toFixed(fixed) + ' ' + units;
		},
	},
}
</script>

<style scoped>
a
{
	text-decoration-style: dotted;
	text-decoration-line: underline;
}
</style>
