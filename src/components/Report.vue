<template>
	<router-link :to='destination' @click.prevent.stop='$router.push(destination)' class='report' v-if='$store.state.auth?.isMod'>
		<i class='material-icons'>security</i>
		<span>Moderate</span>
	</router-link>
	<router-link :to='destination' @click.prevent.stop='$router.push(destination)' class='report' v-else>
		<i class='kheina-icons'>report_content</i>
		<span>Report Content</span>
	</router-link>
</template>

<script>
export default {
	name: 'Report',
	props: {
		data: Object,
	},
	computed: {
		destination() {
			const params = Object.entries(Object.assign({ url: this.$route.fullPath }, this.data)).map(x => `${x[0]}=${encodeURIComponent(x[1])}`).join('&');
			if (this.$store.state.auth?.isMod)
			{ return '/mod?' + params; }
			return '/report?' + params;
		},
	},
}
</script>

<style scoped>
.report {
	display: flex;
	align-items: center;
	color: var(--subtle);
	margin: -0.1em -0.25em -0.25em;
	position: relative;
	z-index: 1;
}
.mobile .report {
	padding: 0;
}
.desktop .report {
	padding: 0.25em 0.5em 0.25em 0.25em;
	border-radius: var(--border-radius);
}
.desktop .report:hover {
	color: var(--icolor);
	background: var(--bg1color);
}
.mobile .report:hover i, .tile .report:hover i {
	color: var(--icolor);
	background: var(--bg1color);
}
i {
	margin-right: 0.25em;
	font-size: 1.2em;
}
.mobile i, .tile i {
	margin-right: 0;
}
.tile .report {
	padding: 0.375em;
}
.mobile i {
	border-radius: var(--border-radius);
	padding: 0.25em;
	font-size: 1.5em;
}
.mobile span, .tile span {
	display: none;
}
</style>
