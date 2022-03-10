<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<div v-if='parent' class='parent'>
		<router-link :to='`/p/${parent.postId}`' class='inner'>
			<div class='parent-thumbnail'>
				<Thumbnail :post='post.parent' v-show='parent?.media_type' :width='parent?.size?.width' :height='parent?.size?.height'/>
			</div>
			<div class='parent-contents'>
				<p class='parent-title'>Parent Post</p>
				<h3 v-show='parent.title'>
					<Markdown :content='parent?.title || post.parent' inline/>
				</h3>
				<Markdown class='parent-description' :content='parent?.description' concise v-show='parent?.description'/>
			</div>
		</router-link>
	</div>
	<div class='container' v-if='!isMobile'>
		<Sidebar :tags='tags' :rating='post?.rating' class='sidebar' :style='sidebarStyle'/>
		<div class='content'>
			<div class='media-container' :style='`left: calc(max(10vw, 50% - ${width / 2}px) - 10vw);`' v-show='post'>
				<Media class='media' v-show='post?.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' v-model:width='width' v-model:height='height'/>
				<div class='set-controls' v-for='set in post?.sets || [{ title: "sample set", id: "hd2Ylh" }]'>
					<p>
						<a><i class='material-icons'>first_page</i></a>
						<a><i class='material-icons'>navigate_before</i></a>
						<a>1</a>
						<a>2</a>
						<a>3</a>
					</p>
					<a :href='`/s/${set.id}`'>{{set.title}}</a>
					<p>
						<a>5</a>
						<a>6</a>
						<a>7</a>
						<a><i class='material-icons'>navigate_next</i></a>
						<a><i class='material-icons'>last_page</i></a>
					</p>
				</div>
			</div>
			<main>
				<div class='post-header'>
					<Score :score='post?.score' :postId='postId'/>
					<div class='post-title'>
						<input v-if='editing' class='interactable text title-field' v-model='post.title'>
						<h2 v-else>
							<Loading span v-if='isLoading'>this is an example title</Loading>
							<Markdown v-else :content='post?.title' inline/>
						</h2>
						<div class='privacy'>
							<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
							<Button class='edit-button' v-if='userIsUploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
						</div>
						<Profile :isLoading='isLoading' v-bind='post?.user'/>
					</div>
				</div>
				<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
				<div v-else-if='editing' style='width: 100%'>
					<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: 25px'/>
					<div class='update-button'>
						<Button :href='`/create?post=${postId}`'><i class='material-icons-round'>launch</i>Full Editor</Button>
						<Button @click='updatePost' green><i class='material-icons-round'>check</i>Update</Button>
						<Button @click='deletePost' red><i class='material-icons-round'>close</i>Delete</Button>
					</div>
				</div>
				<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 25px'/>
				<Loading :isLoading='isLoading'>
					<Subtitle static='left' v-if='post?.privacy === "unpublished"'>unpublished</Subtitle>
					<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' live/> (edited <Timestamp :datetime='post?.updated' live/>)</Subtitle>
					<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' live/></Subtitle>
				</Loading>
				<div class='post-buttons' v-show='!isLoading'>
					<Report :data='{ post: postId }' v-if='!isLoading'/>
					<RepostButton :postId='postId'/>
					<FavoriteButton :postId='postId'/>
					<ShareLink :content='`https://${environment === "prod" ? "kheina.com" : "dev.kheina.com"}/p/${postId}`' v-if='post?.privacy !== "unpublished"'/>
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
			<ol class='replies'>
				<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: 25px' v-if='writeComment'/>
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
						<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
						<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i>Cancel</Button>
					</div>
					<Button class='interactable buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i>Reply</Button>
				</div>
				<li v-for='reply in replies'>
					<Reply :postId='reply?.post_id' v-bind='reply' reply/>
				</li>
			</ol>
		</div>
	</div>
	<div class='content' v-else>
		<div class='media-container' v-show='post'>
			<Media v-show='post?.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' v-model:width='width' v-model:height='height'/>
			<div class='set-controls' v-for='set in post?.sets || [{ title: "sample set", id: "hd2Ylh" }]'>
				<a><i class='material-icons'>first_page</i></a>
				<a><i class='material-icons'>navigate_before</i></a>
				<a>1</a>
				<a>2</a>
				<a>3</a>
				<a :href='`/s/${set.id}`'>{{set.title}}</a>
				<a>5</a>
				<a>6</a>
				<a>7</a>
				<a><i class='material-icons'>navigate_next</i></a>
				<a><i class='material-icons'>last_page</i></a>
			</div>
		</div>
		<div class='container'>
			<Sidebar :tags='tags' :rating='post?.rating' class='sidebar' :style='sidebarStyle'/>
			<div class='main'>
				<main>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId'/>
						<div class='post-title'>
							<input v-if='editing' class='interactable text title-field' v-model='post.title'>
							<h2 v-else>
								<Loading span v-if='isLoading'>this is an example title</Loading>
								<Markdown v-else :content='post?.title' inline/>
							</h2>
							<div class='privacy'>
								<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
								<Button class='edit-button' v-if='userIsUploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
							</div>
							<Profile :isLoading='isLoading' v-bind='post?.user'/>
						</div>
					</div>
					<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
					<div v-else-if='editing' style='width: 100%'>
						<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: 25px'/>
						<div class='update-button'>
							<Button :href='`/create?post=${postId}`'><i class='material-icons-round'>launch</i>Full Editor</Button>
							<Button @click='updatePost' green><i class='material-icons-round'>check</i>Update</Button>
							<Button @click='deletePost' red><i class='material-icons-round'>close</i>Delete</Button>
						</div>
					</div>
					<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 25px'/>
					<Loading :isLoading='isLoading'>
						<Subtitle static='left' v-if='post?.privacy === `unpublished`'>unpublished</Subtitle>
						<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' :live='true'/> (edited <Timestamp :datetime='post?.updated' :live='true'/>)</Subtitle>
						<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' :live='true'/></Subtitle>
					</Loading>
					<div class='post-buttons' v-show='!isLoading'>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
						<RepostButton :postId='postId'/>
						<FavoriteButton :postId='postId'/>
						<ShareLink :content='`https://${environment === "prod" ? "kheina.com" : "dev.kheina.com"}/p/${postId}`' v-if='post?.privacy !== "unpublished"'/>
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
		<ol class='replies'>
			<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: 25px' v-if='writeComment'/>
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
					<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
					<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i>Cancel</Button>
				</div>
				<Button class='interactable buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i>Reply</Button>
			</div>
			<li v-for='reply in replies'>
				<Reply :postId='reply?.post_id' v-bind='reply' reply/>
			</li>
		</ol>
	</div>
</template>

<script>
import { demarkdown, khatch, getMediaUrl, isMobile, setTitle } from '@/utilities';
import { apiErrorMessage, apiErrorDescriptionToast, apiErrorMessageToast, environment, postsHost, tagsHost, uploadHost, usersHost } from '@/config/constants';
import Report from '@/components/Report.vue';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
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
import Thumbnail from '@/components/Thumbnail.vue';
import DropDown from '@/components/DropDown.vue';
import ShareLink from '@/components/ShareLink.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';

export default {
	name: 'Post',
	props: {
		postId: {
			type: String,
			default: null,
		},
	},
	components: {
		Report,
		Reply: Post,
		Timestamp,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Media,
		Markdown,
		Profile,
		Score,
		MarkdownEditor,
		Button,
		Thumbnail,
		DropDown,
		ShareLink,
		FavoriteButton,
		RepostButton,
	},
	data() {
		return {
			isMobile,
			environment,
			editing: false,
			post: null,
			tags: null,
			sidebarStyle: null,
			writeComment: null,
			replies: null,
			newComment: null,
			parent: null,
			width: null,
			height: null,
			commentSort: 'best',
		};
	},
	created() {
		khatch(`${tagsHost}/v1/fetch_tags/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.tags = r; }
					else if (response.status === 400)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 401)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 404)
					{ this.$store.commit('error', r.error); }
					else
					{ this.$store.commit('error', apiErrorMessage, r); }

					if (this.post !== null)
					{ this.setPageTitle(); }
				});
			})
			.catch(error => {
				this.$store.commit('error', apiErrorMessage, error);
				console.error(error);
			});

		this.fetchComments();

		khatch(`${postsHost}/v1/post/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.post = r;
						this.width = r.size?.width;
						this.height = r.size?.height;
						if (r.parent)
						{
							this.parent = false;
							this.fetchParent(r.parent);
						}
						if (this.$store.state.scroll)
						{ setTimeout(() => { window.scrollTo(0, this.$store.state.scroll); this.$store.state.scroll = null; }, 0); }

						if (this.tags !== null)
						{ this.setPageTitle(); }
					}
					else if (response.status === 400)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 401)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 404)
					{ this.$store.commit('error', r.error); }
					else
					{ this.$store.commit('error', apiErrorMessage, r); }
				});
			})
			.catch(error => {
				this.$store.commit('error', apiErrorMessage, error);
				console.error(error);
			});
	},
	computed: {
		isLoading()
		{ return this.post === null; },
		isUpdated()
		{ return this.post !== null ? this.post.created !== this.post.updated : false; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		showPrivacy()
		{ return this.post?.privacy && this.post.privacy.toLowerCase() !== 'public'; },
		countComments()
		{
			if (!this.replies)
			{ return null; }

			let count = this.replies.length;
			this.replies.forEach(reply => {
				count += this.countNestedComments(reply);
			});

			return count;
		},
		userIsUploader()
		{ return this.$store.state.user && this.post?.user?.handle === this.$store.state.user?.handle; }
	},
	methods: {
		setPageTitle() {
			let title = `${demarkdown(this.post?.title || this.postId)} by ${demarkdown(this.post.user.name || this.post.user.handle)}`;

			if (this.tags.hasOwnProperty('subject'))
			{
				const subjects = this.tags.subject.map(x => x.endsWith('_(subject)') ? x.slice(0, -10) : x);

				if (subjects.length > 2)
				{ title += ' featuring ' + subjects.slice(0, -1).join(', ') + ', and ' + subjects.slice(-1)[0]; }
				else if (subjects.length === 2)
				{ title += ' featuring ' + subjects[0] + ' and ' + subjects[1]; }
				else
				{ title += ' featuring ' + subjects[0]; }
			}

			setTitle(title);
		},
		followUser() {
			khatch(`${usersHost}/v1/${this.post?.user.following ? 'unfollow_user' : 'follow_user'}`, {
				method: 'POST',
				body: {
					handle: this.post.user.handle,
				},
			})
			.then(response => {
				if (response.status < 300)
				{
					this.post.user.following = !this.post.user.following;
					this.$store.commit('createToast', {
						icon: this.post.user.following ? 'person_add_alt' : 'person_remove',
						title: `Successfully ${this.post.user.following ? 'Followed' : 'Unfollowed'} @${this.post.user.handle}`,
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
		fetchComments() {
			this.replies = null;
			khatch(`${postsHost}/v1/fetch_comments`, {
					method: 'POST',
					body: {
						post_id: this.postId,
						sort: this.commentSort,
					},
				})
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							this.fetchNestedComments(r)
								.then(() => this.replies = r);
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
					});
				})
				.catch(error => {
					console.error(error);
					this.$store.commit('createToast', {
						title: apiErrorMessageToast,
						description: error,
					});
				});
		},
		fetchNestedComments(replies) {
			let i = 0;
			return new Promise(resolve => {
				if (replies.length === 0)
				{ resolve(); }
				replies.forEach(reply => {
					khatch(`${postsHost}/v1/fetch_comments`, {
							method: 'POST',
							body: {
								post_id: reply.post_id,
								sort: this.commentSort,
							},
						})
						.then(response => {
							response.json().then(r => {
								if (response.status < 300)
								{
									this.fetchNestedComments(r)
										.then(() => {
											i++;
											reply.replies = r;
											if (i >= replies.length)
											{ resolve(); }
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
							});
						})
				});
			});
		},
		fetchParent(postId) {
			khatch(`${postsHost}/v1/post/${postId}`)
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							r.postId = postId;
							this.parent = r;
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
					});
				})
				.catch(error => {
					console.error(error);
					this.$store.commit('createToast', {
						title: apiErrorMessageToast,
						description: error,
					});
				});
		},
		postComment() {
			let created = new Date();
			let updated = created;

			khatch(`${uploadHost}/v1/create_post`, {
					method: 'POST',
					body: {
						reply_to: this.postId,
						description: this.newComment.trim(),
						rating: 'general',
						privacy: 'public',
					},
				})
				.then(response => {
					response.json()
						.then(r => {
							console.log(r);
							this.replies.unshift({
								post_id: r.post_id,
								user: this.$store.state.user,
								blocked: false,
								description: this.newComment.trim(),
								rating: 'general',
								score: {
									up: 1,
									down: 0,
								},
								created,
								updated,
								title: null,
								tags: [],
								replies: [],
								media: false,
							});
							this.newComment = null;
							this.writeComment = null;
						});
				})
				.catch(error => {
					console.error(error);
					this.$store.commit('createToast', {
						title: apiErrorMessageToast,
						description: error,
					});
				});
		},
		countNestedComments(post) {
			if (post.replies)
			{
				let count = post.replies.length;
				post.replies.forEach(reply => {
					count += this.countNestedComments(reply);
				});
				return count;
			}
			return 0;
		},
		editToggle() {
			this.editing = !this.editing;
		},
		updatePost() {
			khatch(`${uploadHost}/v1/update_post`, {
					method: 'POST',
					body: {
						post_id: this.postId,
						title: this.post.title?.trim(),
						description: this.post.description?.trim(),
					},
				})
				.then(response => {
					response.json().then(r => {
						console.log(r);
					});
				})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
			this.post.title = this.post.title?.trim();
			this.post.description = this.post.description?.trim();
			this.post.updated = Date.now();
			this.editing = false;
		},
		deletePost() {
			this.$store.commit('createToast', {
				title: 'This function does not exist yet',
				description: 'Sorry!',
				icon: 'close',
			});
			this.editing = false;
		},
	},
	watch: {
		commentSort() {
			this.fetchComments();
		},
	},
}
</script>

<style scoped>
.container {
	display: grid;
	grid-template-columns: [sidebar-start] max(20vw, 300px) [sidebar-end main-start] auto [main-end];
	grid-template-rows: [sidebar-start main-start] auto [sidebar-end main-end];
}
main {
	background: var(--bg1color);
	border-radius: var(--border-radius) 0 0 3px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
	padding: 25px;
}
.media-container {
	grid-area: media;
	margin: 0 auto 25px 0;
	position: relative;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
	max-width: calc(100% - 25px);
}
.mobile .media-container {
	margin: 0 auto 25px;
	max-width: 100%;
}
.media img, .media video {
	max-width: 100%;
	display: table-cell;
}
.mobile .media {
	max-width: 100%;
	margin: 0 auto 25px;
}
.media .loading p {
	display: table-cell;
}
.set-controls {
	margin: 25px 25px 0	;
	display: flex;
	justify-content: space-between;
	display: none;
}
.mobile .set-controls {
	margin: 0 25px 25px;
}
.set-controls p {
	display: flex;
	align-items: center;
}
.set-controls p a {
	margin: 0 12.5px;
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
	right: 25px;
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
	margin: 0 0 25px;
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
	margin-bottom: 25px;
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
	margin-right: 25px;
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
	padding: 0 25px 0 0;
	margin: 25px 0 0;
	display: block;
	position: relative;
}
ol li {
	margin-bottom: 25px;
}
ol > :last-child, ol > :last-child .post {
	margin: 0;
}
ol p {
	margin: 0 0 0.25em 25px;
}
.mobile .replies {
	padding: 0 25px;
}
.reply-field {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}
.reply-field .buttons {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 25px;
}
.reply-label, .reply-label button {
	display: flex;
	align-items: center;
}
.reply-label button {
	margin-left: 25px;
	color: var(--subtle);
}
.reply-label button:hover {
	color: var(--icolor);
}
.report:hover {
	background: var(--bg2color) !important;
}


.parent {
	margin-bottom: 25px;
	padding: 0.25em 25px;
	background: var(--bg1color);
	text-align: center;
}
.parent .thumbnail {
	max-height: 100%;
	width: 100%;
	height: 100%;
}
.parent .inner {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--border-radius);
	background: #0000;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	padding: 0.25em 0.5em 0.25em 0.25em;
	margin: 0.25em 0;
	text-align: left;
}
.parent .inner:hover {
	background: var(--bg2color);
}
.parent .parent-title {
	font-size: 1.2em;
	border-bottom: var(--border-size) solid var(--bordercolor);
	padding-bottom: 0.1em;
}
.parent .inner p {
	font-size: 1.2em;
	padding: 0 0.5em;
}
.parent-thumbnail {
	border-radius: var(--border-radius);
	overflow: hidden;
}
.parent-thumbnail, .parent-thumbnail img {
	margin-right: 0.5em;
	max-width: 5em;
	height: 5em;
}
.parent-contents h3 {
	margin: 0 0 0 0.5em;
}
.parent-contents .parent-description {
	margin-top: 0.75em;
}

.post-buttons {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.post-buttons button {
	color: var(--subtle);
	background: #00000000;
	margin: -0.1em -0.25em -0.25em;
	border-radius: var(--border-radius);
}
.more-button {
	border-radius: var(--border-radius);
	padding: 0.25em;
	color: var(--subtle);
	background: #00000000;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.post-buttons button:hover, .more-button:hover {
	color: var(--icolor);
	background: var(--bg2color);
}
.post-buttons button i, .more-button {
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
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.sort-by i {
	margin-right: 0.25em;
}
.sort-by:hover {
	color: var(--icolor);
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