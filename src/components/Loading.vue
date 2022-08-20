<template>
	<div v-if='!lazy' ref='content'>
		<slot name='default'/>
		<div class='loadingicon' v-show='isLoading'>
			<img src='/assets/loading.webp' alt='Loading...'/>
			<slot name='onLoad'/>
		</div>
	</div>
	<span ref='content' v-else-if='span'>
		<slot name='default'/>
	</span>
	<div ref='content' v-else>
		<slot name='default'/>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'Loading',
	props: {
		isLoading: {
			type: Boolean,
			default: true,
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
	setup() {
		const content = ref(null);
		return {
			content,
		};
	},
	methods: {
		setLoadingClass(value) {
			if (value)
			{ this.$refs.content.classList.add('loading', this.lazy ? 'wave' : 'block') }
			else
			{ this.$refs.content.classList.remove('loading', this.lazy ? 'wave' : 'block') }
		},
	},
	mounted() {
		this.setLoadingClass(this.isLoading);
	},
	watch: {
		isLoading(value) {
			this.setLoadingClass(value);
		},
	},
}
</script>

<style scoped>
span {
	display: inline-block;
}
</style>

<style>
.loading {
	pointer-events: none;
}

.loading.block {
	position: relative;
}

.loading.block * {
	opacity: 50%;
}

.loading div.loadingicon {
	position: absolute;
	left: 0;
	top: 0;
	display: flex;
	width: 100%;
	height: 100%;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	opacity: 100%;
}

.loading div.loadingicon * {
	opacity: 100%;
}

.loading.wave * {
	opacity: 0% !important;
}
.loading.wave, .loading.wave *, .loading.wave *:hover, .loading.wave *:focus, .loading.wave *:active {
	color: #00000000 !important;
}

.emoji.loading.wave {
	width: 1.2em;
	height: 1.2em;
	border-radius: 50%;
}

.gigamoji .loading.wave {
	width: 5em;
	height: 5em;
	border-radius: var(--border-radius);
}

.loading.wave {
	border-radius: var(--border-radius);
	animation: wave 2s infinite linear forwards;
	-webkit-animation: wave 2s infinite linear forwards;
	background: var(--bg2color);
	background: linear-gradient(100deg, var(--bg2color) 40vw, var(--bordercolor) 50vw, var(--bg2color) 60vw);
	background-size: 100vw 100%;
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