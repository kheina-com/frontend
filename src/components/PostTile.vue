<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='divClass' ref='self'>
		<a :href='`/p/${postId}`' class='background-link' @click.prevent.stop='nav' v-show='!unlink'/>
		<div :to='`/p/${postId}`'  v-if='media || isLoading' class='thumbnail'>
			<Thumbnail :media='media' :size='isMobile ? 800 : 400' :render='acceptedMature'/>
			<button @click.stop.prevent='acceptedMature = true' class='interactable show-mature' v-translate:accept_mature_short.html='{ rating }' v-if='!acceptedMature'>
				this post is <b>{{ rating }}</b>, click to show.
			</button>
		</div>
		<div class='text' v-else>
			<div class='parent' v-if='parent_id'>
				<Markdown :content='parent?.title || parent_id' inline/>
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
				{ html: `${user?.following ? 'Unf' : 'F'}ollow @${user?.handle}`, action: followUser },
				{ html: `Block @${user?.handle}`,                                 action: () => { } },
				{ html: `Report @${user?.handle}`,                                action: () => { } },
			]">
				<div class='more-button'>
					<i class='material-icons-round'>more_horiz</i>
				</div>
			</DropDown>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { khatch } from '@/utilities';
import { demarkdown } from '@/utilities/markdown';
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
	parent_id?:  string | null,
	parent?:     Post | null,
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
	tags?:       Tags | null,
	blocked:     boolean,
	favorites?:  number | null,
	reposts?:    number | null,
}>(), {
	postId: null,
	unlink: false,
	nested: false,
	parent_id: null,
	parent: null,
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
	tags: null,
});

const self = ref<HTMLDivElement | undefined>() as Ref<HTMLDivElement>;
const acceptedMature: Ref<boolean> = ref(ratingMap[globals.rating] >= ratingMap[props.rating]);
const isLoading = computed(() => !props.postId);
const divClass = computed(() => "post tile" + (isLoading.value ? " loading" : "") + (props.unlink ? "" : " link") + (props.nested ? " nested" : ""));
const setTitle = async () => {
	if (props.title) {
		self.value.title = await demarkdown(props.title);
		return;
	}
	if (props.postId) {
		self.value.title = props.postId;
		return;
	}
};

onMounted(setTitle);

function nav() {
	if (!props.postId || !props.user || !props.created || !props.updated) return;
	globals.postCache = {
		post_id:     props.postId,
		title:       props.title,
		description: props.description,
		user:        props.user,
		score:       props.score,
		rating:      props.rating,
		parent_id:   props.parent_id,
		parent:      props.parent,
		privacy:     props.privacy,
		created:     props.created,
		updated:     props.updated,
		media:       props.media,
		tags:        props.tags,
		favorites:   props.favorites,
		reposts:     props.reposts,
		replies:     null,
		blocked:     props.blocked,
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

watch(toRef(props, "title"), setTitle);
watch(toRef(props, "rating"), (value: "general" | "mature" | "explicit") =>
	acceptedMature.value = ratingMap[globals.rating] >= ratingMap[value]
);
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
.show-mature {
	padding: var(--margin);
	background: var(--bg2color);
	position: absolute;
	align-self: center;
	max-width: 100%;
	margin: auto var(--margin);
	pointer-events: all;
}
.thumbnail {
	position: relative;
	display: flex;
	max-width: 100%;
	pointer-events: none;
	justify-content: center;
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
