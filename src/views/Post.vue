<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<Error v-model:dump='errorDump' v-model:message='errorMessage'>
		<div class='container' v-if='!isMobile'>
			<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>
			<div class='content'>
				<Media v-if='isLoading || post.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' :load='onResize' />
				<main>
					<div v-if='parent !== null' class='parent'>
						<p>Parent post</p>
						<Loading :isLoading='!parent.postId'>
							<router-link :to='`/p/${parent.postId}`' class='inner'>
								<div class='parent-thumbnail'>
									<Thumbnail :isLoading='!parent.postId' :post='parent?.postId' />
								</div>
								<p>
									{{parent.title || parent.postId}}
								</p>
							</router-link>
						</Loading>
					</div>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId' />
						<div>
							<input v-if='editing' class='interactable text title-field' v-model='post.title'>
							<Title v-else :isLoading='isLoading' size='2em' static='left'>{{isLoading ? 'this is an example title' : post?.title}}</Title>
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
							<Button @click='updatePost' red><i class='material-icons-round'>close</i>Delete</Button>
						</div>
					</div>
					<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 25px' />
					<Loading :isLoading='isLoading'>
						<Subtitle static='left' v-if='post?.privacy === `unpublished`'>unpublished</Subtitle>
						<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' :live='true'/> (edited <Timestamp :datetime='post?.updated' :live='true'/>)</Subtitle>
						<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' :live='true'/></Subtitle>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
					</Loading>
					<ThemeMenu />
				</main>
				<ol class='comments'>
					<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: 25px' v-if='writeComment'/>
					<div class='comment-field'>
						<p class='comment-label'>{{comments ? countComments : 'Loading'}} Comment{{countComments != 1 ? 's' : ''}} <button><i class='material-icons-round'>sort</i>sort by</button></p>
						<div class='buttons' v-if='writeComment'>
							<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
							<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i>Cancel</Button>
						</div>
						<Button class='interactable buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>comment</i>Comment</Button>
					</div>
					<li v-for='comment in comments'>
						<Comment :postId='comment?.post_id' v-bind='comment' :link='false' comment/>
					</li>
				</ol>
			</div>
		</div>
		<div class='content' v-else>
			<Media v-if='isLoading || post.media_type' :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
			<div class='container'>
				<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>
				<main>
					<div v-if='parent !== null' class='parent'>
						<p>Parent post</p>
						<Loading :isLoading='!parent.postId'>
							<router-link :to='`/p/${parent.postId}`' class='inner'>
								<div class='parent-thumbnail'>
									<Thumbnail :isLoading='!parent.postId' :post='parent?.postId' />
								</div>
								<p>
									{{parent.title || parent.postId}}
								</p>
							</router-link>
						</Loading>
					</div>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId' />
						<div>
							<input v-if='editing' class='interactable text title-field' v-model='post.title'>
							<Title v-else :isLoading='isLoading' size='2em' static='left'>{{isLoading ? 'this is an example title' : post?.title}}</Title>
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
							<Button @click='updatePost' red><i class='material-icons-round'>close</i>Delete</Button>
						</div>
					</div>
					<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 25px' />
					<Loading :isLoading='isLoading'>
						<Subtitle static='left' v-if='post?.privacy === `unpublished`'>unpublished</Subtitle>
						<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' :live='true'/> (edited <Timestamp :datetime='post?.updated' :live='true'/>)</Subtitle>
						<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' :live='true'/></Subtitle>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
					</Loading>
					<ThemeMenu />
				</main>
			</div>
			<ol class='comments'>
				<MarkdownEditor v-model:value='newComment' resize='vertical' style='margin-bottom: 25px' v-if='writeComment'/>
				<div class='comment-field'>
					<p class='comment-label'>{{comments ? countComments : 'Loading'}} Comment{{countComments != 1 ? 's' : ''}} <button><i class='material-icons-round'>sort</i>sort by</button></p>
					<div class='buttons' v-if='writeComment'>
						<Button class='interactable' style='margin-right: 25px' @click='postComment' green><i class='material-icons-round'>create</i>Post</Button>
						<Button class='interactable' @click='writeComment = false' red><i class='material-icons-round'>close</i>Cancel</Button>
					</div>
					<Button class='interactable buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>comment</i>Comment</Button>
				</div>
				<li v-for='comment in comments'>
					<Comment :postId='comment?.post_id' v-bind='comment' :link='false' comment/>
				</li>
			</ol>
		</div>
	</Error>
</template>

<script>
import { khatch, getMediaUrl, isMobile, setTitle } from '@/utilities';
import { apiErrorMessage, postsHost, tagsHost, uploadHost } from '@/config/constants';
import Report from '@/components/Report.vue';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Timestamp from '@/components/Timestamp.vue';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Score from '@/components/Score.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import Post from '@/components/Post.vue'
import Thumbnail from '@/components/Thumbnail.vue'

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
		Comment: Post,
		Timestamp,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
		Markdown,
		Profile,
		Score,
		MarkdownEditor,
		Button,
		Thumbnail,
	},
	data() {
		return {
			editing: false,
			post: null,
			tags: null,
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
			writeComment: null,
			comments: null,
			newComment: null,
			parent: null,
		};
	},
	async created() {
		khatch(`${postsHost}/v1/post/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.post = r;
						if (r.parent)
						{
							this.parent = false;
							this.fetchParent(r.parent);
						}
						setTitle(`${this.post?.title || this.postId} by ${this.post.user.name || this.post.user.handle}`);
					}
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});

		khatch(`${tagsHost}/v1/fetch_tags/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.tags = r; }
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});

		khatch(`${postsHost}/v1/fetch_comments`, {
				method: 'POST',
				body: {
					post_id: this.postId,
					sort: 'best',
				},
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.fetchNestedComments(r)
							.then(() => this.comments = r);
					}
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});

		window.addEventListener('resize', this.onResize);
	},
	unmounted() {
		window.removeEventListener('resize', this.onResize);
	},
	computed: {
		isMobile,
		isLoading()
		{ return this.post === null; },
		isUpdated()
		{ return this.post !== null ? this.post.created !== this.post.updated : false; },
		mediaUrl()
		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },
		mediaElement() {
			let media = document.getElementsByClassName('media');
			if (media.length > 0)
			{ return media[0]; }
			return null;
		},
		showPrivacy()
		{ return this.post?.privacy && this.post.privacy.toLowerCase() !== 'public'; },
		countComments()
		{
			if (!this.comments)
			{ return null; }

			let count = this.comments.length;
			this.comments.forEach(comment => {
				count += this.countNestedComments(comment);
			});

			return count;
		},
		userIsUploader()
		{ return this.$store.state.user && this.post?.user?.handle === this.$store.state.user?.handle; }
	},
	methods: {
		fetchNestedComments(comments) {
			let i = 0;
			return new Promise(resolve => {
				if (comments.length === 0)
				{ resolve(); }
				comments.forEach(comment => {
					khatch(`${postsHost}/v1/fetch_comments`, {
							method: 'POST',
							body: {
								post_id: comment.post_id,
								sort: 'best',
							},
						})
						.then(response => {
							response.json().then(r => {
								if (response.status < 300)
								{
									this.fetchNestedComments(r)
										.then(() => {
											i++;
											comment.comments = r;
											if (i >= comments.length)
											{ resolve(); }
										});
								}
								else if (response.status === 401)
								{ this.errorMessage = r.error; }
								else if (response.status === 404)
								{ this.errorMessage = r.error; }
								else
								{
									this.errorMessage = apiErrorMessage;
									this.errorDump = r;
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
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.errorMessage = r.error; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
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
							this.comments.unshift({
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
								comments: [],
								media: false,
							});
							this.newComment = null;
							this.writeComment = null;
						});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		},
		countNestedComments(post) {
			if (post.comments)
			{
				let count = post.comments.length;
				post.comments.forEach(comment => {
					count += this.countNestedComments(comment);
				});
				return count;
			}
			return 0;
		},
		onResize() {
			if (!this.mediaElement)
			{ return; }

			if (this.isMobile)
			{
				this.mediaElement.style = 'margin: 0 auto 25px; max-width: 100%';
				return;
			}

			let rect = this.mediaElement.getBoundingClientRect();
			let right = window.innerWidth - rect.right;
			let margin = Math.max(window.innerWidth * 0.2, 300) - 0.1;

			if (rect.left < margin)
			{ this.mediaElement.style = 'margin: 0 auto 25px 0'; }
			else if (rect.left < right - 0.1)
			{ this.mediaElement.style = 'margin: 0 auto 25px; right: 10vw'; }
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
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
			this.post.title = this.post.title?.trim();
			this.post.description = this.post.description?.trim();
			this.post.updated = Date.now();
			this.editing = false;
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
	grid-area: main;
	border-radius: 3px 0 0 3px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
	padding: 25px;
}
.media {
	grid-area: media;
	margin: 0 auto 25px 0;
	position: relative;
	-webkit-transition: none;
	-moz-transition: none;
	-o-transition: none;
	transition: none;
	max-width: calc(100vw - max(20vw, 300px) - 25px);
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
	padding: 0.25em;
	margin: -0.25em;
	margin-top: 0;
	border-radius: 3px;
}
a.profile:hover {
	background: var(--bg2color);
}
.post-header {
	display: flex;
	margin-bottom: 25px;
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
	position: absolute;
	right: 25px;
	bottom: 25px;
	display: flex;
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
.mobile .comments {
	padding: 0 25px;
}
.comment-field {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}
.comment-field .buttons {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 25px;
}
.comment-label, .comment-label button {
	display: flex;
	align-items: center;
}
.comment-label button {
	margin-left: 25px;
	color: var(--subtle);
}
.comment-label button:hover {
	color: var(--icolor);
}
.report:hover {
	background: var(--bg2color);
}


.parent {
	margin-bottom: 25px;
}
.parent .inner {
	display: flex;
	align-items: center;
	border-radius: 3px;
	background: #0000;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
	padding: 0.25em;
	margin: -0.25em;
}
.parent .inner:hover {
	background: var(--bg2color);
}
.parent .inner p {
	font-size: 1.2em;
	margin-left: 0.5em;
}
.parent-thumbnail {
	border-radius: 3px;
	overflow: hidden;
}
.parent-thumbnail, .parent-thumbnail img {
	width: 3em;
	height: 3em;
}

/* theme overrides */
html.e621 main {
	margin-left: 0;
}
html.wikipedia main {
	border-left: 1px solid #A7D7F9;
}
</style>