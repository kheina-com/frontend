<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' @click='isLoading || !link ? null : navigateToPost(postId)' ref='self'>
		<!-- <div class='guide-line' ref='guide' v-if='parentElement' :style='`height: ${guideHeight}px`'></div> -->
		<div class='labels'>
			<DropDown :options='[
				{ name: "Report User", action: () => { } },
				{ name: "Block User", action: () => { } },
				{ name: "Block Post", action: () => { } },
			]'>
				<i class='more-button material-icons-round'>more_horiz</i>
			</DropDown>
			<div v-if='labels && !isLoading'>
				<Subtitle static='right' v-if='showPrivacy'>{{privacy}}</Subtitle>
				<Subtitle static='right' v-if='parent'>comment</Subtitle>
			</div>
			<Button class='edit-button' v-if='!concise && userIsUploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
		</div>
		<div style='display: flex'>
			<Score :score='score' :postId='postId' />
			<div class='post-header'>
				<h2 v-if='isLoading || title'>
					<Loading span v-if='isLoading'>this is an example title</Loading>
					<Markdown v-else :content='title' inline/>
				</h2>
				<Profile :isLoading='isLoading' v-bind='user'/>
			</div>
		</div>
		<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
		<div v-else-if='editing' style='width: 100%'>
			<MarkdownEditor v-model:value='description' height='10em' resize='vertical' class='bottom-margin'/>
			<div class='update-button'>
				<Button @click='updatePost' green><i class='material-icons-round'>check</i>Update</Button>
				<Button @click='updatePost' red><i class='material-icons-round'>close</i>Delete</Button>
			</div>
		</div>
		<Markdown v-else-if='description' :content='description' :concise='concise' />
		<div class='bottom-margin' v-if='media_type && !isLoading'>
			<Thumbnail :post='postId' :size='1200'  v-if='($store.state.user || rating === "general" || acceptedMature)' :onLoad='onLoad'/>
			<button @click.stop.prevent='acceptedMature = true' class='interactable show-mature' v-else>
				this post contains <b>{{rating}}</b> content, click here to show it anyway.
			</button>
		</div>
		<Loading :isLoading='isLoading' class='date' v-if='created || isLoading'>
			<Subtitle static='left' v-if='isUpdated'>posted <Timestamp :datetime='created'/> (edited <Timestamp :datetime='updated'/>)</Subtitle>
			<Subtitle static='left' v-else>posted <Timestamp :datetime='created' /></Subtitle>
		</Loading>
		<div class='buttons' v-if='!isLoading'>
			<Report :data='{ post: postId }' v-if='!isLoading'/>
			<RepostButton :postId='postId'/>
			<FavoriteButton :postId='postId'/>
			<ShareLink class='post-buttons' :content='`https://${environment === "prod" ? "kheina.com" : "dev.kheina.com"}/p/${postId}`' v-if='post?.privacy !== "unpublished"'/>
			<button class='reply-button' @click.prevent.stop='$store.state.user ? replying = true : $router.push(`/account/login?path=${$route.fullPath}`)'>
				<i class='material-icons'>reply</i>
			</button>
		</div>
	</div>
	<ol v-if='replying || (comments && comments.length != 0)'>
		<li v-if='replying'>
			<MarkdownEditor v-model:value='replyMessage' resize='vertical' class='bottom-margin'/>
			<div class='reply-buttons'>
				<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
				<Button class='interactable' @click='replying = false' red><i class='material-icons-round'>close</i>Cancel</Button>
			</div>
		</li>
		<li v-for='comment in comments'>
			<Post :postId='comment.post_id' v-bind='comment' :link='false' comment @loaded='onLoad'/> <!-- :loadTrigger='childTrigger' -->
		</li>
	</ol>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, isMobile, khatch } from '@/utilities';
import { uploadHost } from '@/config/constants';
import Report from '@/components/Report';
import Button from '@/components/Button';
import Loading from '@/components/Loading'
import Title from '@/components/Title';
import Profile from '@/components/Profile';
import Markdown from '@/components/Markdown';
import Score from '@/components/Score';
import Timestamp from '@/components/Timestamp';
import Subtitle from '@/components/Subtitle';
import MarkdownEditor from '@/components/MarkdownEditor';
import Thumbnail from '@/components/Thumbnail';
import ShareLink from '@/components/ShareLink';
import FavoriteButton from '@/components/FavoriteButton';
import RepostButton from '@/components/RepostButton';
import DropDown from '@/components/DropDown';

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
		ShareLink,
		FavoriteButton,
		RepostButton,
		DropDown,
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
		parent: {
			type: String,
			default: null,
		},
		comment: {
			type: Boolean,
			default: false,
		},
		// loadTrigger: {
		// 	type: Boolean,
		// 	default: null,
		// },
		media_type: {
			type: Object,
			default: { },
		},
		comments: {
			type: Array[Object],
			default: null,
		},
		rating: {
			type: String,
			default: 'explicit',
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
	emits: [
		'loaded',
	],
	setup() {
		const guide = ref(null);
		const self = ref(null);

		return {
			guide,
			self,
		};
	},
	data() {
		return {
			editing: false,
			guideHeight: null,
			parentElement: null,
			// childTrigger: null,
			replying: null,
			replyMessage: null,
			acceptedMature: false,
		};
	},
	mounted() {
		let parentElement = this.$refs.self.parentElement.parentElement.parentElement.children[0];
		if (parentElement.classList.contains('comment'))
		{ this.parentElement = parentElement; }
		this.onLoad();
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
		postComment() {
			let created = new Date();
			let updated = created;

			khatch(`${uploadHost}/v1/create_post`, {
					method: 'POST',
					body: {
						reply_to: this.postId,
						description: this.replyMessage.trim(),
						rating: 'general',
						privacy: 'public',
					},
				})
				.then(response => {
					response.json()
						.then(r => {
							console.log(r);
							this.comments.unshift({
								post_id: r.post_id,
								user: this.$store.state.user,
								blocked: false,
								description: this.replyMessage.trim(),
								rating: 'general',
								score: {
									up: 1,
									down: 0,
								},
								created,
								updated,
								title: null,
								media_type: null,
								tags: [],
								comments: [],
							});
							this.replyMessage = null;
							this.replying = null;
						});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		},
		navigateToPost(postId) {
			this.$router.push('/p/' + postId);
		},
		editToggle() {
			this.editing = !this.editing;
		},
		onLoad() {
			if (this.parentElement)
			{
				let self = this.$refs.self.getBoundingClientRect();
				this.guideHeight = (self.top + self.bottom) / 2 - this.parentElement.getBoundingClientRect().bottom;
			}
			this.$emit('loaded');
			// this.childTrigger = !this.childTrigger;
		},
		updatePost() {
			// actually update the post
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
}
.post.nested {
	background: var(--bg2color);
}
.post.link {
	cursor: pointer;
}
.post.link:hover {
	border-color: var(--icolor);
}
.post.link {
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.post.link:hover {
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
	max-width: 100%;
	max-height: 300px;
	border-radius: var(--border-radius);
	margin: 0 auto 0 0;
}
.post-header {
	margin-bottom: 25px;
	display: flex;
	flex-flow: column;
	align-items: flex-start;
}
.post-header h2 {
	font-size: 1.5em;
	font-weight: normal;
	margin: 0;
}
.nested .post-header {
	--bg2color: var(--bg1color);
}
.profile {
	padding: 0.25em;
	margin: -0.25em;
	margin-top: 0;
	border-radius: var(--border-radius);
}
a.profile:hover {
	background: var(--bg2color);
}
.post.nested a.profile:hover {
	background: var(--bg1color);
}
.post .markdown {
	margin: -10px 0 15px -10px;
	padding: 10px;
	overflow: hidden;
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
.labels {
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

ol {
	list-style: none;
	padding: 0;
	margin: 25px 0 0 25px;
	display: block;
	position: relative;
}
ol li {
	margin-bottom: 25px;
}
ol > :last-child, ol > :last-child .post {
	margin: 0;
}
.guide-line {
	position: absolute;
	bottom: 50%;
	left: -14px;
	height: calc(50% + 25px);
	width: 13px;
	border-bottom-left-radius: 12px;
	border-width: 0 0 2px 2px;
	border-color: var(--linecolor);
	border-style: solid;
	z-index: -1;
}
.direct-link {
	color: var(--subtle);
	display: block;
}
.direct-link i {
	font-size: 1.2em;
}
.buttons {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.buttons button {
	color: var(--subtle);
	background: #0000;
	border-radius: var(--border-radius);
	padding: 0.25em;
}
.buttons button:hover {
	color: var(--icolor);
	background: var(--bg2color);
}
.nested .buttons button:hover {
	background: var(--bg1color);
}
.buttons button i {
	display: block;
}
.reply-button {
	display: flex;
	align-items: center;
	color: var(--subtle);
}
.reply-button:hover {
	color: var(--icolor);
}

.reply-buttons {
	display: flex;
	justify-content: flex-end;
}
.show-mature {
	padding: 25px;
	background: var(--bg1color);
}
.bottom-margin {
	margin-bottom: 25px;
}

.more-button {
	border-radius: var(--border-radius);
	padding: calc(0.5em / 3);
	color: var(--subtle);
	background: #00000000;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.more-button:hover {
	color: var(--icolor);
	background: var(--bg2color);
}
.more-button {
	display: block;
	font-size: 1.5em;
}
</style>
