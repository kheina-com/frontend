<template>
	<div class='post'>
		<div style='display: flex'>
			<Score :score='score' :postId='postId' />
			<div class='post-header'>
				<Title size='1.5em' static='left' v-if='title'>{{title}}</Title>
				<Profile :username='user?.name' :handle='user?.handle' :link='false' />
			</div>
		</div>
		<Markdown v-if='description' :content='description' />
		<img v-if='!isText' :src='getMediaThumbnailUrl(postId, 1200)'>
	</div>
</template>

<script>
import { getMediaThumbnailUrl, isMobile } from '../utilities';
import Loading from './Loading.vue'
import Title from '../components/Title.vue';
import Profile from '../components/Profile.vue';
import Markdown from '../components/Markdown.vue';
import Score from '../components/Score.vue';
import Timestamp from '../components/Timestamp.vue';

export default {
	name: 'Post',
	props: {
		postId: String,
		user: Object,
		score: Number,
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
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		Title,
		Loading,
		Profile,
		Markdown,
		Score,
	},
	computed: {
		isError()
		{ return this.errorDump !== null || this.errorMessage !== null; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		mdContent()
		{ return concise ? description : description; },
		isText()
		{ return this.tags.includes('text'); },
	},
	methods: {
		getMediaThumbnailUrl,
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
	margin-right: 10px;
	text-align: center;
}
</style>
