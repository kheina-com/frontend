<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<Error :dump='errorDump' :message='errorMessage'>
		<div class='container' v-if='!isMobile'>
			<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>
			<div class='content'>
				<Media v-if='isLoading || post.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' :load='onResize' />
				<main>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId' />
						<div>
							<input v-if='editing' class='interactable text title-field' v-model='post.title'>
							<Title v-else :isLoading='isLoading' size='2em' static='left'>{{isLoading ? 'this is an example title' : post?.title}}</Title>
							<div class='privacy'>
								<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
								<Button class='edit-button' v-if='post?.user_is_uploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
							</div>
							<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' :icon='post?.user.icon' />
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
						<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' /> (edited <Timestamp :datetime='post?.updated' />)</Subtitle>
						<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' /></Subtitle>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
					</Loading>
					<ThemeMenu />
				</main>
				<ol>
					<p class='comment-label'>{{comments ? countComments : 'Loading'}} Comment{{comments?.length != 1 ? 's' : ''}} <button><i class='material-icons-round'>sort</i>sort by</button></p>
					<li v-for='comment in comments'>
						<Comment v-bind='comment' comment/>
					</li>
				</ol>
			</div>
		</div>
		<div class='content' v-else>
			<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />
			<div class='container'>
				<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>
				<main>
					<div class='post-header'>
						<Score :score='post?.score' :postId='postId' />
						<div>
							<input v-if='editing' class='interactable text title-field' v-model='post.title'>
							<Title v-else :isLoading='isLoading' size='2em' static='left'>{{isLoading ? 'this is an example title' : post?.title}}</Title>
							<div class='privacy'>
								<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
								<Button class='edit-button' v-if='post?.user_is_uploader' @click='editToggle'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button>
							</div>
							<Profile :isLoading='isLoading' :username='post?.user.name' :handle='post?.user.handle' :icon='post?.user.icon' />
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
						<Subtitle static='left' v-else-if='isUpdated'>posted <Timestamp :datetime='post?.created' /> (edited <Timestamp :datetime='post?.updated' />)</Subtitle>
						<Subtitle static='left' v-else>posted <Timestamp :datetime='post?.created' /></Subtitle>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
					</Loading>
					<ThemeMenu />
				</main>
			</div>
			<ol style='padding: 0 25px'>
				<p class='comment-label'>{{comments ? countComments : 'Loading'}} Comment{{comments?.length != 1 ? 's' : ''}} <button><i class='material-icons-round'>sort</i>sort by</button></p>
				<li v-for='comment in comments'>
					<Comment v-bind='comment' comment/>
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
	},
	data() {
		return {
			editing: false,
			post: null,
			tags: null,
			errorDump: null,
			errorMessage: null,
			sidebarStyle: null,
			comments: [],
		};
	},
	created() {
		khatch(`${postsHost}/v1/post/${this.postId}`)
			.then(response => {
				response.json().then(r => {
					console.log(r);
					if (response.status < 300)
					{
						this.post = r;
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
					console.log(r);
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
		}
	},
	methods: {
		countNestedComments(post) {
			let count = post.comments.length;
			post.comments.forEach(comment => {
				count += this.countNestedComments(comment);
			});
			return count;
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
html.solarized-dark .media, html.solarized-light .media {
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
ol > :last-child, ol > :last-child .post {
	margin: 0;
}
ol p {
	margin: 0 0 0.25em 25px;
}
.comment-label, .comment-label button {
	display: flex;
	align-items: center;
}
.comment-label button {
	margin-left: 25px;
	color: var(--subtlecolor);
}
.comment-label button:hover {
	color: var(--icolor);
}
.report:hover {
	background: var(--bg2color);
}

/* theme overrides */
html.e621 main {
	margin-left: 0;
}
html.wikipedia main {
	border-left: 1px solid #A7D7F9;
}
</style>