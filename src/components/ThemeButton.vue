<template>
	<label class='themebutton' for='themecheck'><a>theme</a></label>
</template>

<script>
export default {
	name: 'ThemeMenu',
	props: {
	}
}
</script>

<style scoped>
.themebutton
{
	cursor: pointer;
	position: absolute;
	right: 0;
	font-size: 0.9em;
	color: var(--subtle);
	margin-right: 25px;
}
</style>
