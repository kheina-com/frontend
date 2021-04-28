<template>
	<div class='score'>
		<button @click.stop='vote(1)'>▲</button>
		<Loading :isLoading='isLoading'><p>{{score ? abbreviate(score.up - score.down) : 10}}</p></Loading>
		<button @click.stop='vote(-1)'>▼</button>
	</div>
</template>

<script>
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
	computed: {
		isLoading() {
			return this.score === null || this.score === undefined;
		},
	},
	methods: {
		abbreviate,
		vote(vote) {
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
							this.score.up = r[this.postId].up;
							this.score.down = r[this.postId].down;
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
}
</script>

<style scoped>
.post {
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	display: flex;
	flex-direction: column;
	padding: 25px;
	background: var(--bg2color);
}
.post img {
	max-width: 100%;
	max-height: 10vh;
	border-radius: 3px;
	margin: 0 auto;
}
.post-header {
	margin-bottom: 25px;
}
.profile {
	margin-top: 0.25em;
	margin-bottom: 0;
}
.post .markdown {
	margin: 0 0 25px;
}
.post > :last-child {
	margin-bottom: 0;
}
.score {
	text-align: center;
}
button {
	padding: 0.25em 0.5em;
	border-radius: 3px;
}
button:hover {
	background: var(--bg2color);
}
</style>
