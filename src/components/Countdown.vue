<template>
	<div>
		<i class='material-icons'>timer</i>
		<button @click.prevent.stop='toggleDisplayType'>{{displayAbsolute ? absoluteTime : relativeTime()}}</button>
	</div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, type Ref } from 'vue';

const displayAbsolute: Ref<boolean> = ref(false);
const props = withDefaults(defineProps<{
	endtime:    string | Date,
	endstring?: string,
	live?:      boolean,
}>(), {
	endstring: "ended",
	live: true,
});

onMounted(() => {
	if (props.live) setTimeout(updateSelf, 1000);
});

const date = computed(() => new Date(props.endtime));

const absoluteTime = computed(() => {
	return date.value
	.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
	.replace(`, ${new Date().getFullYear()}`, '')
	+ ', '
	+ date.value.toLocaleTimeString()
	.toLowerCase();
});

const instance = getCurrentInstance();
function updateSelf(): void {
	if (displayAbsolute.value) return;

	instance?.proxy?.$forceUpdate();
	if (date.value.valueOf() - Date.now() > 0)
	{ setTimeout(updateSelf, timeout()); }
}

function relativeTime(): string {
	let time = (date.value.valueOf() - Date.now()) / 1000;
	if (time <= 0) return props.endstring;
	time = Math.round(time)
	let seconds = time % 60;
	time -= seconds;
	let minutes = time % 3600;
	time -= minutes;
	let hours = time % 86400;
	time -= hours;
	// days is now the time left in `time`
	return `${String(time/86400).padStart(2, '0')}:${String(hours/3600).padStart(2, '0')}:${String(minutes/60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function toggleDisplayType(): void {
	displayAbsolute.value = !displayAbsolute.value;
	if (!displayAbsolute.value && props.live) setTimeout(updateSelf, timeout());
}

function timeout(): number {
	return (date.value.valueOf() - Date.now()) % 1000;
}

</script>

<style scoped>
button {
	text-decoration-style: dotted;
	text-decoration-line: underline;
}
button:hover {
	color: var(--interact);
}
i {
	font-size: 1.2em;
	margin-right: 0.25em;
}
div {
	display: flex;
	align-items: center;
}
</style>
