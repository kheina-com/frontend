<template>
	<span class='_editbox'>
		<button class='_eb-button left' @click='() => editing = false' v-show='editing'><i class='material-icons'>close</i></button>
		<input v-model='value' v-if='editing'>
		<span v-else><slot class='_eb-content'/></span>
		<button class='_eb-button right' @click='edit'><i class='material-icons'>{{editing ? "done" : "edit"}}</i></button>
	</span>
</template>
<script setup lang='ts'>
import { ref, watch, type Ref } from 'vue';
const props = defineProps<{
	value: string,
}>();
const editing: Ref<boolean> = ref(false);
const value:   Ref<string>  = ref(props.value);
const emits = defineEmits([
	"update:value",
]);

function edit() {
	if (!editing.value) return editing.value = true;
	emits("update:value", value.value);
	editing.value = false;
}
watch(props, p => value.value = p.value);
</script>
<style scoped>
._editbox {
	padding: 0.125em 0.25em;
	margin: 0;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	background: var(--bg2color);
	display: inline-flex;
}
._eb-button.right {
	margin-left: 0.25em;
}
._eb-button.left {
	margin-right: 0.25em;
}
._eb-button {
	margin: -0.125em -0.25em;
	padding: 0.125em 0.25em;
}
._eb-button i {
	display: block;
	font-size: 1.2em;
}
input {
	border: none;
	background: var(--bg2color);
	color: var(--textcolor);
	width: 6em;
	padding: 0;
	margin: 0;
	cursor: text;
}
</style>
