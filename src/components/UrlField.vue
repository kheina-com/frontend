<template>
	<input type='url' :id='props.id' :name='props.name' :value='props.content' autocomplete='off' class='interactable text'>
</template>
<script setup lang='ts'>
const props = defineProps<{
	id: string,
	name: string,
	content: string,
}>();
</script>
