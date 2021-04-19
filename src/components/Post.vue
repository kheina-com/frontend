<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' @click='isLoading || !link ? null : navigateToPost(postId)'>
		<div class='privacy'>
			<div v-if='labels && !isLoading'>
				<Subtitle static='right' v-if='showPrivacy'>{{privacy}}</Subtitle>
				<Subtitle static='right' v-if='comment'>comment</Subtitle>
			</div>
			<Button class='edit-button' v-if='!concise && userIsUploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
		</div>
		<div style='display: flex'>
			<Score :score='score' :postId='postId' />
			<div class='post-header'>
				<Title :isLoading='isLoading' size='1.5em' static='left' style='margin-bottom: 0.25em' v-if='(title || isLoading) && !comment'>{{isLoading ? 'this is an example title' : title}}</Title>
				<Profile :isLoading='isLoading' :username='user?.name' :handle='user?.handle' :icon='user?.icon' />
			</div>
		</div>
		<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
		<div v-else-if='editing' style='width: 100%'>
			<MarkdownEditor v-model:value='description' height='10em' resize='vertical' style='margin-bottom: 25px'/>
			<div class='update-button'>
				<Button @click='updatePost' green><i class='material-icons-round'>check</i>Update</Button>
				<Button @click='updatePost' red><i class='material-icons-round'>close</i>Delete</Button>
			</div>
		</div>
		<Markdown v-else-if='description' :content='description' :concise='concise' />
		<Thumbnail :post='postId' :size='1200' style='margin-bottom: 25px' v-if='hasMedia'/>
		<Loading :isLoading='isLoading' class='date' v-if='created || isLoading'>
			<Subtitle static='left' v-if='isUpdated'>posted <Timestamp :datetime='created'/> (edited <Timestamp :datetime='updated'/>)</Subtitle>
			<Subtitle static='left' v-else>posted <Timestamp :datetime='created' /></Subtitle>
		</Loading>
		<Report :data='{ post: postId }' v-if='!isLoading'/>
	</div>
	<ol v-if='comments'>
		<li v-for='comment in comments'>
			<div class='guide-line'></div>
			<Post v-bind='comment' comment/>
		</li>
	</ol>
</template>

<script>
import { getMediaThumbnailUrl, isMobile } from '@/utilities';
import Report from '@/components/Report.vue';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue'
import Title from '@/components/Title.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Score from '@/components/Score.vue';
import Timestamp from '@/components/Timestamp.vue';
import Subtitle from '@/components/Subtitle.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Thumbnail from '@/components/Thumbnail.vue';

export default {
	name: 'Post',
	components: {
		Report,
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
		link: {
			type: Boolean,
			default: true,
		},
		labels: {
			type: Boolean,
			default: false,
		},
		concise: {
			type: Boolean,
			default: true,
		},
		nested: {
			type: Boolean,
			default: false,
		},
		comment: {
			type: Boolean,
			default: false,
		},
		comments: {
			type: Array,
			default: null,
		},

		// post fields
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
		privacy: {
			type: String, 
			default: null,
		},
		tags: {
			type: Array[String],
			default: null,
		},
		userIsUploader: {
			type: Boolean,
			default: false,
		},
		created: {
			type: String, 
			default: null,
		},
		updated: {
			type: String, 
			default: null,
		},
	},
	data() {
		return {
			editing: false,
		};
	},
	computed: {
		isMobile,
		isError()
		{ return this.errorDump !== null || this.errorMessage !== null; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		hasMedia()
		{ return this.tags !== null ? !this.tags.includes('text') : true; },
		isLoading()
		{ return this.postId === null; },
		divClass()
		{ return 'post' + (!this.isLoading && this.link ? ' link' : '') + (this.nested ? ' nested' : '') + (this.comment ? ' comment' : ''); },
		showPrivacy()
		{ return this.privacy && this.privacy.toLowerCase() !== 'public'; },
		isUpdated()
		{ return this.post !== null ? this.created !== this.updated : false; },
	},
	methods: {
		getMediaThumbnailUrl,
		navigateToPost(postId) {
			this.$router.push('/p/' + postId);
		},
		editToggle() {
			this.editing = !this.editing;
		},
		updatePost() {
			// actually update the post
		},
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
	border-radius: 3px;
	display: flex;
	flex-direction: column;
	padding: 25px;
	align-items: flex-start;
	position: relative;
	overflow: hidden;
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
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
	--bg1color: var(--bg2color);
}
.post .edit-button {
	background: var(--bg2color);
}

.post img {
	max-width: 100%;
	max-height: 300px;
	border-radius: 3px;
	margin: 0 auto 0 0;
}
.post-header {
	margin-bottom: 25px;
}
.nested .post-header {
	--bg2color: var(--bg1color);
}
.profile {
	padding: 0.25em;
	margin: -0.25em;
	margin-top: 0;
	border-radius: 3px;
}
a.profile:hover {
	background: var(--bg2color);
}
.post.nested a.profile:hover {
	background: var(--bg1color);
}
.post .markdown {
	margin: 0 0 25px;
}
.post > :last-child {
	margin-bottom: 0;
}
.score {
	margin: -0.5em 0.5em 0 -0.5em;
}
.nested .score {
	--bg2color: var(--bg1color);
}
.nested .loading {
	--bg2color: var(--bg1color);
}
.privacy {
	display: flex;
	position: absolute;
	right: 25px;
	align-items: center;
}
.edit-button {
	margin-left: 0.5em;
	padding: 0.25em;
}
.edit-button i {
	display: block;
}
.nested .markdown {
	--bg3color: var(--bg0color);
	--bg2color: var(--bg1color);
}
textarea {
	width: 100%;
	height: 30em;
	resize: vertical;
}
.update-button {
	position: absolute;
	right: 25px;
	bottom: 25px;
	display: flex;
}
.update-button button {
	margin-right: 25px;
}
.update-button > :last-child {
	margin: 0;
}
.description.loading {
	margin-bottom: 25px;
}
.report:hover {
	background: var(--bg2color);
}
.nested .report:hover {
	background: var(--bg1color);
}

ol {
	list-style: none;
	padding: 0;
	margin: 25px 0 25px 25px;
	display: block;
	position: relative;
}
.guide-line {
	position: absolute;
	bottom: 50%;
	left: -13px;
	height: calc(50% + 25px);
	width: 13px;
	border-bottom-left-radius: 3px;
	border-width: 0 0 1px 1px;
	border-color: var(--linecolor);
	border-style: solid;
}
</style>
