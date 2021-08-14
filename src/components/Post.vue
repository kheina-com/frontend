<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' @click='isLoading || !link ? null : navigateToPost(postId)' ref='self'>
		<!-- <div class='guide-line' ref='guide' v-if='parentElement' :style='`height: ${guideHeight}px`'></div> -->
		<div class='labels'>
			<DropDown :options="[
				{ name: `${user?.following ? 'Unfollow' : 'Follow'} @${user?.handle}`, action: followUser },
				{ name: `Block @${user?.handle}`, action: missingFeature },
				{ name: `Report @${user?.handle}`, action: missingFeature },
			]">
				<i class='more-button material-icons-round'>more_horiz</i>
			</DropDown>
			<div v-if='labels && !isLoading'>
				<Subtitle static='right' v-if='showPrivacy'>{{privacy}}</Subtitle>
				<Subtitle static='right' v-if='parent'>reply</Subtitle>
			</div>
			<Button class='edit-button' v-if='!concise && userIsUploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
		</div>
		<div style='display: flex'>
			<Score :score='score' :postId='postId' />
			<div class='post-header'>
				<h2 v-if='isLoading || title'>
					<Loading span v-if='isLoading'>this is an example title</Loading>
					<Markdown v-else :content='title' inline class='title'/>
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
		<div class='bottom-margin thumbnail' v-if='media_type && !isLoading'>
			<Thumbnail :post='postId' :size='1200' v-if='($store.state.user || rating === "general" || acceptedMature)' :onLoad='onLoad'/>
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
	<ol v-if='replying || (replies && replies.length != 0)'>
		<li v-if='replying'>
			<MarkdownEditor v-model:value='replyMessage' resize='vertical' class='bottom-margin'/>
			<div class='reply-buttons'>
				<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
				<Button class='interactable' @click='replying = false' red><i class='material-icons-round'>close</i>Cancel</Button>
			</div>
		</li>
		<li v-for='reply in replies'>
			<Post :postId='reply.post_id' v-bind='reply' :link='false' reply @loaded='onLoad'/> <!-- :loadTrigger='childTrigger' -->
		</li>
	</ol>
</template>

<script>
import { ref } from 'vue';
import { getMediaThumbnailUrl, isMobile, khatch } from '@/utilities';
import { uploadHost, usersHost } from '@/config/constants';
import Report from '@/components/Report.vue';
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
import ShareLink from '@/components/ShareLink.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';
import DropDown from '@/components/DropDown.vue';

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
		reply: {
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
		replies: {
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
		if (parentElement.classList.contains('reply'))
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
		{ return 'post' + (!this.isLoading && this.link ? ' link' : '') + (this.nested ? ' nested' : '') + (this.reply ? ' reply' : ''); },
		showPrivacy()
		{ return this.privacy && this.privacy.toLowerCase() !== 'public'; },
		isUpdated()
		{ return this.post !== null ? this.created !== this.updated : false; },
	},
	methods: {
		getMediaThumbnailUrl,
		followUser() {
			khatch(`${usersHost}/v1/${this.user.following ? 'unfollow_user' : 'follow_user'}`, {
				method: 'POST',
				body: {
					handle: this.user.handle,
				},
			})
			.then(response => {
				if (response.status < 300)
				{
					this.user.following = !this.user.following;
					this.$store.commit('createToast', {
						icon: this.user.following ? 'person_add_alt' : 'person_remove',
						title: `Successfully ${this.user.following ? 'Followed' : 'Unfollowed'} @${this.user.handle}`,
						time: 5,
					});
				}
				else if (response.status < 500)
				{
					this.$store.commit('createToast', {
						title: apiErrorMessageToast,
						description: r.error,
					});
				}
				else
				{
					this.$store.commit('createToast', {
						title: apiErrorMessageToast,
						description: apiErrorDescriptionToast,
						dump: r,
					});
				}
			})
		},
		missingFeature() {
			this.$store.commit('createToast', {
				icon: 'sentiment_dissatisfied',
				title: 'This function does not exist yet',
				description: 'Sorry!',
			});
			
		},
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
							this.replies?.unshift({
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
								replies: [],
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
.mobile .score {
	margin: -25px 0 0 -25px;
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
	align-items: flex-end;
	flex-direction: column;
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
.buttons button i {
	color: var(--subtle);
	background: #0000;
	border-radius: var(--border-radius);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.buttons button:hover i {
	color: var(--icolor);
	background: var(--bg2color);
}
.nested .buttons button:hover i {
	background: var(--bg1color);
}
.buttons button i {
	display: block;
}
.mobile .buttons {
	width: calc(100% + 50px);
	margin: 0 -25px -25px;
}
.mobile .buttons button {
	padding: 0 25px 25px;
	margin: 0;
}
.reply-button {
	display: flex;
	align-items: center;
	color: var(--subtle);
}
.reply-button i {
	padding: 0.25em;
	font-size: 1.5em;
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
	background: var(--bg2color);
}
.nested .show-mature {
	background: var(--bg1color);
}
.bottom-margin {
	margin-bottom: 25px;
}

.more-button {
	display: block;
	font-size: 1.5em;
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
.nested .more-button:hover {
	background: var(--bg1color);
}
.mobile .more-button {
	padding: 25px;
	margin: -25px;
}

.mobile .thumbnail {
	max-height: 150vw;
	overflow: hidden;
}
.mobile .thumbnail img {
	max-height: 100%;
	width: 100%;
}

/* theme overrides */
html.midnight .buttons button:hover, html.midnight .dropdown i:hover {
	background: #000000;
}
</style>
