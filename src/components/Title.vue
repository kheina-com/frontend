<template>
	<p :class='titleClass' :style='titleStyle'><slot name='default' /><span class='super'><slot name='super' /></span></p>
</template>

<script>
export default {
	name: 'Title',
	props: {
		static: {
			type: String,
			default: null,
		},
		size: {
			type: String,
			default: '4rem',
		}
	},
	computed: {
		titleClass() {
			return this.static ? '' : 'title';
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
	text-align: center;
	margin: 0;
}
p .super
{
	position: absolute;
	font-size: 1rem;
	width: 0;
	font-weight: bold;
}
.super, .super *
{ color: var(--subtlecolor) !important; }
.title
{
	text-align: left;
	padding: 0;
}
@media screen and (max-width:90rem)
{
	.title
	{
		position: relative;
		text-align: center;
		padding: 0;
	}
}

</style>
