<template>
	<router-link :to='destination' @click.prevent.stop='$router.push(destination)' class='report' v-if='globals.auth?.isMod'>
		<i class='material-icons'>security</i>
		<span>Moderate</span>
	</router-link>
	<router-link :to='destination' @click.prevent.stop='$router.push(destination)' class='report' v-else>
		<i class='kheina-icons'>report_content</i>
		<span>Report Content</span>
	</router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import store from '@/globals';

const route = useRoute();
const globals = store();

const props = withDefaults(defineProps<{
	data: object,
}>(), {
	data: Object(),
});

const destination = computed(() => {
	const params = Object.entries(Object.assign({ url: route.fullPath }, props.data)).map(x => `${x[0]}=${encodeURIComponent(x[1])}`).join('&');
	if (globals.auth?.isMod)
	{ return '/mod?' + params; }
	return '/r?' + params;
});
</script>

<style scoped>
.report {
	display: flex;
	align-items: center;
	color: var(--subtle);
	margin: -0.1em -0.25em -0.25em;
	position: relative;
	z-index: 1;
}
.mobile .report {
	padding: 0;
}
.desktop .report {
	padding: 0.25em 0.5em 0.25em 0.25em;
	border-radius: var(--border-radius);
}
.desktop .report:hover {
	color: var(--interact);
	background: var(--bg1color);
}
.mobile .report:hover i, .tile .report:hover i {
	color: var(--interact);
	background: var(--bg1color);
}
i {
	margin-right: 0.25em;
	font-size: 1.2em;
}
.mobile i, .tile i {
	margin-right: 0;
}
.tile .report {
	padding: 0.375em;
}
.mobile i {
	border-radius: var(--border-radius);
	padding: 0.25em;
	font-size: 1.5em;
}
.mobile span, .tile span {
	display: none;
}
</style>
