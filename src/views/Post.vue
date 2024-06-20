<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<!-- eslint-disable vue/no-v-model-argument -->
	<div v-if='parent' class='parent'>
		<Reply :postId='parent?.post_id' v-bind='parent' nested labels/>
	</div>
	<div class='container' v-if='!isMobile'>
		<Sidebar :tags='tags' :post='post' v-model:scalarWidth='scalarWidth' class='sidebar'/>
		<div class='content'>
			<div class='media-container' :style='`left: calc(max(10vw, 50% - ${width / 2}px) - 10vw);`' v-show='post'>
				<Media class='media' v-if='post?.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' :thumbhash='post?.thumbhash' v-model:width='width' v-model:height='height' bg/>
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
					<Score :score='post?.score' :postId='postId'/>
					<div class='post-title'>
						<input v-if='editing' class='interactable text title-field' v-model='post.title'>
						<h2 v-else>
							<Loading span v-if='isLoading'>this is an example title</Loading>
							<Markdown v-else :content='post?.title' inline/>
						</h2>
						<div class='privacy'>
							<Subtitle static='right' v-if='showPrivacy'>{{post?.privacy}}</Subtitle>
							<router-link v-if='userIsUploader' :to='"/create?post=" + postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button></router-link>
						</div>
						<Profile :isLoading='isLoading' v-bind='post?.user'/>
					</div>
				</div>
				<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
				<div v-else-if='editing' style='width: 100%'>
					<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: var(--margin)'/>
					<div class='update-button'>
						<Button :href='`/create?post=${postId}`'><i class='material-icons-round'>launch</i><span>Full Editor</span></Button>
						<Button @click='updatePost' green><i class='material-icons-round'>check</i><span>Update</span></Button>
						<Button @click='deletePost' red><i class='material-icons-round'>close</i><span>Delete</span></Button>
					</div>
				</div>
				<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 var(--margin)'/>
				<Loading :isLoading='isLoading'>
					<Subtitle static='left' v-if='isUpdated'>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/> (edited <Timestamp :datetime='post?.updated' live/>)</Subtitle>
					<Subtitle static='left' v-else>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/></Subtitle>
				</Loading>
				<div class='post-buttons' v-if='!isLoading'>
					<Report :data='{ post: postId }' v-if='!isLoading'/>
					<RepostButton :postId='postId' v-model:count='post.reposts'/>
					<FavoriteButton :postId='postId' v-model:count='post.favorites'/>
					<ShareLink :content='`/p/${postId}`' v-if='!unpublishedPrivacy.has(post?.privacy)'/>
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
						<Button class='buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
					</div>
				</div>
				<ol class='replies'>
					<li v-for='reply in replies'>
						<Reply :postId='reply?.post_id' v-bind='reply' reply/>
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
			<Sidebar :tags='tags' :post='post' :scalarWidth='scalarWidth' class='sidebar'/>
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
								<router-link v-if='userIsUploader' :to='"/create?post=" + postId'><Button class='edit-button'><i class='material-icons-round' style='margin: 0'>{{editing ? 'edit_off' : 'edit'}}</i></Button></router-link>
							</div>
							<Profile :isLoading='isLoading' v-bind='post?.user'/>
						</div>
					</div>
					<Loading class='description' v-if='isLoading'><p>this is a very long example description</p></Loading>
					<div v-else-if='editing' style='width: 100%'>
						<MarkdownEditor v-model:value='post.description' height='30em' resize='vertical' style='margin-bottom: var(--margin)'/>
						<div class='update-button'>
							<Button :href='`/create?post=${postId}`'><i class='material-icons-round'>launch</i><span>Full Editor</span></Button>
							<Button @click='updatePost' green><i class='material-icons-round'>check</i><span>Update</span></Button>
							<Button @click='deletePost' red><i class='material-icons-round'>close</i><span>Delete</span></Button>
						</div>
					</div>
					<Markdown v-else-if='post.description' :content='post.description' style='margin: 0 0 var(--margin)'/>
					<Loading :isLoading='isLoading'>
						<Subtitle static='left' v-if='isUpdated'>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/> (edited <Timestamp :datetime='post?.updated' live/>)</Subtitle>
						<Subtitle static='left' v-else>{{unpublishedPrivacy.has(post?.privacy) ? 'created' : 'posted'}} <Timestamp :datetime='post?.created' live/></Subtitle>
					</Loading>
					<div class='post-buttons' v-if='!isLoading'>
						<Report :data='{ post: postId }' v-if='!isLoading'/>
						<RepostButton :postId='postId' v-model:count='post.reposts'/>
						<FavoriteButton :postId='postId' v-model:count='post.favorites'/>
						<ShareLink :content='`/p/${postId}`' v-if='!unpublishedPrivacy.has(post?.privacy)'/>
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
					<Button class='interactable buttons' @click='$store.state.user ? writeComment = true : $router.push(`/account/login?path=${$route.fullPath}`)' v-else><i class='material-icons-round'>reply</i><span>Reply</span></Button>
				</div>
			</div>
		</div>
		<ol class='replies'>
			<li v-for='reply in replies'>
				<Reply :postId='reply?.post_id' v-bind='reply' reply/>
			</li>
		</ol>
	</div>
</template>

<script>
import { demarkdown, khatch, getMediaUrl, setTitle } from '@/utilities';
import { apiErrorMessage, apiErrorDescriptionToast, apiErrorMessageToast, environment, isMobile, host } from '@/config/constants';
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
		DropDown,
		ShareLink,
		FavoriteButton,
		RepostButton,
	},
	setup() {
		const unpublishedPrivacy = new Set(['unpublished', 'draft']);

		return {
			unpublishedPrivacy,
		};
	},
	data() {
		return {
			isMobile,
			environment,
			editing: false,
			post: null,
			tags: null,
			writeComment: null,
			replies: null,
			newComment: null,
			parent: null,
			width: null,
			height: null,
			sets: null,
			commentSort: 'best',
			scalarWidth: true,
		};
	},
	created() {
		khatch(`${host}/v1/tags/${this.postId}`, {
			errorMessage: 'Could not retrieve post tags!',
		}).then(response => {
			response.json().then(r => {
				this.tags = r;
				if (this.post !== null)
				{ this.setPageTitle(); }
			});
		});

		khatch(`${host}/v1/sets/post/${this.postId}`, {
			errorMessage: 'Could not retrieve post sets!',
		}).then(response => {
			response.json().then(r => {
				this.sets = r;
			});
		});

		this.fetchComments();

		if (this.$store.state.postCache?.post_id === this.postId) {
			this.post = this.$store.state.postCache;

			this.post.favorites = 0;
			this.post.reposts = 0;
			this.width = this.post.size?.width;
			this.height = this.post.size?.height;
			if (this.post.parent) {
				this.parent = false;
				this.fetchParent(this.post.parent);
			}
		}
		else {
			// NOTE: we may actually want to do this anyway, just to make sure the post is up to date
			khatch(`${host}/v1/posts/${this.postId}`, {
				errorMessage: 'Could not retrieve post!',
			}).then(response => {
				response.json().then(r => {
					r.favorites = 0;
					r.reposts = 0;
					this.post = r;
					this.width = r.size?.width;
					this.height = r.size?.height;
					if (r.parent) {
						this.parent = false;
						this.fetchParent(r.parent);
					}

					if (this.tags !== null)
					{ this.setPageTitle(); }
				});
			});
		}
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
			let title = demarkdown(this.post?.title || this.postId);

			if (this.tags.hasOwnProperty('artist'))
			{
				const artists = this.tags.artist.map(x => x.endsWith('_(artist)') ? x.slice(0, -9).replaceAll('_', ' ') : x.replaceAll('_', ' '));

				if (artists.length > 2)
				{ title += ' by ' + artists.slice(0, -1).join(', ') + ', and ' + artists.slice(-1)[0]; }
				else if (artists.length === 2)
				{ title += ' by ' + artists[0] + ' and ' + artists[1]; }
				else
				{ title += ' by ' + artists[0]; }
			}

			if (this.tags.hasOwnProperty('subject'))
			{
				const subjects = this.tags.subject.map(x => x.endsWith('_(subject)') ? x.slice(0, -10).replaceAll('_', ' ') : x.replaceAll('_', ' '));

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
			khatch(`${host}/v1/users/${this.post?.user.following ? 'unfollow_user' : 'follow_user'}`, {
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
					response.json().then(r => {
						this.$store.commit('createToast', {
							title: apiErrorMessageToast,
							description: r.error,
						});
					});
				}
				else
				{
					response.json().then(r => {
						this.$store.commit('createToast', {
							title: apiErrorMessageToast,
							description: apiErrorDescriptionToast,
							dump: r,
						});
					});
				}
			})
		},
		fetchComments() {
			this.replies = null;
			khatch(`${host}/v1/posts/fetch_comments`, {
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
					khatch(`${host}/v1/posts/fetch_comments`, {
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
			khatch(`${host}/v1/posts/${postId}`)
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

			khatch(`${host}/v1/upload/create_post`, {
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
			khatch(`${host}/v1/upload/update_post`, {
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
		scalarWidth(value) {
			console.log("scalarWidth:", value)
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