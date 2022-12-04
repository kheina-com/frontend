<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='post nested link' @click='$router.push(`/p/${postId}`)'>
		<div v-if='media_type'>
			<Thumbnail class='thumbnail' :post='postId' :size='800' :onLoad='onLoad' :width='size?.width' :height='size?.height'/>
		</div>
		<div v-else>
			<div class='parent' v-if='parent'>
				<Loading span v-if='parentData === null'>this is an example title</Loading>
				<Markdown :content='parentData?.title || parent' inline v-else/>
				<i class='material-icons'>reply</i>
			</div>
			<Loading span v-if='isLoading'>this is an example title</Loading>
			<Markdown :content='title' class='title' inline v-else/>
			<Markdown :content='description' :concise='true' class='title'/>
		</div>
		<Report forceMobile/>
	</div>
</template>

<script>
import { khatch } from '@/utilities';
import { postsHost } from '@/config/constants';
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
import Report from '@/components/Report.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';


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
		Report,
		FavoriteButton,
		RepostButton,
	},
	props: {
		parent: {
			type: String,
			default: null,
		},
		postId: {
			type: String,
			default: null,
		},
		media_type: {
			type: Object,
			default: { },
		},
		score: Object,
		title: {
			type: String, 
			default: null,
		},
		description: {
			type: String, 
			default: null,
		},
		blocked: {
			type: Boolean,
			default: false,
		},
		size: {
			type: Object,
			default: { width: 0, height: 0 },
		},
	},
	emits: [
		'loaded',
	],
	data() {
		return {
			parentData: null,
		};
	},
	mounted() {
		if (this.parent) {
			khatch(`${postsHost}/v1/post/${this.parent}`, {
				method: 'GET',
				errorMessage: 'Failed to retrieve post parent.',
			})
			.then(response => {
				response.json().then(r => this.parentData = r);
			})
			.catch(() => { });
		}
	},
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
		parent(value) {
			if (value) {
				khatch(`${postsHost}/v1/post/${value}`, {
					method: 'GET',
					errorMessage: 'Failed to retrieve post parent.',
				})
				.then(response => {
					response.json().then(r => this.parentData = r);
				})
				.catch(() => { });
			}
		},
	},
}
</script>

<style>
.post.link .title {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
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
	padding: 25px 25px 15px;
	align-items: flex-start;
	position: relative;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	text-align: center;
	max-width: 10em;
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

.parent {
	color: var(--subtle);
	display: flex;
	align-items: center;
	margin: auto;
}

.post img {
	max-width: 10em;
	max-height: 10em;
	border-radius: var(--border-radius);
	margin: 0 auto;
}
.post .title, .thumbnail {
	max-width: 10em;
	max-height: 10em;
	margin: auto;
}
.post > :last-child {
	margin-bottom: 0;
}
.bottom-margin {
	margin-bottom: 25px;
}
</style>
