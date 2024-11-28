<template>
	<button @click.prevent.stop='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</button>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, type Ref } from 'vue';

const yearRepl = `, ${new Date().getFullYear()}`;
const props = withDefaults(defineProps<{
	datetime?: Date | string,
	live?:     boolean,
}>(), {
	datetime: Date(),
	live: false,
});

let displayAbsolute: Ref<boolean> = ref(false);
let loop: number | null = null;

onMounted(() => {
	if (props.live) setLoop();
});

onUnmounted(clearLoop);

const date = computed(() => new Date(props.datetime));
const absoluteTime = computed(() => date.value
	.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
	.replace(yearRepl, '')
	+ ', '
	+ date.value.toLocaleTimeString()
	.toLowerCase()
);

function setLoop(t: number = 0) {
	clearLoop();
	if (t > 0x7fffffff) {
		// setTimeout breaks above the 32bit int max value
		return;
	}
	// console.log("t:", t);
	loop = setTimeout(updateSelf, t);
}

function clearLoop() {
	if (loop) clearTimeout(loop);
	loop = null;
}

const instance = getCurrentInstance();
function updateSelf() {
	// console.log("updateSelf");
	if (!loop) return;

	loop = null;

	if (displayAbsolute.value) return;

	instance?.proxy?.$forceUpdate();
	setLoop(timeout());
}

function relativeTime() {
	return prettyTime((Date.now() - date.value.valueOf()) / 1000, 0) + ' ago';
}

function toggleDisplayType() {
	displayAbsolute.value = !displayAbsolute.value;
	if (!displayAbsolute.value && props.live) {
		setLoop();
	}
	else {
		clearLoop();
	}
}

function timeout(): number {
	const c = 1000 / conversion((Date.now() - date.value.valueOf()) / 1000).conversion;
	return c - (Date.now() - date.value.valueOf() - c / 2) % c;
	// console.log("t:", t, "c:", conversion, "r:", Date.now() - this.date.valueOf());
}

function conversion(time: number) {
	let conversion = 1;
	let unit = 'second';
	if (time > 31556952) {
		conversion = 1 / 31556952;
		unit = 'year';
	}
	else if (time > 2592000) {
		conversion = 1 / 2592000;
		unit = 'month';
	}
	else if (time > 86400) {
		conversion = 1 / 86400;
		unit = 'day';
	}
	else if (time > 3600) {
		conversion = 1 / 3600;
		unit = 'hour';
	}
	else if (time > 60) {
		conversion = 1 / 60;
		unit = 'minute';
	}
	else if (time < 0.000001) {
		conversion = 1000000000;
		unit = 'nanosecond';
	}
	else if (time < 0.001) {
		conversion = 1000000;
		unit = 'microsecond';
	}
	else if (time < 1) {
		conversion = 1000;
		unit = 'millisecond';
	}
	return { conversion, unit };
}

function prettyTime(time: number, fixed=2) {
	if (time === null) return null;
	const c = conversion(time);
	const value = (time * c.conversion).toFixed(fixed);
	return value + ' ' + c.unit + (value === '1' ? '' : 's');
}
</script>

<style scoped>
button {
	color: var(--subtle);
	text-decoration-style: dotted;
	text-decoration-line: underline;
	position: relative;
}
button:hover {
	color: var(--interact);
}
</style>
