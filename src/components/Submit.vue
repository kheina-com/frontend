<template>
	<input id='submit' :value='value' accesskey='s' @click='onClick'>
	<label for='submit' class='interactable submit'>
		<slot/>
	</label>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	value: string,
	onClick: { (payload: MouseEvent): void },
}>(), {
	onClick: () => { },
});
</script>

<style scoped>
.submit {
	right: 0;
	white-space: nowrap;
}
input#submit {
	display: none;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}

</style>
