<template>
	<p :class='titleClass' :style='titleStyle'><slot name='default' /></p>
</template>

<script>
export default {
	name: 'LastUpdated',
	props: {
		static: {
			type: String,
			default: null,
		},
		size: {
			type: String,
			default: '1em',
		}
	},
	computed: {
		titleClass() {
			return this.static ? '' : 'subtitle';
		},
		titleStyle() {
			return `font-size: ${this.size}; text-align: ${this.static}`
		},
	},
}
</script>

<style scoped>
p
{
	color: var(--subtlecolor);
	text-align: center;
	margin: 0;
}
.subtitle
{
	text-align: left;
	font-size: 1em;
}
@media screen and (max-width:90rem)
{
	.subtitle
	{
		text-align: center;
		position: relative;
		max-width: 100%;
	}
}
</style>
