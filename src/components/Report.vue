<template>
	<button @click.stop='navigate' class='report'><i class='kheina-icons'>report_content</i>Report Content</button>
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
	color: var(--subtlecolor);
	border-radius: 3px;
	padding: 0.25em 0.25em !important;
	margin: -0.25em -0.25em !important;
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
</style>
