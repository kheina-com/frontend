<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div>
		<h3>Tags</h3>
		<ol v-if='tags'>
			<li v-for='(value, name) in sortTagGroups(tags)'>
				<TagGroup :group='name' :tags='value'/>
			</li>
			<li class='rating'>
				<h4>Rating</h4>
				<Loading :class='post?.rating' :isLoading='!post?.rating'>
					<router-link :to='`/q/${post?.rating}`'>
						<span>{{post?.rating || 'rating'}}</span>
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
			post id: <code>{{post.post_id ?? post.postId}}</code>
			<br>
			size: {{post.size ? `${post.size.width}x${post.size.height}px` : 'none'}}
			<br>
			file type: {{post.media_type ? post.media_type.file_type : 'none'}}
			<br>
			description: {{post.description ? `${post.description.length} chars` : 'none'}}
		</div>
	</div>
</template>

<script>
import { commafy, sortTagGroups } from '@/utilities';
import { tagGroups } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import TagGroup from '@/components/TagGroup.vue';

export default {
	name: 'Sidebar',
	props: {
		post: {
			type: Object,
			default: null,
		},
		tags: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			tagGroups,
		}
	},
	components: {
		Loading,
		TagGroup,
	},
	methods: {
		commafy,
		sortTagGroups,
	},
}
</script>

<style scoped>
h3 {
	margin: 0 12.5px 12px;
	border-bottom: var(--border-size) solid var(--bordercolor);
	padding: 0 12.5px 12px;
}
ol {
	list-style: none;
	margin: 0 25px 0;
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
	margin: 0 1em 0 25px;
}
</style>