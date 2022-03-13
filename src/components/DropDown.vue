<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='dropdown'>
		<button @click.prevent.stop='() => toggleDropdown()' ref='dropdownButton'><slot/></button>
		<div class='dropdown-menu' ref='dropdownMenu' v-click-outside='() => toggleDropdown(false)'>
			<div>
				<button
					v-for='option in options'
					@click.prevent.stop='option.action ? runAction(option) : setValue(option)'
					:class='option?.value === value ? "selected" : null'
					v-html='option.html'
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'DropDown',
	props: {
		value: {
			type: String,
			default: null,
		},
		options: Object[String, Function],
	},
	setup() {
		const dropdownMenu = ref(null);
		const dropdownButton = ref(null);
		return {
			dropdownMenu,
			dropdownButton,
		};
	},
	data() {
		return {
 			dropdownOpen: false,
		};
	},
	methods: {
		toggleDropdown(state = null) {
			if (this.dropdownOpen === state ?? !this.dropdownOpen)
			{ return; }

			this.dropdownOpen = state ?? !this.dropdownOpen;
			if (this.dropdownOpen)
			{
				this.$refs.dropdownMenu.style.display = 'block'; 
				const buttonRect = this.$refs.dropdownButton.getBoundingClientRect();

				if (this.$refs.dropdownMenu.clientHeight > window.innerHeight - buttonRect.bottom)
				{ this.$refs.dropdownMenu.style.bottom = '100%'; }
				else
				{ this.$refs.dropdownMenu.style.top = '100%'; }

				if (this.$refs.dropdownMenu.clientWidth > window.innerWidth - buttonRect.right)
				{ this.$refs.dropdownMenu.style.right = 0; }
			}
			else
			{
				this.$refs.dropdownMenu.style.top =
					this.$refs.dropdownMenu.style.bottom =
					this.$refs.dropdownMenu.style.right = null;

				this.$refs.dropdownMenu.style.display = 'none';
			}
		},
		setValue(option) {
			this.$emit(`update:value`, option.value);
			this.$emit(`change`, option.value);
			this.toggleDropdown(false);
		},
		runAction(option) {
			option.action();
			this.toggleDropdown(false);
		},
	},
}
</script>

<style scoped>
.dropdown {
	position: relative;
	display: inline-block;
}
button {
	display: block;
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
