<template>
	<div class='dropdown'>
		<button @click.prevent.stop='toggleDropdown' ref='dropdownButton'><slot/></button>
		<div class='dropdown-menu' ref='dropdownMenu'>
			<button @click.prevent.stop='option.action ? runAction(option.action) : setValue(option.value)' v-for='option in options'>
				{{option?.name || option.value}}
			</button>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'DropDown',
	props: {
		value: String,
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
		toggleDropdown() {
			this.dropdownOpen = !this.dropdownOpen;
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
			{ this.$refs.dropdownMenu.style.display = 'none'; }
		},
		setValue(option) {
			this.$emit(`update:value`, option);
			this.$emit(`change`, option);
			this.toggleDropdown();
		},
		runAction(action) {
			action();
			this.toggleDropdown();
		},
	},
}
</script>

<style scoped>
.dropdown {
	position: relative;
}
.dropdown-menu {
	position: absolute;
	display: none;
	margin: 0;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	z-index: 1;
}
.dropdown-menu button {
	padding: 5px 10px;
	display: block;
	width: 100%;
	text-align: left;
	white-space: nowrap;
}
.dropdown-menu button:hover {
	background: var(--bg2color);
}
</style>
