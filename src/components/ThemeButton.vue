<template>
	<label class='themebutton' for='themecheck'><a>theme</a></label>
</template>

<script>
export default {
	name: 'ThemeButton',
}
</script>

<style scoped>
.mobile .themebutton {
	display: none;
}
.themebutton
{
	cursor: pointer;
	position: absolute;
	right: 0;
	font-size: 0.9em;
	color: var(--subtle);
	margin-right: var(--margin);
}
</style>
