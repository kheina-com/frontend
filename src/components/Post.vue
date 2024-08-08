<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- TODO: add some serious optimizations in here. this component causes lag on search pages (lazy rendering?) -->
	<div>
		<div :class='divClass' ref='self'>
			<!-- <div class='guide-line' ref='guide' v-if='parentElement' :style='`height: ${guideHeight}px`'></div> -->
			<a :href='target' class='background-link' @click.prevent='nav' v-show='!isLoading && !unlink'/>
			<div class='labels' v-show='!isLoading'>
				<DropDown class='more-button' v-show='!hideButtons' :options="[
					{ html: `${user?.following ? 'Unfollow' : 'Follow'} @${user?.handle}`, action: followUser },
					{ html: `Block @${user?.handle}`, action: missingFeature },
					{ html: `Report @${user?.handle}`, action: missingFeature },
				]">
					<i class='material-icons-round'>more_horiz</i>
				</DropDown>
				<div v-if='labels'>
					<Subtitle static='right' v-show='showPrivacy'>{{privacy}}</Subtitle>
					<Subtitle static='right' v-show='parent'>reply</Subtitle>
				</div>
				<Button class='edit-button' v-if='!concise && userIsUploader' @click='editToggle'>
					<i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i>
				</Button>
			</div>
			<div class='header-block'>
				<Score :score='score' :postId='postId'/>
				<div class='post-header'>
					<h2 v-if='isLoading || title'>
						<Loading span v-if='isLoading'>this is an example title</Loading>
						<Markdown :content='title' inline class='title' lazy v-else/>
					</h2>
					<Profile :isLoading='isLoading' v-bind='user'/>
				</div>
			</div>
			<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
			<!-- <div v-else-if='editing' style='width: 100%'>
				<MarkdownEditor v-model:value='description' height='10em' resize='vertical' class='bottom-margin'/>
				<div class='update-button'>
					<Button @click='updatePost' green><i class='material-icons-round'>check</i>Update</Button>
					<Button @click='updatePost' red><i class='material-icons-round'>close</i>Delete</Button>
				</div>
			</div> -->
			<Markdown v-else-if='description' :content='description' :concise='concise' lazy/>
			<div class='bottom-margin thumbnail' v-if='media_type && !isLoading'>
				<Thumbnail :post='postId' :size='isMobile ? 1200 : 800' :load='acceptedMature' :thumbhash='thumbhash' :width='size?.width' :height='size?.height'/>
				<button @click.stop.prevent='acceptedMature = true' class='interactable show-mature' v-show='!acceptedMature'>
					this post contains <b>{{rating}}</b> content, click here to show it anyway.
				</button>
			</div>
			<Loading :isLoading='isLoading' class='date' v-if='created || isLoading'>
				<Subtitle static='left' v-if='isUpdated'>{{unpublishedPrivacy.has(privacy) ? 'created' : 'posted'}} <Timestamp :datetime='created'/> (edited <Timestamp :datetime='updated'/>)</Subtitle>
				<Subtitle static='left' v-else>{{unpublishedPrivacy.has(privacy) ? 'created' : 'posted'}} <Timestamp :datetime='created'/></Subtitle>
			</Loading>
			<div class='buttons' v-if='!isLoading' v-show='!hideButtons'>
				<ReportButton :data='{ post: postId }' v-if='!isLoading'/>
				<RepostButton :postId='postId' v-bind:count='reposts'/>
				<FavoriteButton :postId='postId' v-bind:count='favorites'/>
				<ShareLink class='post-buttons' :content='`/p/${postId}`' v-if='!unpublishedPrivacy.has(privacy)'/>
				<button class='reply-button' @click.prevent.stop='globals.user ? replying = true : $router.push(`/a/login?path=${$route.fullPath}`)'>
					<i class='material-icons'>reply</i>
				</button>
			</div>
		</div>
		<ol v-if='replying || (replies && replies.length !== 0)'>
			<li v-if='replying'>
				<MarkdownEditor v-model:value='replyMessage' resize='vertical' class='bottom-margin'/>
				<div class='reply-buttons'>
					<Button class='interactable' style='margin-right: var(--margin)' @click='postComment' green><i class='material-icons-round'>create</i><span>Post</span></Button>
					<Button class='interactable' @click='replying = false' red><i class='material-icons-round'>close</i><span>Cancel</span></Button>
				</div>
			</li>
			<li v-for='reply in replies'>
				<Post :postId='reply.post_id' v-bind='reply' reply/> <!-- @loaded='onLoad' :loadTrigger='childTrigger' -->
			</li>
		</ol>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/globals';
import { khatch } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessageToast, isMobile, ratingMap, host, apiErrorMessage } from '@/config/constants';
import ReportButton from '@/components/ReportButton.vue';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
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

const props = withDefaults(defineProps<{
	postId: string | null,
	unlink: boolean,
	labels: boolean,
	concise: boolean,
	nested: boolean,
	parent: string | null,
	reply: boolean,
	// loadTrigger: {
	// 	type: Boolean,
	// 	default: null,
	// },
	media_type: MediaType | null,
	replies: Post[] | null,
	rating: "general" | "mature" | "explicit",

	// post fields
	user: User,
	score: Score | null,
	title: string | null,
	description: string | null,
	privacy: "public" | "unlisted" | "private" | "unpublished" | "draft",
	tags: string[] | null,
	userIsUploader: boolean,
	created: Date,
	updated: Date,
	filename: string | null,
	size: Size | null,
	blocked: boolean,
	favorites: number,
	reposts: number,
	hideButtons: boolean,
	to: string | null,
	thumbhash: string | null,
}>(), {
	postId: null,
	unlink: false,
	labels: false,
	concise: true,
	nested: false,
	parent: null,
	reply: false,
	// loadTrigger: {
	// 	type: Boolean,
	// 	default: null,
	// },
	media_type: null,
	replies: null,
	rating: "explicit",

	// post fields
	// user: Object,
	// score: Object,
	title: null,
	description: null,
	privacy: "draft",
	tags: null,
	userIsUploader: false,
	// created: null,
	// updated: null,
	filename: null,
	size: null,
	blocked: false,
	favorites: 0, // this value needs to be updated to null when api is updated
	reposts: 0, // this value needs to be updated to null when api is updated
	hideButtons: false,
	to: null,
	thumbhash: null,
});
const globals = store();
const emits = defineEmits(["loaded"]);
const unpublishedPrivacy = new Set(["unpublished", "draft"]);
// const guide = ref(null);
const self = ref(null);
const router = useRouter();

let editing = false;
// let guideHeight: number = 0;
// parentElement: null,
// childTrigger: null,
const replying: Ref<boolean> = ref(false);
const replyMessage: Ref<string> = ref("");
const acceptedMature: Ref<boolean> = ref(ratingMap[globals.rating] >= ratingMap[props.rating]);
// mounted() {
// 	let parentElement = this.$refs.self.parentElement.parentElement.parentElement.children[0];
// 	if (parentElement.classList.contains("reply"))
// 	{ this.parentElement = parentElement; }
// 	this.onLoad();
// },

// const hasMedia = computed(() => { return props.tags !== null ? !props.tags.includes("text") : true; });
const isLoading = computed(() => !props.postId);
const divClass = computed(() => "post" + (props.postId && !props.unlink ? " link" : "") + (props.nested ? " nested" : " unnested") + (props.reply ? " reply" : ""));
const showPrivacy = computed(() => props.privacy && props.privacy.toLowerCase() !== "public");
const isUpdated = computed(() => !props.postId ? props.created !== props.updated : false);
const target = computed(() => props.to || "/p/" + props.postId	);

function nav() {
	globals.postCache = {
		post_id: props.postId as string,
		title: props.title,
		description: props.description,
		user: props.user,
		score: props.score,
		rating: props.rating,
		parent: props.parent,
		privacy: props.privacy,
		created: props.created,
		updated: props.updated,
		filename: props.filename,
		media_type: props.media_type,
		size: props.size,
		blocked: props.blocked,
		// favorites: props.favorites,
		// reposts: props.reposts,
		thumbhash: props.thumbhash,
	};
	router.push(target.value);
}

function followUser() {
	khatch(`${host}/v1/user/${props.user.handle}/follow`, {
		method: props.user.following ? "DELETE" : "PUT",
	})
	.then(response => {
		if (response.status < 300) {
			props.user.following = !props.user.following;
			globals.createToast({
				icon: props.user.following ? "person_add_alt" : "person_remove",
				title: `Successfully ${props.user.following ? "Followed" : "Unfollowed"} @${props.user.handle}`,
				time: 5,
			});
		}
		else if (response.status < 500) {
			response.json().then(r => {
				globals.createToast({
					title: apiErrorMessageToast,
					description: r.error,
				});
			});
		}
		else {
			response.json().then(r => {
				globals.createToast({
					title: apiErrorMessageToast,
					description: apiErrorDescriptionToast,
					dump: r,
				});
			});
		}
	})
}

function missingFeature() {
	globals.createToast({
		icon: "sentiment_dissatisfied",
		title: "This function does not exist yet",
		description: "Sorry!",
	});
}

function postComment() {
	khatch(`${host}/v1/upload/post`, {
		method: "PUT",
		body: {
			reply_to: props.postId,
			description: replyMessage.value.trim(),
			rating: "general",
			privacy: "public",
		},
	}).then(r => r.json())
	.then(r => {
		props.replies?.unshift({
			...r,
			replies: [],
		});
		replyMessage.value = "";
		replying.value = false;
	}).catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
	});
}

function editToggle() {
	editing = !editing;
}
// onLoad() {
// 	if (this.parentElement)
// 	{
// 		let self = this.$refs.self.getBoundingClientRect();
// 		this.guideHeight = (self.top + self.bottom) / 2 - this.parentElement.getBoundingClientRect().bottom;
// 	}
// 	this.$emit("loaded");
// 	// this.childTrigger = !this.childTrigger;
// },
// function updatePost() {
// 	// actually update the post
// }
// watch: {
// 	loadTrigger() {
// 		this.onLoad();
// 	},
// }
</script>

<style>
.post.link .title {
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.post.link:hover .title {
	color: var(--interact);
}
</style>

<style scoped>
.post {
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	padding: var(--margin);
	align-items: flex-start;
	position: relative;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.background-link {
	top: 0;
	left: 0;
	position: absolute;
	width: 100%;
	height: 100%;
}
.post.nested {
	background: var(--bg2color);
}
.post.link {
	cursor: pointer;
}
.post.link:hover {
	border-color: var(--interact);
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

.thumbnail {
	max-width: 100%;
	max-height: 300px;
	border-radius: var(--border-radius);
	margin: 0 auto 0 0;
	position: relative;
	pointer-events: none;
	display: flex;
}

.header-block {
	display: flex;
	position: relative;
	pointer-events: none;
}

.post-header {
	margin-bottom: var(--margin);
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
	margin: -0.25em;
	margin-top: 0;
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
.score {
	margin: -0.5em 0.5em 0 -0.5em;
}
.mobile .score {
	margin: var(--neg-margin) 0 0 var(--neg-margin);
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
	right: var(--margin);
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
	right: var(--margin);
	bottom: var(--margin);
	display: flex;
}
.update-button button {
	margin-right: var(--margin);
}
.update-button > :last-child {
	margin: 0;
}
.description.loading {
	margin-bottom: var(--margin);
}

ol {
	list-style: none;
	padding: 0;
	margin: var(--margin) 0 0 var(--margin);
	display: block;
	position: relative;
}
ol li {
	margin-bottom: var(--margin);
}
ol > :last-child, ol > :last-child .post {
	margin: 0;
}
.guide-line {
	position: absolute;
	bottom: 50%;
	left: -14px;
	height: calc(50% + var(--margin));
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
	margin-bottom: -0.25em;
}
.buttons button div, .reply-button i {
	color: var(--subtle);
	background: #0000;
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.buttons button:hover div, .reply-button:hover i {
	color: var(--interact);
	background: var(--bg2color);
}
.nested .buttons button:hover div, .nested .reply-button:hover i {
	background: var(--bg1color);
}
.mobile .buttons {
	width: calc(100% + 50px);
	margin: 0 var(--neg-margin) var(--neg-margin);
}
.mobile .buttons button, .mobile .buttons a {
	padding: 0 var(--margin) var(--margin);
	margin: 0;
}
.reply-button {
	display: flex;
	align-items: center;
	color: var(--subtle);
	margin-right: -0.25em;
	position: relative;
}
.reply-button i {
	padding: 0.25em;
	font-size: 1.5em;
}

.reply-buttons {
	display: flex;
	justify-content: flex-end;
}
.show-mature {
	padding: var(--margin);
	background: var(--bg2color);
	position: absolute;
	align-self: center;
	max-width: 100%;
	margin: auto var(--margin);
	pointer-events: all;
}
.nested .show-mature {
	background: var(--bg1color);
}
.bottom-margin {
	margin-bottom: var(--margin);
}

.more-button i {
	display: block;
	font-size: 1.5em;
	border-radius: var(--border-radius);
	padding: calc(0.5em / 3);
	color: var(--subtle);
	background: #00000000;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.more-button:hover i {
	color: var(--interact);
	background: var(--bg2color);
}
.nested .more-button:hover i {
	background: var(--bg1color);
}
.mobile .more-button {
	padding: var(--margin);
	margin: var(--neg-margin);
}

.mobile .thumbnail {
	max-height: 150vw;
	overflow: hidden;
	/* this is necessary so that we can calc thumbnails sizes off of the max width */
	max-width: calc(100vw - 100px - 2 * var(--border-size));
	margin-left: auto;
	margin-right: auto;
}
.mobile .thumbnail img {
	max-height: 100%;
	min-width: 100%;
}

.unnested .report:hover {
	background: var(--bg2color) !important;
}

/* theme overrides */
html.midnight .buttons button:hover, html.midnight .dropdown i:hover {
	background: #000000;
}
</style>
