<template>
	<div class='banner'>
		<p>
			<slot />
		</p>
	</div>
</template>

<script>
export default {
	name: 'Cookies',
	props: {
		content: String,
	}
}
</script>

<style scoped>
.banner
{
	position: absolute;
	top: 0;
	width: 100%;
	background: var(--bg1color);
	top: 0;
}
.banner p
{
	text-align: center;
	padding: 25px;
}
</style>
