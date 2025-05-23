<template>
	<div class='slider'>
		<input type='range' :min='min' :max='max' :step='step' v-model='value'>
		<span v-show='!hideValue'>{{ value }}</span>
	</div>
</template>
<script setup lang='ts'>
import { ref, watch, type Ref } from 'vue';

const props = withDefaults(defineProps<{
	min:        number,
	max:        number,
	step:       number,
	value?:     number,
	hideValue?: boolean,
}>(), {
	value: 0,
	hideValue: false,
});
const value: Ref<number> = ref(props.value);
const emits = defineEmits(["update:value", "input", "change"]);
watch(value, v => {
	emits("update:value", v);
	emits("change", v);
	emits("input", v);
});
</script>
<style scoped>
.slider {
	display: flex;
	width: 100%;
	height: 1.5em;
	align-items: center;
}
.slider span {
	width: 2em;
	text-align: right;
	margin-left: 0.5em;
}
.slider input {
	/* margin-top: 0.75em; */
	display: initial;
	width: 100%;
	border-top: solid 1px var(--subtle);
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	height: 0.25em;
	background: var(--subtle);
	opacity: 0.75;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	border-radius: 0.25em;
	outline: none;
}
.slider input:hover {
	opacity: 1;
}
.slider input::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 1em;
	height: 1.5em;
	background: var(--interact);
	cursor: pointer;
	border-radius: 0.5em;
}
.slider input::-moz-range-thumb {
	outline: none;
	width: 1em;
	height: 1.5em;
	background: var(--interact);
	cursor: pointer;
	border-radius: 1em;
}
</style>
