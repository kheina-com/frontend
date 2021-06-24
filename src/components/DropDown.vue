<template>
	<div class='dropdown'>
		<button @click='toggleDropdown' ref='dropdownButton'><slot/></button>
		<div v-show='dropdownOpen' class='dropdown-menu' ref='dropdownMenu'><pre>
			I'm
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
				const buttonRect = this.$refs.dropdownButton.getBoundingClientRect();
				const menuRect = this.$refs.dropdownMenu.getBoundingClientRect();
				console.log(buttonRect, this.$refs.dropdownMenu.clientHeight)
				
			}
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
	margin: 1.2em 0;
}
</style>
