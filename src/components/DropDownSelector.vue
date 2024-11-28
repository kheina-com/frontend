<template>
	<div class='a'>
		<input ref='input' class='interactable text' :placeholder='placeholder' @input='change'>
		<div class='b'>
			<slot/>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { toRef, ref, type Ref, watch } from 'vue';
const emits = defineEmits(["update:value", "change"]);
const props = defineProps<{
	placeholder: string,
	value:       string,
}>();

function change(e: Event) {
	const value = (e.target as HTMLInputElement).value;
	emits("update:value", value);
	emits("change", value);
}

const input = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
watch(toRef(props, "value"), (v: string) => {
	console.log(v)
	input.value.value = v;
});
</script>
<style scoped>
.a::after {
	font-family: 'Material Icons Round';
	content: 'keyboard_arrow_down';
	position: absolute;
	font-size: 1.5em;
	right: 0.2em;
	top: 0.125em;
	pointer-events: none;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}

.a:has(input:hover)::after {
	color: var(--interact);
}

.interactable {
	width: 100%;
}

.a {
	position: relative;
	width: 100%;
}

.b {
	position: absolute;
	padding: var(--margin);
	display: none;
	width: calc(100% - var(--margin) * 2 - var(--border-size) * 2);
	margin-top: -0.2em;
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: 0 0 var(--border-radius) var(--border-radius);
	border-top: none;
	/* border-color: var(--borderhover); */
	color: var(--interact);
	/* box-shadow: 0 0 10px 3px var(--activeshadowcolor); */
	z-index: 1;
	max-height: 15em;
	overflow: auto;
}

.a:has(input:focus) .b,
.a:has(input:active) .b,
.b:hover {
	display: block;
}
.a:has(input:focus)::after,
.a:has(input:active)::after,
.a:has(.b:hover)::after {
	content: 'keyboard_arrow_up';
}
</style>
