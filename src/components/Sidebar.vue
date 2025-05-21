<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='isMobile ? "nested" : ""'>
		<h3>Tags</h3>
		<ol v-if='post?.tags'>
			<li v-for='(value, name) in sortTagGroups(post.tags)'>
				<TagGroup :group='name' :tags='value'/>
			</li>
			<li class='rating'>
				<h4>Rating</h4>
				<Loading :class='post?.rating' :isLoading='!post?.rating'>
					<router-link :to='`/q/${post?.rating}`'>
						<span>{{ post?.rating || 'rating' }}</span>
					</router-link>
				</Loading>
			</li>
		</ol>
		<ol v-else>
			<li v-for='name in tagGroups'>
				<TagGroup :group='name'/>
			</li>
		</ol>
		<h3 style='padding-top: 2em'>Info</h3>
		<div class='post-data' v-if='post'>
			<div>
				<p>post id:</p>
				<CopyText :content='post.post_id' inline/>
			</div>
			<div v-if='post.media'>
				<p>size:</p>
				<p>{{ `W${post.media.size.width}px H${post.media.size.height}px` }} ({{ abbreviateBytes(post.media.length) }})</p>
			</div>
			<div v-if='post.media'>
				<p>file type:</p>
				<p>{{ post.media ? post.media.type.file_type : 'none' }}</p>
			</div>
			<div>
				<p>description:</p>
				<p>{{ post.description ? `${post.description.length} chars` : 'none' }}</p>
			</div>
			<div v-show='post.locked'>
				<p>status:</p>
				<p>locked</p>
			</div>
		</div>
		<div class='buttons'>
			<a v-if='post?.media' class='interactable' :href='post.media.url' :download='post.media.filename' target='_blank'>download</a>
			<button v-if='scalar !== undefined' class='interactable' @click='toggleScalar'>scalar</button>
		</div>
		<div class='mod' v-if='globals.auth?.isMod'>
			<h3 style='padding-top: 2em'>Mod Actions</h3>
			<div class='buttons'>
				<router-link :to='"/mod/p/" + post?.post_id' class='interactable'>post actions</router-link>
				<router-link :to='"/mod/a/" + post?.user?.handle' class='interactable'>user actions</router-link>
				<router-link :to='"/mod/b/" + post?.user?.handle' class='interactable'>user bans</router-link>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import store from '@/globals';
import type { PostLike } from '@/types/post';
import { abbreviateBytes, sortTagGroups } from '@/utilities';
import { isMobile, tagGroups } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import TagGroup from '@/components/TagGroup.vue';
import CopyText from '@/components/CopyText.vue';
import { toRef, type Ref } from 'vue';

const props = defineProps<{
	post?:   PostLike,
	scalar?: boolean,
}>();

const globals = store();
const scalar: Ref<boolean> = toRef(props, "scalar");
const post: Ref<PostLike | undefined> = toRef(props, "post");
const emits = defineEmits(["update:scalar"]);
function toggleScalar() {
	// scalar.value = !scalar.value;
	emits("update:scalar", !scalar.value);
}
</script>
<style scoped>
h3 {
	margin: 0 var(--half-margin) 12px;
	border-bottom: var(--border-size) solid var(--bordercolor);
	padding: 0 var(--half-margin) 12px;
}
ol {
	list-style: none;
	margin: 0 var(--margin) 0;
	padding: 0;
}

.rating div {
	margin: 0 0 0 10px;
	padding: 0;
}
h4 {
	margin: 0.25em 0;
}

.rating .general a {
	color: var(--general);
}
.rating .mature a {
	color: var(--mature);
}
.rating .explicit a {
	color: var(--explicit);
}

.buttons {
	margin: 0 var(--half-margin);
	display: flex;
	justify-content: space-around;
	flex-wrap: wrap;
}
.buttons button, .buttons a {
	margin: var(--margin) var(--half-margin) 0;
	background: var(--bg1color);
	display: block;
}
.mod .buttons {
	margin-top: var(--neg-margin);
}

/* theme overrides */
html.e621 .rating .general span, html.e621 .rating .mature span {
	display: none;
}

html.e621 .general a::after {
	content: "safe";
}
html.e621 .mature a::after {
	content: "questionable";
}

.post-data {
	margin: 0 1em 0 var(--margin);
}
.post-data div {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
</style>
