<template>
	<div ref='radio' class='radio-buttons'>
		<span v-for='i in data' v-show='!disabled || i.value === value'>
			<input
				type='radio'
				:name='name'
				:value='i.value'
				:id='`${name}-${i.value}`'
				@click='emitValue(i.value)'
				:checked='i.value === value'
				:disabled='disabled'
			>
			<label :for='`${name}-${i.value}`'>
				<div class='radio'>
					<div></div>
				</div>
				{{i.content ?? i.value}}
			</label>
		</span>
	</div>
</template>
<script setup lang='ts'>
import { onMounted, ref, watch, type Ref } from 'vue';

interface Datum {
	content?: string,
	value: string,
}

const radio = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

const props = withDefaults(defineProps<{
	name:      string,
	value?:    string,
	data:      Datum[],
	disabled?: boolean,
}>(), {
	disabled: false,
});

const emits = defineEmits(["update:value", "change"])

function emitValue(value: string) {
	emits("update:value", value);
	emits("change", value);
}

onMounted(() => props.disabled ? radio.value.classList.remove("enabled") : radio.value.classList.add("enabled"));

watch(() => props.disabled, (value: boolean) => value ? radio.value.classList.remove("enabled") : radio.value.classList.add("enabled"));
</script>
<style scoped>
input {
	position: absolute;
	display: none;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
label {
	cursor: default;
	padding: 0.5em 1em;
	margin: 0;
	border: var(--border-size) solid var(--bordercolor);
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	border-radius: var(--border-radius);
	white-space: nowrap;
	display: flex;
	align-items: center;
	text-transform: capitalize;
}
span {
	margin: 0.375em var(--half-margin);
}
.radio-buttons {
	display: flex;
	flex-flow: wrap;
	margin: -0.375em var(--neg-half-margin);
}
.enabled {
	label {
		cursor: pointer;
	}
	label:hover, label:active, label:focus {
		border-color: var(--borderhover);
		color: var(--interact);
	}
	label:hover {
		box-shadow: 0 0 10px 3px var(--activeshadowcolor);
	}
}
label div.checkmark, label div.radio {
	position: relative;
	display: block;
	left: 0;
	padding: 0;
	margin: 0 0.5em 0 -0.3em;
	height: 1.2em;
	width: 1.2em;
	border-radius: var(--border-radius);
	background: var(--bg1color);
	pointer-events: none;
}
label div.checkmark div, label div.radio div {
	border: solid 0 #0000;
	border-width: 0;
	position: absolute;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
label div.checkmark div {
	left: 0.35em;
	top: 0.15em;
	width: 0.3em;
	height: 0.55em;
}
label div.radio div {
	width: 150%;
	height: 150%;
	left: 50%;
	top: 50%;
	border-width: 0;
	border-radius: 50%;
	transform: translate(-50%, -50%);
}
input:checked + label div.radio div {
	border-color: var(--interact);
	border-width: 0.3em;
	width: 0;
	height: 0;
}
label div.radio {
	border-radius: 50%;
	/* padding: 0.1em; */
}
</style>
