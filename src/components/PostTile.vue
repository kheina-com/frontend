<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' v-if='link' :title='title || postId'>
		<a :href='`/p/${postId}`' class='background-link' @click.prevent.stop='nav' v-show='link'/>
		<div :to='`/p/${postId}`' class='thumbnail' v-if='media_type'>
			<Thumbnail :post='postId' :size='isMobile ? 800 : 400' v-if='acceptedMature' :thumbhash='thumbhash' :width='size?.width' :height='size?.height'/>
			<button @click.stop.prevent='acceptedMature = true' class='interactable show-mature' :style='`aspect-ratio: ${size?.width}/${size?.height}`' v-else>
				this post is <b>{{rating}}</b>, click to show.
			</button>
		</div>
		<div class='text' v-else>
			<div class='parent' v-if='parent'>
				<Loading span v-if='parentData === null'>this is an example title</Loading>
				<Markdown :content='parentData?.title || parent' inline v-else/>
				<i class='material-icons'>reply</i>
			</div>
			<Loading span v-if='isLoading'>this is an example title</Loading>
			<h3 class='title' v-else><Markdown :content='title' inline/></h3>
			<Markdown :content='description' :concise='true' class='description'/>
		</div>
		<p class='privacy' v-show='privacy !== "public"'>
		{{privacy}}
		</p>
		<div class='buttons'>
			<Report :data='{ post: postId }'/>
			<RepostButton :postId='postId'/>
			<FavoriteButton :postId='postId'/>
			<DropDown :options="[
				{ html: `${user?.following ? 'Unfollow' : 'Follow'} @${user?.handle}`, action: followUser },
				{ html: `Block @${user?.handle}`, action: () => { } },
				{ html: `Report @${user?.handle}`, action: () => { } },
			]">
				<div class='more-button'>
					<i class='material-icons-round'>more_horiz</i>
				</div>
			</DropDown>
		</div>
	</div>
	<div class='post tile nested link no-buttons' v-else>
		<Thumbnail class='thumbnail' :size='400' :post='postId' :width='size?.width' :height='size?.height' :thumbhash='thumbhash' v-if='media_type'/>
		<div class='text' v-else>
			<div class='parent' v-if='parent'>
				<Loading span v-if='parentData === null'>this is an example title</Loading>
				<Markdown :content='parentData?.title || parent' inline v-else/>
				<i class='material-icons'>reply</i>
			</div>
			<Loading span v-if='isLoading'>this is an example title</Loading>
			<h3 class='title' v-else><Markdown :content='title' inline/></h3>
			<Markdown :content='description' :concise='true' class='description'/>
		</div>
	</div>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessageToast, isMobile, postsHost, ratingMap, usersHost } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Score from '@/components/Score.vue';
import Timestamp from '@/components/Timestamp.vue';
import Subtitle from '@/components/Subtitle.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Thumbnail from '@/components/Thumbnail.vue';
import Report from '@/components/Report.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';
import DropDown from '@/components/DropDown.vue';


export default {
	name: 'PostTile',
	components: {
		Title,
		Loading,
		Profile,
		Markdown,
		Score,
		Timestamp,
		Subtitle,
		MarkdownEditor,
		Thumbnail,
		Report,
		FavoriteButton,
		RepostButton,
		DropDown,
	},
	props: {
		parent: {
			type: String,
			default: null,
		},
		postId: {
			type: String,
			default: null,
		},
		media_type: {
			type: Object,
			default: { },
		},
		score: Object,
		title: {
			type: String,
			default: null,
		},
		description: {
			type: String,
			default: null,
		},
		blocked: {
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
		filename: {
			type: String,
			default: null,
		},
		size: {
			type: Object,
			default: { width: 0, height: 0 },
		},
		user: {
			type: Object,
			default: null,
		},
		link: {
			type: Boolean,
			default: false,
		},
		nested: {
			type: Boolean,
			default: false,
		},
		rating: {
			type: String,
			default: 'general',
		},
		privacy: String,
		favorites: {
			type: Number,
			default: 0, // this value needs to be updated to null when api is updated
		},
		reposts: {
			type: Number,
			default: 0, // this value needs to be updated to null when api is updated
		},
		thumbhash: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			isMobile,
			parentData: null,
			acceptedMature: this.$store.state.maxRating >= ratingMap[this.rating],
		};
	},
	mounted() {
		if (this.parent) {
			khatch(`${postsHost}/v1/post/${this.parent}`, {
				method: 'GET',
				errorMessage: 'Failed to retrieve post parent.',
			})
			.then(response => {
				response.json().then(r => this.parentData = r);
			})
			.catch(() => { });
		}
	},
	computed: {
		isLoading()
		{ return this.postId === null; },
		divClass()
		{ return 'post tile ' + (this.isLoading ? 'loading' : 'link') + (this.nested ? ' nested' : ''); },
		showPrivacy()
		{ return this.privacy && this.privacy.toLowerCase() !== 'public'; },
		isUpdated()
		{ return this.post !== null ? this.created !== this.updated : false; },
	},
	methods: {
		nav() {
			// this needs to match the fingerprint of the api:
			/*{
				"post_id": "string",
				"title": "string",
				"description": "string",
				"user": {
					"name": "string",
					"handle": "string",
					"privacy": "public",
					"icon": "string",
					"verified": "artist",
					"following": true,
				},
				"score": {
					"up": 0,
					"down": 0,
					"total": 0,
					"user_vote": 0,
				},
				"rating": "general",
				"parent": "string",
				"privacy": "public",
				"created": "2022-12-08T17:45:00.119Z",
				"updated": "2022-12-08T17:45:00.119Z",
				"filename": "string",
				"media_type": {
					"file_type": "string",
					"mime_type": "string",
				},
				"size": {
					"width": 0,
					"height": 0,
				},
				"thumbhash": "string",
				"blocked": true,
			}*/
			this.$store.state.postCache = {
				post_id: this.postId,
				title: this.title,
				description: this.description,
				user: this.user,
				score: this.score,
				rating: this.rating,
				parent: this.parent,
				privacy: this.privacy,
				created: this.created,
				updated: this.updated,
				filename: this.filename,
				media_type: this.media_type,
				size: this.size,
				blocked: this.blocked,
				favorites: this.favorites,
				reposts: this.reposts,
				thumbhash: this.thumbhash,
			};
			this.$router.push('/p/' + this.postId);
		},
		followUser() {
			khatch(`${usersHost}/v1/${this.user?.following ? 'unfollow_user' : 'follow_user'}`, {
				method: 'POST',
				body: {
					handle: this.user?.handle,
				},
			})
			.then(response => {
				if (response.status < 300) {
					this.user.following = !this.user.following;
					this.$store.commit('createToast', {
						icon: this.user.following ? 'person_add_alt' : 'person_remove',
						title: `Successfully ${this.user.following ? 'Followed' : 'Unfollowed'} @${this.user.handle}`,
						time: 5,
					});
				}
				else if (response.status < 500) {
					response.json().then(r => {
						this.$store.commit('createToast', {
							title: apiErrorMessageToast,
							description: r.error,
						});
					});
				}
				else {
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
	},
	watch: {
		parent(value) {
			if (value) {
				khatch(`${postsHost}/v1/post/${value}`, {
					method: 'GET',
					errorMessage: 'Failed to retrieve post parent.',
				})
				.then(response => {
					response.json().then(r => this.parentData = r);
				})
				.catch(() => { });
			}
		},
	},
}
</script>

<style scoped>
.post {
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	padding: var(--margin) var(--margin) 2px;
	align-items: flex-start;
	position: relative;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	text-align: center;
	max-width: 20em;
	min-width: 7em;
}
.background-link {
	top: 0;
	left: 0;
	position: absolute;
	width: 100%;
	height: 100%;
}
.post.no-buttons {
	padding: var(--margin);
}
.thumbnail, .show-mature {
	max-width: 20em;
}
.mobile .thumbnail, .mobile .show-mature {
	/* all of the magic numbers here are used to calculate 3 columns of tiles when rendering search results on mobile */
	max-width: calc((100vw - (250px + 6 * var(--border-size))) / 3);
}
.text, .loading {
	overflow: hidden;
	/* max-width: 10em; */
}
.description {
	color: var(--text);
}
.thumbnail, .text, .show-mature {
	max-height: 10em;
	margin: auto;
}
.mobile .thumbnail, .mobile .text, .mobile .show-mature {
  max-width: calc(100vw / 3 - 76px - var(--border-size) * 6);
}
.title {
	margin: 0 0 15px;
}

.post.link {
	cursor: pointer;
}
.post.link:hover {
	border-color: var(--interact);
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
.post .edit-button {
	background: var(--bg2color);
}

.parent {
	color: var(--subtle);
	display: flex;
	align-items: center;
	margin: auto;
}

.post img {
	max-width: 10em;
	max-height: 10em;
	border-radius: var(--border-radius);
	margin: 0 auto;
}
.post > :last-child {
	margin-bottom: 0;
}
.bottom-margin {
	margin-bottom: var(--margin);
}
.buttons {
	margin: -5px -15px 0;
	width: calc(100% + 30px);
	display: flex;
	justify-content: space-between;
	align-items: center;
	pointer-events: none;
}
.buttons * {
	pointer-events: all;
}
.more-button {
	border-radius: var(--border-radius);
	padding: 0.375em;
	color: var(--subtle);
	background: #00000000;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.more-button i {
	font-size: 1.2em;
	display: block;
}
.more-button:hover {
	color: var(--interact);
	background: var(--bg2color);
}
.nested .more-button:hover {
	background: var(--bg1color);
}
.nested .show-mature {
	background: var(--bg1color);
}
.privacy {
	color: var(--subtle);
	text-align: center;
	align-self: center;
}
</style>
