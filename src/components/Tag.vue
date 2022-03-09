<template>
	<router-link :to='`/t/${tag}`' :class='divClass'>
		<h2>{{tag}}</h2>
		<Profile v-bind='owner' v-if='owner' :link='owner.handle !== $route.path.substring(1)'/>
		<p :class='group'>{{group}}</p>
		<p>Status: {{deprecated ? 'deprecated' : 'active'}}</p>
		<p>Inherited Tags: {{inheritedTags}}</p>
		<Markdown :content='description'/>
	</router-link>
</template>

<script>
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';


export default {
	name: 'Tag',
	props: {
		tag: String,
		group: String,
		deprecated: Boolean,
		inheritedTags: Array[String],
		description: String,
		owner: Object[String],
		nested: {
			type: Boolean,
			default: true,
		},
	},
	components: {
		Markdown,
		Profile,
	},
	computed: {
		divClass()
		{ return 'tag' + (this.nested ? ' nested' : ''); },
	},
}
</script>

<style scoped>
.tag {
	padding: 25px;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.tag.nested {
	background: var(--bg2color);
}
.tag:hover {
	border-color: var(--icolor);
}
h2 {
	margin: 0;
}
a.profile:hover {
	background: var(--bg1color);
}
.post.nested a.profile:hover {
	background: var(--bg2color);
}

.artist {
	color: var(--pink);
}

.sponsor {
	color: var(--green);
}

.subject {
	color: var(--violet);
}

.species {
	color: var(--orange);
}

.gender {
	color: var(--blue);
}

.misc {
	color: var(--subtle);
}


/* theme overrides */
html.e621 .subject {
	color: var(--green);
}

html.e621 .sponsor {
	color: var(--violet);
}
</style>