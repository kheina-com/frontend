<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='post nested link'>
		<Thumbnail class='thumbnail' :post='postId' :size='800' :onLoad='onLoad'/>
		<Loading span v-if='isLoading'>this is an example title</Loading>
		<Markdown v-else :content='title' class='title'/>
	</div>
</template>

<script>
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Score from '@/components/Score.vue';
import Timestamp from '@/components/Timestamp.vue';
import Subtitle from '@/components/Subtitle.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Thumbnail from '@/components/Thumbnail.vue';

export default {
	name: 'PostTile',
	components: {
		Title,
		Loading,
		Profile,
		Markdown,
		Score,
		Timestamp,
		Subtitle,
		MarkdownEditor,
		Button,
		Thumbnail,
	},
	props: {
		postId: {
			type: String,
			default: null,
		},
		media_type: {
			type: Object,
			default: { },
		},
		title: {
			type: String, 
			default: null,
		},
	},
	emits: [
		'loaded',
	],
	computed: {
		isLoading()
		{ return this.postId === null; },
		divClass()
		{ return 'post' + (!this.isLoading && this.link ? ' link' : '') + (this.nested ? ' nested' : '') + (this.reply ? ' reply' : ''); },
		showPrivacy()
		{ return this.privacy && this.privacy.toLowerCase() !== 'public'; },
		isUpdated()
		{ return this.post !== null ? this.created !== this.updated : false; },
	},
	methods: {
		onLoad() {
			if (this.parentElement)
			{
				let self = this.$refs.self.getBoundingClientRect();
				this.guideHeight = (self.top + self.bottom) / 2 - this.parentElement.getBoundingClientRect().bottom;
			}
			this.$emit('loaded');
			// this.childTrigger = !this.childTrigger;
		},
	},
	watch: {
		// loadTrigger() {
		// 	this.onLoad();
		// },
	},
}
</script>

<style>
.post.link .title {
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.post.link:hover .title {
	color: var(--icolor);
}
</style>

<style scoped>
.post {
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	padding: 25px;
	align-items: flex-start;
	position: relative;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	text-align: center;
}
.post.link {
	cursor: pointer;
}
.post.link:hover {
	border-color: var(--icolor);
}
.post.nested {
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.post.nested.link:hover {
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
.post {
	background: var(--bg1color);
}
.post .loading {
	/* --bg1color: var(--bg2color); */
}
.post .edit-button {
	background: var(--bg2color);
}

.post img {
	max-width: 10em;
	max-height: 10em;
	border-radius: var(--border-radius);
}
.post .title {
	max-width: 10em;
}
.post > :last-child {
	margin-bottom: 0;
}
.bottom-margin {
	margin-bottom: 25px;
}
</style>
