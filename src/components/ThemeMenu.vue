<template>
	<div class='themes'>
		<input id='themecheck' type='checkbox' name='themes'>
		<ThemeSelector class='theme-menu'/>
	</div>
	<!-- <label class='themebutton' for='themecheck'><a>theme</a></label> -->
</template>
<script setup lang='ts'>
import ThemeSelector from '@/components/ThemeSelector.vue';
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
	margin: 0;
}
.themes input
{ display: none; }
.themes input:checked ~ .theme-menu
{ top: 5px; }
.theme-menu {
	top: 105%;
	top: calc(100% + 5px);
	right: var(--neg-margin);
	border-top-left-radius: 3px;
	position: absolute;
	pointer-events: all;
	background: var(--bg2color);
	padding: var(--margin) 50px 50px var(--margin);
	border-left: var(--border-size) solid var(--bordercolor);
	border-top: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	z-index: 1;
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
	margin-right: var(--margin);
	bottom: -1.25rem;
}
</style>
