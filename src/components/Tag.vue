<template>
	<router-link :to='`/t/${tag}`' class='tag'>
		<h2>{{tag}}</h2>
		<Profile v-bind='owner' v-if='owner' :link='false'/>
		<p :style='`color: var(--${tagColorMap[tagClass()]})`'>{{class}}</p>
		<p>Status: {{deprecated ? 'deprecated' : 'active'}}</p>
		<p>Inherited Tags: {{inheritedTags}}</p>
		<Markdown :content='description'/>
	</router-link>
</template>

<script>
import { tagColorMap } from '@/config/constants';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';


export default {
	name: 'Tag',
	props: {
		tag: String,
		class: String,
		deprecated: Boolean,
		inheritedTags: Array[String],
		description: String,
		owner: Object[String],
	},
	components: {
		Markdown,
		Profile,
	},
	data() {
		return {
			tagColorMap,
		};
	},
	methods: {
		tagClass() {
			return this.class;
		},
	},
}
</script>

<style scoped>
.tag {
	padding: 25px;
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: block;
}
.tag:hover {
	border-color: var(--icolor);
}
h2 {
	margin: 0;
}
</style>