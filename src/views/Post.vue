<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<div v-if='parent' class='parent'>
		<Post :postId='parent?.post_id' v-bind='parent' nested labels/>
	</div>
	<div class='container' v-if='!isMobile'>
		<Sidebar :tags='tags' :post='post' v-model:scalar='scalar' class='sidebar'/>
		<div class='content'>
			<div ref='media' class='media-container' v-show='post'>
				<Media class='media' v-if='post?.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' :thumbhash='post?.thumbhash' v-model:width='width' v-model:height='height' v-model:scaleHeight='scalar' bg/>
				<div class='set-controls' v-for='set in sets'>
					<p>
						<a class='disabled'><i class='material-icons'>first_page</i></a>
						<router-link v-for='(p, index) in set.neighbors.before' :to='`/p/${p.post_id}`' :title='p.title || `page ${set.neighbors.index - index - 1}`'><span v-if='index'>{{ set.neighbors.index - index - 1 }}</span><i class='material-icons' v-else>navigate_before</i></router-link>
					</p>
					<router-link :to='`/s/${set.set_id}`' :title='`${set.title} post ${set.neighbors.index} of ${set.count}`'>{{set.title}}</router-link>
					<p>
						<router-link v-for='(p, index) in set.neighbors.after' :to='`/p/${p.post_id}`' :title='p.title || `page ${set.neighbors.index + index + 1}`'><span v-if='index'>{{ set.neighbors.index + index + 1 }}</span><i class='material-icons' v-else>navigate_next</i></router-link>
						<a class='disabled'><i class='material-icons'>last_page</i></a>
					</p>
				</div>
			</div>
			<main>
				<div class='post-header'>
					<Score :score='post?.score' :postId='props.postId'/>
					<div class='post-title'>
						<input v-if='editing && post' class='interactable text title-field' v-model='post.title'>
						<h2 v-else>
							<Loading span v-if='isLoading'>this is an example title</Loading>
							<Markdown v-else :content='post?.title' inline/>
						</h2>
						<div class='privacy'>
							<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
							<router-link v-if='userIsUploader' :to='"/create?post=" + props.postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button></router-link>
						</div>
						<Profile :isLoading='isLoading' v-bind='post?.user'/>
					</div>
				</div>
				<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
				<div v-else-if='editing && post' style='width: 100%'>
					<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: var(--margin)'/>
					<div class='update-button'>
						<Button :href='`/create?post=${props.postId}`'><i class='material-icons-round'>launch</i><span>Full Editor</span></Button>
						<Button @click='updatePost' green><i class='material-icons-round'>check</i><span>Update</span></Button>
						<Button @click='deletePost' red><i class='material-icons-round'>close</i><span>Delete</span></Button>
					</div>
				</div>
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
					<DropDown :options="[
						{ html: `${post?.user.following ? 'Unfollow' : 'Follow'} @${post?.user?.handle}`, action: followUser },
						{ html: `Block @${post?.user?.handle}`, action: () => { } },
						{ html: `Report @${post?.user?.handle}`, action: () => { } },
					]">
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
							<Button class='interactable' style='margin-right: var(--margin)' @click='postComment' green><i class='material-icons-round'>create</i><span>Post</span></Button>
							<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i><span>Cancel</span></Button>
						</div>
						<Button class='buttons' @click='globals.user ? writeComment = true : $router.push(`/a/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
					</div>
				</div>
				<ol class='replies'>
					<li v-for='reply in replies'>
						<Post :postId='reply?.post_id' v-bind='reply' reply/>
					</li>
				</ol>
			</div>
		</div>
	</div>
	<div class='content' v-else>
		<div class='media-container' v-show='post'>
			<Media v-if='post?.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' v-model:width='width' v-model:height='height' bg/>
			<div class='set-controls' v-for='set in sets'>
				<a class='disabled'><i class='material-icons'>first_page</i></a>
				<router-link v-for='(p, index) in set.neighbors.before' :to='`/p/${p.post_id}`'><span v-if='index'>{{ set.neighbors.index - index - 1 }}</span><i class='material-icons' v-else>navigate_before</i></router-link>
				<router-link :to='`/s/${set.set_id}`'>{{set.title}}</router-link>
				<router-link v-for='(p, index) in set.neighbors.after' :to='`/p/${p.post_id}`'><span v-if='index'>{{ set.neighbors.index + index + 1 }}</span><i class='material-icons' v-else>navigate_next</i></router-link>
				<a class='disabled'><i class='material-icons'>last_page</i></a>
			</div>
		</div>
		<div class='container'>
			<Sidebar :tags='tags' :post='post' :scalar='scalar' class='sidebar'/>
			<div class='main'>
				<main>
					<div class='post-header'>
						<Score :score='post?.score' :postId='props.postId'/>
						<div class='post-title'>
							<input v-if='editing && post' class='interactable text title-field' v-model='post.title'>
							<h2 v-else>
								<Loading span v-if='isLoading'>this is an example title</Loading>
								<Markdown v-else :content='post?.title' inline/>
							</h2>
							<div class='privacy'>
								<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
								<router-link v-if='userIsUploader' :to='"/create?post=" + props.postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button></router-link>
							</div>
							<Profile :isLoading='isLoading' v-bind='post?.user'/>
						</div>
					</div>
					<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
					<div v-else-if='editing && post' style='width: 100%'>
						<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: var(--margin)'/>
						<div class='update-button'>
							<Button :href='`/create?post=${props.postId}`'><i class='material-icons-round'>launch</i><span>Full Editor</span></Button>
							<Button @click='updatePost' green><i class='material-icons-round'>check</i><span>Update</span></Button>
							<Button @click='deletePost' red><i class='material-icons-round'>close</i><span>Delete</span></Button>
						</div>
					</div>
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
						<DropDown :options="[
							{ html: `${post?.user.following ? 'Unfollow' : 'Follow'} @${post?.user?.handle}`, action: followUser },
							{ html: `Block @${post?.user?.handle}`, action: () => { } },
							{ html: `Report @${post?.user?.handle}`, action: () => { } },
						]">
							<i class='more-button material-icons-round'>more_horiz</i>
						</DropDown>
					</div>
					<ThemeMenu/>
				</main>
			</div>
		</div>
		<div class='reply-section'>
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
						<Button class='interactable' style='margin-right: var(--margin)' @click='postComment' green><i class='material-icons-round'>create</i><span>Post</span></Button>
						<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i><span>Cancel</span></Button>
					</div>
					<Button class='interactable buttons' @click='globals.user ? writeComment = true : $router.push(`/a/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
				</div>
			</div>
		</div>
		<ol class='replies'>
			<li v-for='reply in replies'>
				<Post :postId='reply?.post_id' v-bind='reply' reply/>
			</li>
		</ol>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue';
import store from '@/globals';
import { khatch, getMediaUrl, setTitle, createToast } from '@/utilities';
import { demarkdown } from '@/utilities/markdown';
import { apiErrorMessage, apiErrorDescriptionToast, apiErrorMessageToast, isMobile, host } from '@/config/constants';
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

const props = defineProps<{
	postId: string,
}>();

const globals = store();
const unpublishedPrivacy: Set<string | undefined> = new Set(["unpublished", "draft"]);

let editing: boolean = false;  // this is currently unused, if it becomes used, update it to a ref
const post: Ref<Post | undefined> = ref(undefined);
const tags: Ref<Tags | undefined> = ref(undefined);
const writeComment: Ref<boolean> = ref(false);
const replies: Ref<Post[] | null> = ref(null);
const newComment: Ref<string | null> = ref(null);
const parent: Ref<Post | undefined | null> = ref(undefined);
const width: Ref<number | undefined> = ref(undefined);
const height: Ref<number | undefined> = ref(undefined);
const sets: Ref<PostSet[] | null> = ref(null);
const commentSort: Ref<string> = ref("best");
const scalar: Ref<boolean | undefined> = ref(undefined);
const media = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

khatch(`${host}/v1/tags/${props.postId}`, {
	errorMessage: "Could not retrieve post tags!",
}).then(response => response.json())
.then(response => {
	tags.value = response;
	if (post.value) setPageTitle();
});

khatch(`${host}/v1/sets/post/${props.postId}`, {
	errorMessage: "Could not retrieve post sets!",
}).then(response => response.json())
.then(response => {
	sets.value = response;
});

fetchComments();

if (globals.postCache?.post_id === props.postId) {
	post.value = globals.postCache;

	post.value.favorites = 0;
	post.value.reposts = 0;
	width.value = post.value.size?.width;
	height.value = post.value.size?.height;
	if (post.value.parent) {
		parent.value = null;
		fetchParent(post.value.parent);
	}
	setLeft(scalar.value);
}
else {
	// NOTE: we may actually want to do this anyway, just to make sure the post is up to date
	khatch(`${host}/v1/post/${props.postId}`, {
		errorMessage: "Could not retrieve post!",
	}).then(response => response.json())
	.then(r => {
		r.favorites = 0;
		r.reposts = 0;
		post.value = r;
		width.value = r.size?.width;
		height.value = r.size?.height;
		if (r.parent) {
			parent.value = null;
			fetchParent(r.parent);
		}

		if (tags.value) setPageTitle();
		setLeft(scalar.value);
	});
}

const isLoading = computed(() => !post.value);
const isUpdated = computed(() => post.value ? post.value.created !== post.value.updated : false);
const mediaUrl = computed(() => post.value && post.value.filename ? getMediaUrl(post.value.post_id, post.value.filename) : "");
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
		if (tags.value?.artist) {
			const artists = tags.value.artist.map(x => x.endsWith("_(artist)") ? x.slice(0, -9).replaceAll("_", " ") : x.replaceAll("_", " "));

			if (artists.length > 2)
			{ title += " by " + artists.slice(0, -1).join(", ") + ", and " + artists.slice(-1)[0]; }
			else if (artists.length === 2)
			{ title += " by " + artists[0] + " and " + artists[1]; }
			else
			{ title += " by " + artists[0]; }
		}

		if (tags.value?.subject) {
			const subjects = tags.value.subject.map(x => x.endsWith("_(subject)") ? x.slice(0, -10).replaceAll("_", " ") : x.replaceAll("_", " "));

			if (subjects.length > 2)
			{ title += " featuring " + subjects.slice(0, -1).join(", ") + ", and " + subjects.slice(-1)[0]; }
			else if (subjects.length === 2)
			{ title += " featuring " + subjects[0] + " and " + subjects[1]; }
			else
			{ title += " featuring " + subjects[0]; }
		}

		setTitle(title);
	});
}

function followUser() {
	khatch(`${host}/v1/user/${post.value?.user.handle}/follow`, {
		method: post.value?.user.following ? "DELETE" : "PUT",
	})
	.then(response => {
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
			method: "POST",
			body: {
				post_id: props.postId,
				sort: commentSort.value,
			},
		})
		.then(response => {
			response.json().then(r => {
				if (response.status < 300) {
					fetchNestedComments(r)
					.then(() => replies.value = r);
				}
				else if (response.status < 500) {
					createToast({
						title: apiErrorMessageToast,
						description: r.error,
					});
				}
				else {
					createToast({
						title: apiErrorMessageToast,
						description: apiErrorDescriptionToast,
						dump: r,
					});
				}
			});
		})
		.catch(error => {
			console.error(error);
			createToast({
				title: apiErrorMessageToast,
				description: error,
			});
		});
}

function fetchNestedComments(replies: Post[]) {
	let i = 0;
	return new Promise<void>(resolve => {
		if (replies.length === 0)
		{ resolve(); }

		replies.forEach(reply => {
			khatch(`${host}/v1/post/comments`, {
				method: "POST",
				body: {
					post_id: reply.post_id,
					sort: commentSort.value,
				},
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300) {
						fetchNestedComments(r)
							.then(() => {
								i++;
								reply.replies = r;
								if (i >= replies.length)
								{ resolve(); }
							});
					}
					else if (response.status < 500) {
						createToast({
							title: apiErrorMessageToast,
							description: r.error,
						});
					}
					else {
						createToast({
							title: apiErrorMessageToast,
							description: apiErrorDescriptionToast,
							dump: r,
						});
					}
				});
			})
		});
	});
}

function fetchParent(postId: string) {
	khatch(`${host}/v1/post/${postId}`)
	.then(response => {
		response.json().then(r => {
			if (response.status < 300) {
				r.postId = postId;
				parent.value = r;
			}
			else if (response.status < 500) {
				createToast({
					title: apiErrorMessageToast,
					description: r.error,
				});
			}
			else {
				createToast({
					title: apiErrorMessageToast,
					description: apiErrorDescriptionToast,
					dump: r,
				});
			}
		});
	})
	.catch(error => {
		console.error(error);
		createToast({
			title: apiErrorMessageToast,
			description: error,
		});
	});
}

function postComment() {
	if (!newComment.value || !newComment.value.trim()) return;

	khatch(`${host}/v1/upload/post`, {
		method: "PUT",
		body: {
			reply_to: props.postId,
			description: newComment.value.trim(),
			rating: "general",
			privacy: "public",
		},
	})
	.then(response => response.json())
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

function countNestedComments(p: Post) {
	if (!p.replies) return 0;

	let count = p.replies.length;
	p.replies.forEach(reply => {
		count += countNestedComments(reply);
	});
	return count;
}

function editToggle() {
	editing = !editing;
}

function updatePost() {
	if (!post.value) return;
	khatch(`${host}/v1/upload/post`, {
		method: "PATCH",
		body: {
			post_id: props.postId,
			title: post.value.title?.trim(),
			description: post.value.description?.trim(),
		},
	})
	.then(response => response.json())
	.then(r => console.log(r))
	.catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
	});

	post.value.title = post.value.title?.trim() ?? null;
	post.value.description = post.value.description?.trim() ?? null;
	post.value.updated = new Date();
	editing = false;
}

function deletePost() {
	createToast({
		title: "This function does not exist yet",
		description: "Sorry!",
		icon: "close",
	});
	editing = false;
}

function setLeft(scalar?: boolean) {
	if (isMobile || !media.value) return;
	console.debug("(Post) scalar:", scalar);

	if (scalar) {
		media.value.style.left = `calc(max(10vw, 50% - ${(window.innerHeight - 90) * ((width.value ?? 1) / (height.value ?? 1)) / 2}px) - 10vw)`;
	}
	else {
		media.value.style.left = `calc(max(10vw, 50% - ${(width.value ?? 1) / 2}px) - 10vw)`;
	}
}

watch(commentSort, fetchComments);
watch(scalar, setLeft);
</script>

<style scoped>
.container {
	display: grid;
	grid-template-columns: [sidebar-start] max(20vw, 300px) [sidebar-end main-start] auto [main-end];
	grid-template-rows: [sidebar-start main-start] auto [sidebar-end main-end];
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
.set-controls {
	margin: var(--margin) var(--margin) 0	;
	display: flex;
	justify-content: space-between;
}
.mobile .set-controls {
	margin: 0 var(--margin) var(--margin);
}
.set-controls p {
	display: flex;
	align-items: center;
}
.set-controls p a {
	margin: 0 var(--half-margin);
}
.set-controls p a i {
	display: block;
}
.set-controls p > :last-child {
	margin-right: 0;
}
.set-controls p > :first-child {
	margin-left: 0;
}
.disabled {
	opacity: 50%;
	pointer-events: none;
}

html.solarized-dark .media, html.solarized-light .media, html.midnight .media {
	--bg2color: var(--bg1color);
}
.sidebar {
	grid-area: sidebar;
	position: relative;
	margin: 0;
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
	padding: 0 var(--margin) 0 0;
	margin: 0 0 calc(var(--margin) - 4px);
	display: block;
	position: relative;
}
ol li {
	margin-bottom: var(--margin);
}
ol > :last-child, ol > :last-child .post {
	margin: 0;
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