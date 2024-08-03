<template>
	<div class='score' ref='score'>
		<button @click.stop='vote(1)'><b>▲</b></button>
		<Loading :isLoading='isLoading'><p>{{ props.score === null ? 'X' : (props.score === undefined ? 10 : abbreviate(props.score.up - props.score.down)) }}</p></Loading>
		<button @click.stop='vote(-1)'><b>▼</b></button>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { abbreviate, khatch } from '@/utilities';
import { host } from '@/config/constants';
import Loading from '@/components/Loading.vue';

const props = defineProps<{
	postId?: string | null,
	score?: Score | null,
}>();
const score = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

onMounted(() => {
	if (!props.score)
	{ score.value.classList.add('disabled'); }
	else
	{ score.value.classList.remove('disabled'); }

	if (props.score) setElementVote(props.score.user_vote);
});

const isLoading = computed(() => props.score === undefined);

function setElementVote(vote?: number | null) {
	const voteElement = score.value.querySelector('.vote');
	if (voteElement) {
		voteElement.classList.remove('vote');
	}

	if (vote === 1)
	{ (score.value.firstChild as HTMLElement).classList.add('vote') }
	else if (vote === -1)
	{ (score.value.lastChild as HTMLElement).classList.add('vote') }
}

function vote(vote: number) {
	if (!props.score) return;

	if (props.score?.user_vote === vote)
	{ vote = 0; }

	khatch(`${host}/v1/post/vote`, {
		handleError: true,
		method: 'POST',
		body: {
			post_id: props.postId,
			vote,
		},
	}).then(response => {
		response.json().then(r => {
			setElementVote(vote);
			if (!props.score) return;
			props.score.user_vote = vote;
			props.score.up = r.up;
			props.score.down = r.down;
		});
	});
}

watch(() => props.score, (value?: Score | null) => {
	if (!value)
	{ score.value.classList.add('disabled'); }
	else {
		score.value.classList.remove('disabled');
		setElementVote(value?.user_vote);
	}
});
</script>	

<style scoped>
.disabled {
	pointer-events: none;
}
.disabled button, .disabled p {
	opacity: 50%;
}
.score {
	text-align: center;
}
button {
	pointer-events: all;
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
