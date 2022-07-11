<template>
	<button @click.prevent.stop='fav'>
		<div>
			<i class='material-icons-round'>repeat</i>
			<span>{{count !== null ? abbreviate(count) : 'loading'}}</span>
		</div>
	</button>
</template>

<script>
import { ref } from 'vue';
import { abbreviate } from '@/utilities';

export default {
	name: 'CopyText',
	props: {
		postId: String,
		count: {
			type: Number,
			default: null,
		},
	},
	emits: [
		'update:count',
	],
	methods: {
		abbreviate,
		fav() {
			this.$emit(`update:count`, (this.count || 0) + 1);
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
div {
	display: flex;
	padding: 0.375em;
	align-items: center;
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
i {
	padding-right: 0.25em;
	font-size: 1.5em;
	display: block;
}
button {
	color: var(--subtle);
	background: #0000;
	position: relative;
}
button:hover div {
	color: var(--icolor);
	background: var(--bg2color);
}
.nested button:hover div {
	background: var(--bg1color);
}
</style>
