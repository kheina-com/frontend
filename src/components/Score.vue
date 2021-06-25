<template>
	<div class='score' ref='scoreElement'>
		<button @click.stop='vote(1)'>▲</button>
		<Loading :isLoading='isLoading'><p>{{score === null ? 'X' : score === undefined ? 10 : abbreviate(score.up - score.down)}}</p></Loading>
		<button @click.stop='vote(-1)'>▼</button>
	</div>
</template>

<script>
import { ref } from 'vue';
import { abbreviate, khatch } from '@/utilities';
import { apiErrorMessage, postsHost } from '@/config/constants';
import Loading from '@/components/Loading.vue'

export default {
	name: 'Post',
	props: {
		postId: String,
		score: Object,
		userVote: {
			type: Boolean,
			default: null,
		},
	},
	components: {
		Loading,
	},
	setup() {
		const scoreElement = ref(null);

		return {
			scoreElement,
		};
	},
	computed: {
		isLoading() {
			return this.score === undefined;
		},
	},
	methods: {
		abbreviate,
		vote(vote) {
			if (this.score === undefined || this.score === null)
			{ return; }

			khatch(`${postsHost}/v1/vote`, {
					method: 'POST',
					body: {
						post_id: this.postId,
						vote,
					},
				})
				.then(response => {
					response.json().then(r => {
						console.log(r);
						if (response.status < 300)
						{
							this.score.up = r.up;
							this.score.down = r.down;
						}
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		},
	},
	watch: {
		score(value) {
			if (value === null)
			{ this.$refs.scoreElement.classList.add('disabled'); }
		},
	},
}
</script>

<style scoped>
.disabled {
	opacity: 50%;
	pointer-events: none;
}
.score {
	text-align: center;
}
button {
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
}
button:hover {
	background: var(--bg2color);
}
</style>
