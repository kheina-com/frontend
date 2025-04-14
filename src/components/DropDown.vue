<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='dropdown'>
		<button @click.prevent.stop='() => toggleDropdown()' ref='dropdownButton'><slot/></button>
		<!-- <div class='dropdown-menu' ref='dropdownMenu' v-click-outside='() => toggleDropdown(false)'> -->
		<div @click.stop class='dropdown-menu' ref='dropdownMenu'>
			<div>
				<button
					v-for='option in props.options'
					@click.prevent.stop='option.action ? runAction(option) : setValue(option)'
					:class='props.value && option?.value === props.value ? "selected" : null'
					v-translate:[option.html].html='option.kwargs'
				/>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { onMounted, ref, type Ref } from 'vue';

export interface DropDownOption {
	/**
	 * value to emit upon selection
	 */
	value?: string,

	/**
	 * the translation key to use
	 */
	html?: string,

	/**
	 * action to run upon selection. overrides emit.
	 */
	action?: { (opt: DropDownOption): void },

	/**
	 * kwargs to pass to translator.
	 */
	kwargs?: {
		[k: string]: string,
	},
}

const props = withDefaults(defineProps<{
	value?:        string,
	options?:      DropDownOption[],
	interactable?: boolean,
}>(), {
	interactable: false,
});

const emits = defineEmits(["update:value", "change"]);
const dropdownMenu = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const dropdownButton = ref<HTMLButtonElement | null>(null) as Ref<HTMLButtonElement>;
let open: boolean = false;

onMounted(() => {
	if (props.interactable) dropdownButton.value.classList.add("interactable");
});

const closeDropdown = () => toggleDropdown(false);

function toggleDropdown(state: boolean | null = null) {
	if (open === (state ?? !open)) return;

	open = state ?? !open;
	if (open) {
		window.addEventListener("click", closeDropdown, { once: true });
		dropdownMenu.value.style.display = "block";
		const buttonRect = dropdownButton.value.getBoundingClientRect();

		if (dropdownMenu.value.clientHeight > window.innerHeight - buttonRect.bottom) {
			dropdownMenu.value.style.bottom = "100%";
		}
		else {
			dropdownMenu.value.style.top = "100%";
		}

		if (dropdownMenu.value.clientWidth > window.innerWidth - buttonRect.right) {
			dropdownMenu.value.style.right = "0";
		}
	}
	else {
		window.removeEventListener("click", closeDropdown);
		dropdownMenu.value.style.top     = "";
		dropdownMenu.value.style.bottom  = "";
		dropdownMenu.value.style.right   = "";
		dropdownMenu.value.style.display = "none";
	}
}

function setValue(option: DropDownOption) {
	emits("update:value", option.value);
	emits("change", option.value);
	closeDropdown();
}

function runAction(option: DropDownOption) {
	(option.action as { (opt: DropDownOption): void })(option);
	closeDropdown();
}
</script>
<style scoped>
.dropdown {
	position: relative;
	display: inline-block;
}
button {
	display: block;
	width: 100%;
	height: 100%;
}
.dropdown-menu div {
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	margin: 0;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
}
.dropdown-menu {
	position: absolute;
	display: none;
	padding: 0.5em 0;
	z-index: 1;
}
.dropdown-menu button {
	padding: 5px 10px;
	display: block;
	width: 100%;
	text-align: left;
	white-space: nowrap;
}
.mobile .dropdown-menu button {
	padding: 0.5em 1em;
}
.dropdown-menu button:hover {
	background: var(--bg2color);
}
button.selected {
	font-weight: bold;
	color: var(--subtle);
	pointer-events: none;
	cursor: default;
}
</style>
