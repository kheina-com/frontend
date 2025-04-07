<template>
	<img ref='media' :data-src='src' @load='loaded' @error='onError'>
</template>
<script setup lang='ts'>
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { getIconUrl, lazyObserver } from '@/utilities';
import defaultUserIcon from '$/default-icon.png?url';

const props = defineProps<{
	isLoading?: boolean,
	handle?: string,
	post?: string | null,
}>();
const media = ref<HTMLImageElement | null>(null) as Ref<HTMLImageElement>;
const emits = defineEmits(["update:isLoading"]);

onMounted(() => {
	if (props.handle) lazyObserver.observe(media.value);
});

const src = computed(() => {
	if (!props.handle) return null;
	if (props.post) return getIconUrl(props.post, props.handle);
	return defaultUserIcon;
});

function loaded(_: Event) {
	if (props.handle) emits("update:isLoading", false);
}

function onError() {
	if (props.handle) emits("update:isLoading", false);
}
watch(() => props.handle, (value?: string) => {
	if (value) lazyObserver.observe(media.value);
});
watch(() => props.post, (value?: string | null) => {
	if (value) lazyObserver.observe(media.value);
});
</script>
<style scoped>
img {
	object-fit: cover;
	display: block;
}
</style>
