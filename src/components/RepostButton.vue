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
			this.$store.commit('createToast', {
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
	padding: 0.25em;
	border-radius: var(--border-radius);
	font-size: 1.5em;
	display: block;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
button {
	color: var(--subtle);
	background: #0000;
	position: relative;
}
button:hover i {
	color: var(--icolor);
	background: var(--bg2color);
}
.nested button:hover i {
	background: var(--bg1color);
}
</style>
