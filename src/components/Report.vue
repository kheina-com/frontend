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
			let query = Object.entries(this.data).map(x => `${x[0]}=${x[1]}`).join('&');
			let url = '/report' + (query ? '?' + query : '');
			this.$router.push(url);
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
	padding: 0.1em 0.25em !important;
	margin: -0.1em -0.25em !important;
}
button:hover {
	color: var(--icolor);
	background: var(--bg1color);
}
i {
	margin-right: 0.25em;
}
</style>
