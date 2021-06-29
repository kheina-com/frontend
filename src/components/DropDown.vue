<template>
	<div class='dropdown'>
		<button @click='toggleDropdown' ref='dropdownButton'><slot/></button>
		<div class='dropdown-menu' ref='dropdownMenu'>
			<pre style='margin: 0'>I'm
a
really
tall
menu
that
will
go
off
screen!</pre>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'DropDown',
	props: {

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
	created() {
	},
	methods: {
		toggleDropdown() {
			this.dropdownOpen = !this.dropdownOpen;
			if (this.dropdownOpen)
			{
				this.$refs.dropdownMenu.style.display = 'block';
				const buttonRect = this.$refs.dropdownButton.getBoundingClientRect();
				const menuRect = this.$refs.dropdownMenu.getBoundingClientRect();
				console.log(buttonRect, this.$refs.dropdownMenu.clientHeight)
				
				if (this.$refs.dropdownMenu.clientHeight > window.innerHeight - buttonRect.bottom)
				{ this.$refs.dropdownMenu.style.bottom = 0; }
			}
			else
			{ this.$refs.dropdownMenu.style.display = 'none'; }
		},
	},
}
</script>

<style scoped>
.dropdown {
	position: relative;
}
button {
	display: flex;
	align-items: center;
}
.dropdown-menu {
	position: absolute;
	display: none;
	margin: 1.2em 0;
}
</style>
