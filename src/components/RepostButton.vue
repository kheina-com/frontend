<template>
	<button @click.prevent.stop='fav'>
		<i class='material-icons-round'>repeat</i>
	</button>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CopyText',
	props: {
		postId: String,
	},
	methods: {
		fav() {
			this.$store.commit("createToast", {
				title: 'This function does not exist yet',
				description: 'Sorry!',
				icon: 'repeat',
			});
		},
	},
}
</script>

<style scoped>
i {
	font-size: 1.5em;
	display: block;
}
button {
	padding: 0.25em;
	color: var(--subtle);
	background: #0000;
	border-radius: var(--border-radius);
	position: relative;
}
button:hover {
	color: var(--icolor);
	background: var(--bg2color);
}
</style>
