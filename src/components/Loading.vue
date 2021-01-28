<template>
	<div>
		<div class='content' :style='loadingContent'>
			<slot name='default' />
			<div class='loadingcover' v-show='isLoading' />
		</div>
		<div class='loadingicon' v-show='isLoading'>
			<img src='/static/loading.webp' alt='Loading...'/>
			<slot name='onLoad' />
		</div>
	</div>
</template>

<script>
export default {
	name: 'Loading',
	props: {
		isLoading: Boolean,
		onLoadingStyle: {
			type: String,
			default: 'opacity: 50%',
		},
	},
	computed: {
		loadingContent() {
			return this.isLoading ? this.onLoadingStyle : '';
		},
	},
}
</script>

<style scoped>
div.content
{
	position: relative;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}

div.loadingcover
{
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
}

div.loadingicon
{
	position: absolute;
	left: 50%;
	top: 50%;
	/* display: block; */
	transform: translate(-50%, -50%);
	text-align: center;
	width: 100%;
}

</style>
