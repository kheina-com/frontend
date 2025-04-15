<template>
	<div class='content' ref='main' v-show='content'>
		<span></span>
		<a role='button' @click='copy'><i class='material-icons'>content_copy</i></a>
		<div ref='popup' class='popup'>
			<div/>
			<p style='position: relative'>copied!</p>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { computed, ref, type Ref, onMounted } from 'vue';

const main  = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const popup = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const props = withDefaults(defineProps<{
	content: any,
	inline?: boolean,
	nested?: boolean,
	code?:   boolean
}>(), {
	inline: false,
	nested: false,
	code:   false,
});

const copyValue = computed((): string => {
	if (props.content instanceof Error) {
		return JSON.stringify({ 'error': props.content.toString(), 'stacktrace': props.content?.stack?.split('\n').filter(x => x) });
	}
	if (props.content instanceof Object) {
		return JSON.stringify(props.content);
	}
	return props.content;
});

onMounted(() => {
	(main.value.firstElementChild as HTMLElement).innerText = copyValue.value;
	if (props.inline) {
		main.value.classList.add('inline');
	}
	else {
		main.value.classList.add('block');
	}
	if (props.code) {
		main.value.classList.add('code');
	}
	if (props.nested) {
		main.value.classList.add('nested');
	}
});

let t: number | null = null;
function copy() {
	navigator.clipboard.writeText(copyValue.value)
	// don't even bother supporting old shit anymore
	.then(() => {
		popup.value.style.display = 'block';
		if (t) {
			clearTimeout(t);
		}
		t = setTimeout(() => {
			popup.value.style.display = "";
			t = null;
		}, 5000);
	});
}
</script>
<style scoped>
i {
	font-size: inherit;
}
a {
	font-size: 1.2em;
}

.content {
	position: relative;
	font-size: 0.9em;
	color: var(--textolor);
	background: var(--bg1color);
	white-space: pre-wrap;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.block.content {
	/* margin: 0 auto var(--margin); */
	max-width: 100%;
}
.inline.content {
	display: inline-block;
	padding: 0 0.3em;
}

.nested {
	background: var(--bg2color);
}

.block {
	span {
		width: 100%;
		width: calc(100% - 16px);
		padding: 0.5em;
		white-space: nowrap;
		overflow: hidden;
		display: block;
	}
	a {
		position: absolute;
		right: 0;
		top: 0;
		background: linear-gradient(to right, #0000 0, var(--bg1color) 50%);
		padding: 0.4em 0.4em 0.4em 1.5em;
		height: 1em;
	}
}

.block.nested a {
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50%);
}

.inline {
	span {
		padding: 0.2em;
	}
	a {
		position: relative;
		top: 0.2em;
		margin-left: 0.5em;
	}
}

span {
	display: inline-block;
}

.popup {
	display: none;
	position: absolute;
	pointer-events: none;
	color: var(--textcolor);
	bottom: 150%;
	bottom: calc(100% + 1.2em);
	right: -1.4em;
	background: var(--bg1color);
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.popup div {
	border-bottom: var(--border-size) solid var(--bordercolor);
	border-right: var(--border-size) solid var(--bordercolor);
	width: 1.2em;
	height: 1.2em;
	border-bottom-right-radius: var(--border-radius);
	position: absolute;
	bottom: -0.67em;
	background: var(--bg1color);
	left: 50%;
	transform: translateX(-50%) rotate(45deg);
}
.popup p {
	position: relative;
	white-space: nowrap;
}
</style>
