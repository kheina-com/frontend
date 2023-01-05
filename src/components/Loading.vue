<template>
	<div v-if='type === "block"' ref='content'>
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
		type: {
			type: String,
			default: 'wave',
		},
	},
	setup() {
		const content = ref(null);
		return {
			content,
		};
	},
	mounted() {
		this.setLoadingClass(this.isLoading);
	},
	methods: {
		setLoadingClass(value) {
			switch (this.type) {
				case 'block':
					if (value)
					{ this.$refs.content.classList.add('loading', 'block'); }
					else
					{ this.$refs.content.classList.remove('loading', 'block'); }
					break;
				case 'stripes':
					if (value)
					{ this.$refs.content.classList.add('loading', 'stripes'); }
					else
					{ this.$refs.content.classList.remove('loading', 'stripes'); }
					break;
				case 'wave':
				default:
					if (value)
					{ this.$refs.content.classList.add('loading', 'wave'); }
					else
					{ this.$refs.content.classList.remove('loading', 'wave'); }
					break;
			}
		},
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

.loading.wave *, .loading.stripes * {
	opacity: 0% !important;
}
.loading.wave, .loading.wave *, .loading.wave *:hover, .loading.wave *:focus, .loading.wave *:active,
.loading.stripes, .loading.stripes *, .loading.stripes *:hover, .loading.stripes *:focus, .loading.stripes *:active {
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
	background: linear-gradient(100deg, var(--bg2color) 40vw, var(--wave-color) 50vw, var(--bg2color) 60vw);
	background-size: 100vw 100%;
}
.nested .loading.wave {
	background: var(--bg1color);
	background: linear-gradient(100deg, var(--bg1color) 40vw, var(--wave-color) 50vw, var(--bg1color) 60vw);
	background-size: 100vw 100%;
}

.loading.stripes {
	border-radius: var(--border-radius);
	animation: stripes 1s infinite linear forwards;
	-webkit-animation: stripes 1s infinite linear forwards;
	background: var(--bg2color);
	background: linear-gradient(120deg, var(--bg2color) 1.1em, var(--stripe-color) 1.1em, var(--stripe-color) 2.3em, var(--bg2color) 2.3em);
	background: linear-gradient(120deg, var(--bg2color) calc(1.1em - 0.5px), var(--stripe-color) calc(1.1em + 0.5px), var(--stripe-color) calc(2.3em - 0.5px), var(--bg2color) calc(2.3em + 0.5px));
	background-size: 2.9em 100%;
}
.nested .loading.stripes {
	background: var(--bg1color);
	background: linear-gradient(120deg, var(--bg1color) 1.1em, var(--stripe-color) 1.1em, var(--stripe-color) 2.3em, var(--bg1color) 2.3em);
	background: linear-gradient(120deg, var(--bg1color) calc(1.1em - 0.5px), var(--stripe-color) calc(1.1em + 0.5px), var(--stripe-color) calc(2.3em - 0.5px), var(--bg1color) calc(2.3em + 0.5px));
	background-size: 2.9em 100%;
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

@keyframes stripes {
	0% {
		background-position: 2.9em 0
	}
	100% {
		background-position: 0 0
	}
}
@-webkit-keyframes stripes {
	0%{
		background-position: 2.9em 0
	}
	100%{
		background-position: 0 0
	}
}


html.solarized-dark div.loadingicon img {
	filter: sepia(100%) saturate(232%) hue-rotate(1deg) brightness(99.5%);
}
</style>