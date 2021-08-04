<template>
	<button @click.prevent.stop='navigate' class='report'>
		<i class='kheina-icons'>report_content</i>
		<span>Report Content</span>
	</button>
</template>

<script>
export default {
	name: 'Report',
	props: {
		button: {
			type: String,
			default: null,
		},
		data: Object,
	},
	methods: {
		navigate() {
			let query = Object.entries(Object.assign({ url: encodeURIComponent(this.$route.fullPath) }, this.data)).map(x => `${x[0]}=${x[1]}`).join('&');
			this.$router.push(`/report?${query}`);
		},
	},
}
</script>

<style scoped>
button {
	display: flex;
	align-items: center;
	color: var(--subtle);
	border-radius: var(--border-radius);
	padding: 0.25em 0.25em;
	margin: -0.1em -0.25em -0.25em;
	position: relative;
	z-index: 1;
}
button:hover {
	color: var(--icolor);
	background: var(--bg1color);
}
i {
	margin-right: 0.25em;
	font-size: 1.2em;
}
.mobile i {
	margin-right: 0;
	font-size: 1.5em;
}
.mobile span {
	display: none;
}
</style>
