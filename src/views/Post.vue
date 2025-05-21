<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<ol class='parents'>
		<li v-for='parent in parents()'>
			<div class='guide-line'/>
			<Post :postId='parent?.post_id' v-bind='parent'/>
		</li>
	</ol>
	<div class='container' v-if='!isMobile'>
		<div class='scroller' ref='scroller'/>
		<Sidebar :post='post' v-model:scalar='scalar' class='sidebar'/>
		<div class='content'>
			<div ref='media' class='media-container' v-if='post?.media'>
				<Media class='media' :mime='post.media.type.mime_type' :src='mediaUrl' :thumbhash='post.media?.thumbhash' v-model:width='width' v-model:height='height' v-model:scaleHeight='scalar' bg/>
				<SetControls :set='set' v-for='set in sets'/>
			</div>
			<div v-else='sets?.length'>
				<SetControls :set='set' v-for='set in sets'/>
			</div>
			<main>
				<div class='post-header'>
					<Score :score='post?.score' :postId='props.postId'/>
					<div class='post-title'>
						<h2>
							<Loading span v-if='isLoading'>this is an example title</Loading>
							<Markdown v-else :content='post?.title' inline/>
						</h2>
						<div class='privacy'>
							<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
							<router-link v-if='userIsUploader' :to='"/create?post=" + props.postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>edit</i></Button></router-link>
						</div>
						<Profile :isLoading='isLoading' v-bind='post?.user'/>
					</div>
				</div>
				<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
				<Markdown v-else-if='post?.description' :content='post.description' style='margin: 0 0 var(--margin)'/>
				<Loading :isLoading='isLoading'>
					<Subtitle static='left' v-if='isUpdated'>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/> (edited <Timestamp :datetime='post?.updated' live/>)</Subtitle>
					<Subtitle static='left' v-else>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/></Subtitle>
				</Loading>
				<div class='post-buttons' v-if='post'>
					<ReportButton :data='{ post: postId }'/>
					<RepostButton :postId='props.postId' v-model:count='post.reposts'/>
					<FavoriteButton :postId='props.postId' v-model:count='post.favorites'/>
					<ShareLink :content='`/p/${props.postId}`' v-if='!unpublishedPrivacy.has(post?.privacy)'/>
					<DropDown :options='[
						{ html: translate(post?.user.following ? "unfollow_user" : "follow_user", { handle: post?.user?.handle ?? "" }), action: followUser },
						{ html: translate("block_user", { handle: post?.user?.handle ?? "" }), action: () => { } },
						{ html: translate("report_user", { handle: post?.user?.handle ?? "" }), action: () => { } },
					]'>
						<i class='more-button material-icons-round'>more_horiz</i>
					</DropDown>
				</div>
				<ThemeMenu/>
			</main>
			<div class='reply-section'>
				<div class='reply-header'>
					<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: var(--margin)' v-if='writeComment'/>
					<div class='reply-field'>
						<p class='reply-label'>
							{{replies ? countComments : 'Loading'}} {{countComments !== 1 ? 'Replies' : 'Reply'}}
							<DropDown class='sort-dropdown' v-model:value='commentSort' :options='[
								{ html: "Top", value: "top" },
								{ html: "Hot", value: "hot" },
								{ html: "Best", value: "best" },
								{ html: "Controversial", value: "controversial" },
							]'>
								<span class='sort-by'>
									<i class='material-icons-round'>sort</i>
									sort by
								</span>
							</DropDown>
						</p>
						<div class='buttons' v-if='writeComment'>
							<Button class='button' @click='postComment' green><i class='material-icons-round'>send</i><span>Post</span></Button>
							<Button class='button' @click='openEditor'><i class='material-icons-round'>edit_note</i><span>Editor</span></Button>
							<Button class='button' @click='writeComment = false' red><i class='material-icons-round'>close</i><span>Cancel</span></Button>
						</div>
						<Button class='buttons' @click='globals.user ? writeComment = true : $router.push(`/a/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
					</div>
				</div>
				<ol class='replies'>
					<li v-for='reply in replies'>
						<Post :postId='reply?.post_id' v-bind='reply'/>
					</li>
				</ol>
			</div>
		</div>
	</div>
	<div class='content' v-else>
		<div class='scroller' ref='scroller'/>
		<div class='media-container' v-if='post?.media'>
			<Media :mime='post.media.type.mime_type' :src='mediaUrl' :thumbhash='post.media?.thumbhash' v-model:width='width' v-model:height='height' bg/>
			<SetControls :set='set' v-for='set in sets'/>
		</div>
		<div v-else='sets?.length'>
			<SetControls :set='set' v-for='set in sets'/>
		</div>
		<main>
			<div class='post-header'>
				<Score :score='post?.score' :postId='props.postId'/>
				<div class='post-title'>
					<h2>
						<Loading span v-if='isLoading'>this is an example title</Loading>
						<Markdown v-else :content='post?.title' inline/>
					</h2>
					<div class='privacy'>
						<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
						<router-link v-if='userIsUploader' :to='"/create?post=" + props.postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>edit</i></Button></router-link>
					</div>
					<Profile :isLoading='isLoading' v-bind='post?.user'/>
				</div>
			</div>
			<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
			<Markdown v-else-if='post?.description' :content='post.description' style='margin: 0 0 var(--margin)'/>
			<Loading :isLoading='isLoading'>
				<Subtitle static='left' v-if='isUpdated'>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/> (edited <Timestamp :datetime='post?.updated' live/>)</Subtitle>
				<Subtitle static='left' v-else>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/></Subtitle>
			</Loading>
			<div class='post-buttons' v-if='post'>
				<ReportButton :data='{ post: props.postId }'/>
				<RepostButton :postId='props.postId' v-model:count='post.reposts'/>
				<FavoriteButton :postId='props.postId' v-model:count='post.favorites'/>
				<ShareLink :content='`/p/${props.postId}`' v-if='!unpublishedPrivacy.has(post?.privacy)'/>
				<DropDown :options='[
					{ html: translate(post?.user.following ? "unfollow_user" : "follow_user", { handle: post?.user?.handle ?? "" }), action: followUser },
					{ html: translate("block_user", { handle: post?.user?.handle ?? "" }), action: () => { } },
					{ html: translate("report_user", { handle: post?.user?.handle ?? "" }), action: () => { } },
				]'>
					<i class='more-button material-icons-round'>more_horiz</i>
				</DropDown>
			</div>
			<ThemeMenu/>
		</main>
		<div class='tabs'>
			<button @click='selectTab' id='info'>
				Info
				<div class='border'/>
			</button>
			<div class='separator'/>
			<button @click='selectTab' id='replies'>
				Replies
				<div class='border'/>
			</button>
		</div>
		<div class='active-tab'>
			<Sidebar :post='post' v-model:scalar='scalar' class='sidebar' v-show='tab === "info"'/>
			<div class='reply-section' v-show='tab === "replies"'>
				<div class='reply-header'>
					<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: var(--margin)' v-if='writeComment'/>
					<div class='reply-field'>
						<p class='reply-label'>
							{{replies ? countComments : 'Loading'}} {{countComments !== 1 ? 'Replies' : 'Reply'}}
							<DropDown class='sort-dropdown' v-model:value='commentSort' :options="[
								{ html: 'Top', value: 'top' },
								{ html: 'Hot', value: 'hot' },
								{ html: 'Best', value: 'best' },
								{ html: 'Controversial', value: 'controversial' },
							]">
								<span class='sort-by'>
									<i class='material-icons-round'>sort</i>
									sort by
								</span>
							</DropDown>
						</p>
						<div class='buttons' v-if='writeComment'>
							<Button class='button' @click='postComment' green><i class='material-icons-round'>create</i><span>Post</span></Button>
							<Button class='button' @click='openEditor'><i class='material-icons-round'>edit_note</i><span>Editor</span></Button>
							<Button class='button' @click='writeComment = false' red><i class='material-icons-round'>close</i><span>Cancel</span></Button>
						</div>
						<Button class='interactable buttons' @click='globals.user ? writeComment = true : $router.push(`/a/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
					</div>
				</div>
				<ol class='replies'>
					<li v-for='reply in replies'>
						<Post :postId='reply?.post_id' v-bind='reply'/>
					</li>
				</ol>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import type { PostLike, PostSet } from '@/types/post';
import { onMounted, computed, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/globals';
import translate from '@/localization';
import { khatch, setTitle, createToast } from '@/utilities';
import { demarkdown } from '@/utilities/markdown';
import { apiErrorDescriptionToast, apiErrorMessageToast, isMobile, host } from '@/config/constants';
import ReportButton from '@/components/ReportButton.vue';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Timestamp from '@/components/Timestamp.vue';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Score from '@/components/Score.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Post from '@/components/Post.vue';
import DropDown from '@/components/DropDown.vue';
import ShareLink from '@/components/ShareLink.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';
import SetControls from '@/components/SetControls.vue';

const props = defineProps<{
	postId: string,
}>();
const globals = store();
const route = useRoute();
const router = useRouter();
const unpublishedPrivacy: Set<string | undefined> = new Set(["unpublished", "draft"]);
const post: Ref<PostLike | undefined> = ref();
const writeComment: Ref<boolean> = ref(false);
const replies: Ref<PostLike[] | null | void> = ref(null);
const newComment: Ref<string | null> = ref(null);
const width: Ref<number | undefined> = ref();
const height: Ref<number | undefined> = ref();
const sets: Ref<PostSet[] | null> = ref(null);
const commentSort: Ref<string> = ref("best");
const scalar: Ref<boolean | undefined> = ref();
const media = ref<HTMLDivElement | null>(null);
const scroller = ref<HTMLDivElement | null>(null);
const tab: Ref<string> = ref("info");
const tabs: Set<string> = new Set(["info", "replies"]);

let tabElement: HTMLElement | null = null;
if (isMobile && route.query?.tab && tabs.has(route.query.tab.toString())) {
	tab.value = route.query.tab.toString();
}

khatch(`${host}/v1/sets/post/${props.postId}`, {
	errorMessage: "Could not retrieve post sets!",
}).then(r => r.json())
.then(r => sets.value = r);

onMounted(setLeft);
onMounted(scrollIntoView);

if (globals.postCache?.post_id === props.postId) {
	post.value = globals.postCache;

	post.value.favorites = 0;
	post.value.reposts = 0;
	width.value = post.value?.media?.size?.width;
	height.value = post.value?.media?.size?.height;
}
if (isMobile) {
	onMounted(() => {
		tabElement = document.getElementById(tab.value);
		((tabElement as HTMLElement).lastChild as HTMLDivElement).style.borderBottomWidth = "5px";
	});
}

khatch(`${host}/v1/post/${props.postId}`, {
	errorMessage: "Could not retrieve post!",
}).then(r => r.json())
.then((r: PostLike) => {
	r.favorites = 0;
	r.reposts = 0;
	post.value = r;
	width.value = r.media?.size?.width;
	height.value = r.media?.size?.height;
	replies.value = r.replies;

	scrollIntoView();
	setPageTitle();
	setLeft();
});

const isLoading = computed(() => !post.value);
const isUpdated = computed(() => post.value?.created !== post.value?.updated);
const mediaUrl = computed(() => post.value?.media?.url);
const showPrivacy = computed(() => post.value?.privacy && post.value.privacy.toLowerCase() !== "public");
const userIsUploader = computed(() => globals.user && post.value?.user?.handle === globals.user?.handle);
const countComments = computed(() => {
	if (!replies.value) return null;

	let count = replies.value.length;
	replies.value.forEach(reply => {
		count += countNestedComments(reply);
	});

	return count;
});

function setPageTitle() {
	demarkdown(post.value?.title || props.postId)
	.then(title => {
		if (post.value?.tags?.artist) {
			const artists = post.value.tags.artist.map(x => x.tag.endsWith("_(artist)") ? x.tag.slice(0, -9).replaceAll("_", " ") : x.tag.replaceAll("_", " "));

			if (artists.length > 2) {
				title += " by " + artists.slice(0, -1).join(", ") + ", and " + artists.slice(-1)[0];
			}
			else if (artists.length === 2) {
				title += " by " + artists[0] + " and " + artists[1];
			}
			else {
				title += " by " + artists[0];
			}
		}

		if (post.value?.tags?.subject) {
			const subjects = post.value.tags.subject.map(x => x.tag.endsWith("_(subject)") ? x.tag.slice(0, -10).replaceAll("_", " ") : x.tag.replaceAll("_", " "));

			if (subjects.length > 2) {
				title += " featuring " + subjects.slice(0, -1).join(", ") + ", and " + subjects.slice(-1)[0];
			}
			else if (subjects.length === 2) {
				title += " featuring " + subjects[0] + " and " + subjects[1];
			}
			else {
				title += " featuring " + subjects[0];
			}
		}

		setTitle(title);
	});
}

function followUser() {
	khatch(`${host}/v1/user/${post.value?.user.handle}/follow`, {
		method: post.value?.user.following ? "DELETE" : "PUT",
		errorHandlers: {
			400: () => {
				if (!post.value) return;
				post.value.user.following = !post.value?.user.following;
			},
		},
	}).then(response => {
		if (!post.value) return;

		if (response.status < 300) {
			post.value.user.following = !post.value?.user.following;
			createToast({
				icon: post.value.user.following ? "person_add_alt" : "person_remove",
				title: `Successfully ${post.value.user.following ? "Followed" : "Unfollowed"} @${post.value.user.handle}`,
				time: 5,
			});
		}
		else if (response.status < 500) {
			response.json().then(r => {
				createToast({
					title: apiErrorMessageToast,
					description: r.error,
				});
			});
		}
		else {
			response.json().then(r => {
				createToast({
					title: apiErrorMessageToast,
					description: apiErrorDescriptionToast,
					dump: r,
				});
			});
		}
	})
}

function fetchComments() {
	replies.value = null;
	khatch(`${host}/v1/post/comments`, {
		handleError: true,
			method: "POST",
			body: {
				post_id: props.postId,
				sort: commentSort.value,
			},
	}).then(r => r.json())
	.then(r => replies.value = r);
}

function postComment() {
	if (!newComment.value || !newComment.value.trim()) return;

	khatch(`${host}/v1/post`, {
		method: "PUT",
		body: {
			field_mask: ["reply_to", "description", "rating", "privacy"],
			reply_to: props.postId,
			description: newComment.value.trim(),
			rating: "general",
			privacy: "public",
		},
	})
	.then(r => r.json())
	.then(response => {
		if (!replies.value) replies.value = [];

		replies.value.unshift({
			...response,
			replies: [],
		});
		newComment.value = null;
		writeComment.value = false;
	})
	.catch(error => {
		console.error(error);
		createToast({
			title: apiErrorMessageToast,
			description: error,
		});
	});
}

function openEditor() {
	if (!post.value) return;

	let path = "/create?reply_to=" + post.value.post_id;
	if (newComment.value) {
		path += "&description=" + encodeURIComponent(newComment.value);
	}

	globals.postCache = post.value;
	router.push(path);
}

function countNestedComments(p: PostLike) {
	if (!p.replies) return 0;

	let count = p.replies.length;
	p.replies.forEach(reply => {
		count += countNestedComments(reply);
	});
	return count;
}

function setLeft() {
	if (isMobile || !media.value) return;
	if (scalar.value) {
		media.value.style.left = `calc(max(10vw, 50% - ${(window.innerHeight - 90) * ((width.value ?? 1) / (height.value ?? 1)) / 2}px) - 10vw)`;
	}
	else {
		media.value.style.left = `calc(max(10vw, 50% - ${(width.value ?? 1) / 2}px) - 10vw)`;
	}
}

let _parents: PostLike[] | null = null;
function parents(): PostLike[] {
	if (!post.value) return [];
	if (_parents) return _parents;
	_parents = [];
	let p: PostLike = post.value;

	while (p.parent) {
		_parents.unshift(p.parent);
		p = p.parent;
	}

	return _parents;
}

function scrollIntoView() {
	setTimeout(() => scroller.value?.scrollIntoView(), 0);
}

function selectTab(event: Event) {
	tab.value = (event.target as HTMLDivElement).id;

	if (tabElement) (tabElement.lastChild as HTMLDivElement).style.borderBottomWidth = "0";
	tabElement = (event.target as HTMLDivElement);
	((tabElement as HTMLElement).lastChild as HTMLDivElement).style.borderBottomWidth = "5px";

	router.replace(route.path + `?tab=${tab.value}`);
}

watch(commentSort, fetchComments);
watch(scroller, scrollIntoView);
watch(scalar, setLeft);
watch(width, setLeft);
watch(media, setLeft);
</script>
<style scoped>
.container {
	display: grid;
	grid-template-columns: [sidebar-start] max(20vw, 300px) [sidebar-end main-start] auto [main-end];
	grid-template-rows: [sidebar-start main-start] auto [sidebar-end main-end];
	position: relative;
}
main {
	background: var(--main);
	border-radius: var(--border-radius) 0 0 3px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
	padding: var(--margin);
}
.mobile main {
	border: unset;
	border-radius: 0;
}
.scroller {
	position: absolute;
	pointer-events: none;
	top: calc(-2.5rem - var(--margin));
}
.mobile .scroller {
	top: calc(-4rem - var(--margin));
}
.media-container {
	grid-area: media;
	margin: 0 auto var(--margin) 0;
	position: relative;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
	max-width: calc(100% - var(--margin));
}
.mobile .media-container {
	margin: 0 auto var(--margin);
	max-width: 100%;
}
.media img, .media video {
	max-width: 100%;
	display: table-cell;
}
.mobile .media {
	max-width: 100%;
	margin: 0 auto var(--margin);
}
.media .loading p {
	display: table-cell;
}

html.solarized-dark .media, html.solarized-light .media, html.midnight .media {
	--bg2color: var(--bg1color);
}
.sidebar {
	grid-area: sidebar;
	position: relative;
	margin: 0;
}

.mobile {
	/* position: relative;
	margin: 0 var(--neg-margin) var(--margin);
	display: flex;
	flex-direction: column;
	align-items: center; */

	.sidebar {
		margin: var(--margin) 0;
	}
	.active-tab {
		background: var(--bg2color);
	}
	.tabs {
		display: flex;
		border-bottom: var(--border-size) solid var(--bordercolor);
		width: 100%;
		background: var(--bg2color);
		justify-content: center;
	}
	.tabs button {
		position: relative;
		flex: 1;
		padding: 1em 0;
	}
	.tabs .separator {
		background: var(--bordercolor);
		width: var(--border-size);
	}
	.tabs .border {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		-webkit-transition: var(--transition) var(--fadetime);
		-moz-transition: var(--transition) var(--fadetime);
		-o-transition: var(--transition) var(--fadetime);
		transition: var(--transition) var(--fadetime);
		border-bottom: solid 0 var(--interact);
	}
}

.privacy {
	display: flex;
	position: absolute;
	right: var(--margin);
	align-items: center;
}
.content {
	grid-area: main;
	display: flex;
	flex-direction: column;
	position: relative;
}
.description {
	font-size: 1.3em;
	margin: 0 0 var(--margin);
}
.profile {
	margin: -0.25em;
	margin-top: 0;
}
a.profile:hover {
	background: var(--bg2color);
}
.post-header {
	display: flex;
	margin-bottom: var(--margin);
}
.post-title {
	display: flex;
	flex-flow: column;
	align-items: flex-start;
}
.post-title h2 {
	font-size: 2em;
	font-weight: normal;
	margin: 0;
}
.mobile .post-title h2 {
	font-size: 1.5em;
}
.edit-button {
	margin-left: 0.5em;
	padding: 0.25em;
}
.edit-button i {
	display: block;
}
.score {
	margin: -0.5em 0.5em 0 -0.5em;
}
form {
	width: 100%;
}
textarea {
	width: 100%;
	height: 30em;
	resize: vertical;
}
.update-button {
	display: flex;
	justify-content: flex-end;
}
.update-button button, .update-button a {
	margin-right: var(--margin);
}
.update-button > :last-child {
	margin: 0;
}
input {
	display: block;
}
.title-field {
	font-size: 1em;
}

ol {
	list-style: none;
	display: block;
	position: relative;
}
ol.replies li, ol.parents li {
	margin-bottom: var(--margin);
	position: relative;
}
ol > :last-child, ol > :last-child .post {
	margin: 0;
}

.parents {
	margin: 0 var(--margin) var(--margin);
	padding: 0;
}
ol:empty {
	display: none;
}
ol > :first-child .guide-line {
	display: none;
}
.guide-line {
	position: absolute;
	height: var(--margin);
	margin-left: var(--margin);
	border-left: 2px solid var(--bordercolor);
	bottom: 100%;
}

.replies {
	padding: 0 var(--margin) 0 0;
	margin: 0 0 calc(var(--margin) - 4px);
}
.reply-section:has(> .replies:empty) > .reply-header > .reply-field {
	align-items: flex-start;
	& .buttons {
		margin: 0;
	}
}
.reply-header {
	margin-top: var(--margin);
	padding-right: var(--margin);
}
.mobile .replies {
	padding: 0 var(--margin);
}
.reply-field {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}
.reply-field .buttons {
	display: flex;
	justify-content: flex-end;
	margin-bottom: var(--margin);
}
.reply-field .buttons .button {
	margin-right: var(--margin);
}
.reply-field .buttons > :last-child {
	margin-right: 0;
}
.reply-label {
	margin: 0 0 0.25em var(--margin);
}
.reply-label, .reply-label button {
	margin-left: var(--margin);
	display: flex;
	align-items: center;
}
.reply-label button {
	margin-left: var(--margin);
	color: var(--subtle);
}
.reply-label button:hover {
	color: var(--interact);
}
.report:hover {
	background: var(--bg2color) !important;
}


.parent {
	margin-bottom: var(--margin);
	padding: 1em var(--margin);
	background: var(--main);
}

.post-buttons {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: -0.5em;
}
.more-button {
	border-radius: var(--border-radius);
	padding: 0.25em;
	color: var(--subtle);
	background: #00000000;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.more-button:hover {
	color: var(--interact);
	background: var(--bg2color);
}
.more-button {
	display: block;
	font-size: 1.5em;
}

.sort-dropdown {
	margin-left: 2em;
}
.sort-by {
	display: flex;
	align-items: center;
	color: var(--subtle);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.sort-by i {
	margin-right: 0.25em;
}
.sort-by:hover {
	color: var(--interact);
}

/* theme overrides */
html.e621 main {
	margin-left: 0;
}
html.wikipedia main {
	border-left: var(--border-size) solid #A7D7F9;
}
html.midnight .post-buttons button:hover, html.midnight .post-buttons .dropdown i:hover {
	background: #000000;
}
</style>
