<template>
	<p ref='title'><slot name='default'/></p>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';

const props = defineProps<{
	static: "left" | "center" | "right",
	size?: string,
}>();

const title = ref<HTMLAnchorElement | null>(null) as Ref<HTMLAnchorElement>;

onMounted(() => {
	title.value.style.textAlign = props.static;
	if (props.size) title.value.style.fontSize = props.size;
	if (props.static) title.value.classList.add("subtitle");
});
</script>

<style scoped>
p {
	color: var(--subtle);
	text-align: center;
	margin: 0;
}
.subtitle {
	text-align: left;
	font-size: 1em;
}
</style>
