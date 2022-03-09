<template>
	<div>
		<h3>Tags</h3>
		<ol v-if='tags'>
			<li v-for='(value, name) in sortTagGroups(tags)'>
				<TagGroup :group='name' :tags='value'/>
			</li>
			<li class='rating'>
				<h4>Rating</h4>
				<Loading :class='rating' :isLoading='!rating'>
					<router-link :to='`/q/${rating}`'>
						<span>{{rating || 'rating'}}</span>
					</router-link>
				</Loading>
			</li>
		</ol>
		<ol v-else>
			<li v-for='name in tagGroups'>
				<TagGroup :group='name'/>
			</li>
		</ol>
	</div>
</template>

<script>
import { getMediaThumbnailUrl, sortTagGroups } from '@/utilities'
import { tagGroups } from '@/config/constants'
import Loading from '@/components/Loading.vue';
import TagGroup from '@/components/TagGroup.vue';

export default {
	name: 'Sidebar',
	props: {
		rating: {
			type: String,
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
</style>