<template>
	<div class='themes'>
		<input id='themecheck' type='checkbox' name='themes'>
		<ThemeSelector class='theme-menu'/>
	</div>
	<label class='themebutton' for='themecheck'><a>theme</a></label>
</template>

<script>
import ThemeSelector from '@/components/ThemeSelector.vue';


export default {
	name: 'ThemeMenu',
	components: {
		ThemeSelector,
	},
}
</script>

<style scoped>
.changemascot {
	font-size: 0.9em;
	text-align: center;
}

.theme-menu select.interactable {
	padding: 0;
	margin: 0;
	background: var(--bg1color);
}
.theme-menu select.interactable option
{ color: var(--textcolor) !important; }

.mobile .themes, .mobile .themebutton {
	display: none;
}
.themes {
	overflow: hidden;
	position: absolute;
	width: 300px;
	bottom: 0;
	right: 0;
	height: 120px;
	pointer-events: none;
	height: calc(4em + 50px);
}
.themes input
{ display: none; }
.themes input:checked ~ .theme-menu
{ top: 5px; }
.theme-menu {
	top: 105%;
	top: calc(100% + 5px);
	right: -25px;
	border-top-left-radius: 3px;
	position: absolute;
	pointer-events: all;
	background: var(--bg2color);
	padding: 25px 50px 50px 25px;
	border-left: var(--border-size) solid var(--bordercolor);
	border-top: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.theme-menu tr
{ text-align: right; }
.themes td:first-child
{ padding-right: 8px; }
label {
	cursor: pointer;
	position: absolute;
	right: 0;
	font-size: 0.9em;
	color: var(--subtle);
	margin-right: 25px;
	bottom: -1.25rem;
}
</style>
