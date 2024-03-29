<template>
	<router-link to='/create' class='upload-bubble'>
		<i class='material-icons'>create</i>
	</router-link>
</template>

<script>

export default {
	name: 'UploadBubble',
}
</script>

<style scoped>
.upload-bubble {
	position: fixed;
	left: var(--margin);
	bottom: var(--margin);
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: 50%;
	padding: 1em;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
html.solarized-dark .upload-bubble, html.solarized-light .upload-bubble, html.midnight .upload-bubble {
	background: var(--bg1color);
}
.upload-bubble:hover {
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
	border-color: var(--interact);
	color: var(--interact);
}
.upload-bubble i {
	display: block;
	font-size: 2em;
}
</style>
