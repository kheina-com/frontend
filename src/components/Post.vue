<template>
	<div class='post interactable' @click='isLoading ? null : navigateToPost(postId)'>
		<div style='display: flex'>
			<Score :score='score' :postId='postId' />
			<div class='post-header'>
				<Title :isLoading='isLoading' size='1.5em' static='left' v-if='title || isLoading'>{{title || 'this is an example title'}}</Title>
				<Profile :isLoading='isLoading' :username='user?.name' :handle='user?.handle' :link='false' />
			</div>
		</div>
		<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
		<Markdown v-if='description' :content='mdGuide' :concise='concise' />
		<img v-if='!isText' :src='getMediaThumbnailUrl(postId, 1200)'>
	</div>
</template>

<script>
import { getMediaThumbnailUrl, isMobile } from '../utilities';
import { mdGuide } from '../config/constants';
import Loading from './Loading.vue'
import Title from '../components/Title.vue';
import Profile from '../components/Profile.vue';
import Markdown from '../components/Markdown.vue';
import Score from '../components/Score.vue';
import Timestamp from '../components/Timestamp.vue';

export default {
	name: 'Post',
	props: {
		postId: {
			type: String,
			default: null,
		},
		user: Object,
		score: Object,
		title: {
			type: String, 
			default: null,
		},
		description: {
			type: String, 
			default: null,
		},
		tags: {
			type: Array[String],
			default: null,
		},
		concise: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			mdGuide,
		}
	},
	components: {
		Title,
		Loading,
		Profile,
		Markdown,
		Score,
		Timestamp,
	},
	computed: {
		isMobile,
		isError()
		{ return this.errorDump !== null || this.errorMessage !== null; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		isText()
		{ return this.tags !== null ? this.tags.includes('text') : true; },
		isLoading()
		{ return this.postId === null; },
	},
	methods: {
		getMediaThumbnailUrl,
		navigateToPost(postId) {
			this.$router.push('/p/' + postId);
		},
	},
}
</script>

<style scoped>
.post {
	border-radius: 3px;
	display: flex;
	flex-direction: column;
	padding: 25px;
	background: var(--bg2color);
	align-items: start;
}
.post img {
	max-width: 100%;
	max-height: 300px;
	border-radius: 3px;
	margin: 0 auto 0 0;
}
.post-header {
	--bg2color: var(--bg1color);
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
	--bg2color: var(--bg1color);
	margin-right: 10px;
	margin-left: -10px;
}
.loading {
	--bg2color: var(--bg1color);
}
</style>
