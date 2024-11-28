<template>
	<div v-if='type === "block"' ref='content'>
		<div class='loadingicon' v-show='isLoading'>
			<slot name='onLoad'>
				<img src='/assets/loading.webp' alt='Loading...'/>
			</slot>
		</div>
		<slot name='default'/>
	</div>
	<span ref='content' v-else-if='span'>
		<slot name='default'/>
	</span>
	<div ref='content' v-else>
		<slot name='default'/>
	</div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch, type Ref } from 'vue';

const props = withDefaults(defineProps<{
	isLoading?: boolean,
	span?: boolean,
	type?: "block" | "stripes" | "wave",
}>(), {
	isLoading: true,
	span: false,
	type: "wave",
});

const content = ref<HTMLDivElement | HTMLSpanElement | null>(null) as Ref<HTMLDivElement | HTMLSpanElement>;

onMounted(() => setLoadingClass(props.isLoading));

function setLoadingClass(value: boolean) {
	switch (props.type) {
	case "block":
		if (value)
		{ content.value.classList.add("loading", "block"); }
		else
		{ content.value.classList.remove("loading", "block"); }
		break;
	case "stripes":
		if (value)
		{ content.value.classList.add("loading", "stripes"); }
		else
		{ content.value.classList.remove("loading", "stripes"); }
		break;
	case "wave":
	default:
		if (value)
		{ content.value.classList.add("loading", "wave"); }
		else
		{ content.value.classList.remove("loading", "wave"); }
		break;
	}
}

watch(() => props.isLoading, setLoadingClass);
</script>

<style scoped>
span {
	display: inline-block;
}
</style>

<style>
.loading, .loading * {
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
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
}
.loading.wave, .loading.wave *, .loading.wave *:hover, .loading.wave *:focus, .loading.wave *:active,
.loading.stripes, .loading.stripes *, .loading.stripes *:hover, .loading.stripes *:focus, .loading.stripes *:active {
	color: #00000000 !important;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
}

.emoji.loading.wave {
	width: 1.2em;
	height: 1.2em;
	border-radius: 50%;
	display: inline-block;
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
	background: linear-gradient(100deg, var(--bg2color) 40vw, var(--wave-color) 50vw, var(--bg2color) 60vw);
	background-size: 100vw 100%;
}
.nested .loading.wave {
	background: linear-gradient(100deg, var(--bg1color) 40vw, var(--wave-color) 50vw, var(--bg1color) 60vw);
	background-size: 100vw 100%;
}

.loading.stripes, button.loading.stripes {
	border-radius: var(--border-radius);
	animation: stripes 1s infinite linear forwards;
	-webkit-animation: stripes 1s infinite linear forwards;
	background: linear-gradient(120deg, var(--bg2color) 1.1em, var(--stripe-color) 1.1em, var(--stripe-color) 2.3em, var(--bg2color) 2.3em);
	background: linear-gradient(120deg, var(--bg2color) calc(1.1em - 0.5px), var(--stripe-color) calc(1.1em + 0.5px), var(--stripe-color) calc(2.3em - 0.5px), var(--bg2color) calc(2.3em + 0.5px));
	background-size: 2.8em 100%;
}
.nested .loading.stripes, .nested button.loading.stripes {
	background: linear-gradient(120deg, var(--bg1color) 1.1em, var(--stripe-color) 1.1em, var(--stripe-color) 2.3em, var(--bg1color) 2.3em);
	background: linear-gradient(120deg, var(--bg1color) calc(1.1em - 0.5px), var(--stripe-color) calc(1.1em + 0.5px), var(--stripe-color) calc(2.3em - 0.5px), var(--bg1color) calc(2.3em + 0.5px));
	background-size: 2.8em 100%;
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
		background-position: 2.8em 0
	}
	100% {
		background-position: 0 0
	}
}
@-webkit-keyframes stripes {
	0%{
		background-position: 2.8em 0
	}
	100%{
		background-position: 0 0
	}
}


html.solarized-dark div.loadingicon img {
	filter: sepia(100%) saturate(232%) hue-rotate(1deg) brightness(99.5%);
}
</style>
