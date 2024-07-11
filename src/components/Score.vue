<template>
	<div class='score' ref='scoreElement'>
		<button @click.stop='vote(1)'><b>▲</b></button>
		<Loading :isLoading='isLoading'><p>{{score === null ? 'X' : score === undefined ? 10 : abbreviate(score.up - score.down)}}</p></Loading>
		<button @click.stop='vote(-1)'><b>▼</b></button>
	</div>
</template>

<script>
import { ref } from 'vue';
import { abbreviate, khatch } from '@/utilities';
import { host } from '@/config/constants';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Post',
	props: {
		postId: String,
		score: Object,
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
	mounted() {
		if (this.score === undefined || this.score === null)
		{ this.$refs.scoreElement.classList.add('disabled'); }
		else
		{ this.$refs.scoreElement.classList.remove('disabled'); }

		this.setElementVote(this.score?.user_vote);
	},
	computed: {
		isLoading() {
			return this.score === undefined;
		},
	},
	methods: {
		abbreviate,
		setElementVote(vote) {
			const voteElement = this.$refs.scoreElement.querySelector('.vote');
			if (voteElement)
			{ voteElement.classList.remove('vote'); }

			if (vote === 1)
			{ this.$refs.scoreElement.firstChild.classList.add('vote') }
			else if (vote === -1)
			{ this.$refs.scoreElement.lastChild.classList.add('vote') }
		},
		vote(vote) {
			if (this.score === undefined || this.score === null)
			{ return; }

			if (this.score?.user_vote === vote)
			{ vote = 0; }

			khatch(`${host}/v1/post/vote`, {
				handleError: true,
				method: 'POST',
				body: {
					post_id: this.postId,
					vote,
				},
			}).then(response => {
				response.json().then(r => {
					this.setElementVote(vote);
					this.score.user_vote = vote;
					this.score.up = r.up;
					this.score.down = r.down;
				});
			});
		},
	},
	watch: {
		score(value) {
			if (this.score === undefined || this.score === null)
			{ this.$refs.scoreElement.classList.add('disabled'); }
			else
			{ this.$refs.scoreElement.classList.remove('disabled'); }
			this.setElementVote(value?.user_vote);
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
	pointer-events: all;
}
.disabled button {
	pointer-events: none;
}
button b {
	display: block;
	padding: 0.25em 0.5em;
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
button:hover b {
	background: var(--bg2color);
}
.vote {
	color: var(--interact);
}
.mobile button {
	padding: 0.25em 0.5em;
}
.mobile .loading {
	margin: 0 0.25em;
}

/* theme overrides */
html.midnight button:hover {
	background: #000000;
}
</style>
