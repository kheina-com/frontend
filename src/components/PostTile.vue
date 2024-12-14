<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' :title='title || postId || undefined'>
		<a :href='`/p/${postId}`' class='background-link' @click.prevent.stop='nav' v-show='!unlink'/>
		<div :to='`/p/${postId}`'  v-if='media || isLoading'>
			<Thumbnail :post='postId' :size='isMobile ? 800 : 400' v-if='acceptedMature' :crc='media?.crc' :thumbhash='media?.thumbhash' :width='media?.size?.width' :height='media?.size?.height'/>
			<button @click.stop.prevent='acceptedMature = true' class='interactable show-mature' :style='`aspect-ratio: ${media?.size?.width}/${media?.size?.height}`' v-else>
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
			<h4 class='title' v-else-if='title'><Markdown :content='title || postId' inline/></h4>
			<Markdown :content='description' :concise='true' class='description'/>
		</div>
		<p class='privacy' v-show='privacy !== "public"'>
			{{privacy}}
		</p>
		<div class='buttons'>
			<ReportButton :data='{ post: postId }'/>
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
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { khatch } from '@/utilities';
import { apiErrorDescriptionToast, apiErrorMessageToast, isMobile, host, ratingMap } from '@/config/constants';
import store from '@/globals';
import Loading from '@/components/Loading.vue';
import Markdown from '@/components/Markdown.vue';
import Thumbnail from '@/components/Thumbnail.vue';
import ReportButton from '@/components/ReportButton.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import RepostButton from '@/components/RepostButton.vue';
import DropDown from '@/components/DropDown.vue';

const router = useRouter();
const globals = store();
const props = withDefaults(defineProps<{
	postId?:     string | null,
	unlink?:     boolean,
	nested?:     boolean,
	parent?:     string | null,
	rating?:     "general" | "mature" | "explicit",

	// post fields
	user:        User,
	score:       Score | null,
	title:       string | null,
	description: string | null,
	privacy:     "public" | "unlisted" | "private" | "unpublished" | "draft",
	created:     Date,
	updated:     Date,
	media:       Media | null,
	blocked:     boolean,
	favorites?:  number,
	reposts?:    number,
}>(), {
	postId: null,
	unlink: false,
	nested: false,
	parent: null,
	media_type: null,
	rating: "general",

	// post fields
	// user: Object,
	// score: Object,
	title: null,
	description: null,
	privacy: "public",
	filename: null,
	size: null,
	blocked: false,
	favorites: 0, // this value needs to be updated to null when api is updated
	reposts: 0, // this value needs to be updated to null when api is updated
	thumbhash: null,
});

const parentData: Ref<Post | null> = ref(null);
const acceptedMature: Ref<boolean> = ref(ratingMap[globals.rating] >= ratingMap[props.rating]);

onMounted(() => {
	if (props.parent) {
		khatch(`${host}/v1/post/${props.parent}`, {
			method: "GET",
			errorMessage: "Failed to retrieve post parent.",
		}).then(r => r.json())
		.then(r => parentData.value = r)
		.catch(() => { });
	}
});

const isLoading = computed(() => !props.postId);
const divClass = computed(() => "post tile" + (isLoading.value ? " loading" : "") + (props.unlink ? "" : " link") + (props.nested ? " nested" : ""));
// const showPrivacy = computed(() => props.privacy && props.privacy.toLowerCase() !== "public");

function nav() {
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
			"user_vote" / "vote": 0,
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
		media: props.media,
		blocked: props.blocked,
		// favorites: props.favorites,
		// reposts: props.reposts,
	};
	router.push("/p/" + props.postId);
}

function followUser() {
	khatch(`${host}/v1/user/${props.user?.handle}/follow`, {
		method: props.user?.following ? "DELETE" : "PUT",
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
	});
}
watch(props, (value) => {
	if (value.parent) {
		khatch(`${host}/v1/posts/${value.parent}`, {
			method: "GET",
			errorMessage: "Failed to retrieve post parent.",
		}).then(r => r.json())
		.then(r => parentData.value = r)
		.catch(() => { });
	}
});
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
	/* min-width: 7em; */
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
	/* all of the magic numbers here are used to calculate 3 columns of tiles when rendering search results on mobile */
	max-width: calc(100vw / 3 - var(--margin) * 10 / 3 - var(--border-size) * 6);
	/* max-width: calc((100vw - var(--margin) * 10 - var(--border-size) * 6) / 3); */
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
.parent .material-icons {
	margin: -0.2em 0;
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
