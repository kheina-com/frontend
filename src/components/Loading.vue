<template>
	<div v-if='!lazy' style='position: relative'>
		<div :class='loadingClass'>
			<slot name='default' />
		</div>
		<div class='loadingicon' v-show='isLoading'>
			<img src='/assets/loading.webp' alt='Loading...'/>
			<slot name='onLoad' />
		</div>
		<div class='loadingcover' v-show='isLoading'></div>
	</div>
	<div :class='lazyClass' v-else-if='!span'>
		<slot name='default' />
	</div>
	<span :class='lazyClass' v-else>
		<slot name='default' />
	</span>
</template>

<script>
export default {
	name: 'Loading',
	props: {
		isLoading: {
			type: Boolean,
			default: true,
		},
		onLoadingStyle: {
			type: String,
			default: 'opacity: 50%',
		},
		span: {
			type: Boolean,
			default: false,
		},
		lazy: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		loadingClass() {
			return this.isLoading ? 'content' : '';
		},
		lazyClass() {
			return this.isLoading ? 'loading wave' : '';
		},
	},
}
</script>

<style scoped>
span {
	display: inline-block;
}

/* *
{
	position: relative;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
} */

div.content {
	opacity: 50%;
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
	left: 0;
	top: 0;
	display: flex;
	width: 100%;
	height: 100%;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.loading {
	border-radius: 3px;
}

.loading.wave {
	animation: wave 2s infinite linear forwards;
	-webkit-animation: wave 2s infinite linear forwards;
	background: var(--bg2color);
	background: linear-gradient(100deg, var(--bg2color) 40vw, var(--bordercolor) 50vw, var(--bg2color) 60vw);
	background-size: 100vw 100vh;
}

@keyframes wave {
	0% {
		background-position: 0 0
	}
	100% {
		background-position: 100vw 0
	}
}

@-webkit-keyframes wave {
	0%{
		background-position: 0 0
	}
	100%{
		background-position: 100vw 0
	}
}

html.solarized-dark div.loadingicon img {
	filter: sepia(100%) saturate(232%) hue-rotate(1deg) brightness(99.5%);
}
</style>

<style>
.loading * {
	opacity: 0% !important;
}
.loading, .loading *, .loading *:hover, .loading *:focus, .loading *:active {
	color: #00000000 !important;
}
</style>