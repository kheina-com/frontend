<template>
	<router-link :to='`/s/${setId}`' class='set nested'>
		<h2>{{title}}</h2>
		<Profile v-bind='owner' :link='owner.handle !== $route.path.substring(1)'/>
		<p>posts: {{ commafy(count) }}</p>
		<p class='dates'>created: <Timestamp :datetime='created'/><span v-show='updated !== created'> (updated: <Timestamp :datetime='updated'/>)</span></p>
		<p class='privacy' v-show='privacy !== "public"'>{{ privacy }}</p>
		<Markdown :content='description'/>
	</router-link>
</template>

<script>
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Timestamp from '@/components/Timestamp.vue';
import { commafy } from '@/utilities';


export default {
	name: 'Set',
	props: {
		setId: String,
		owner: Object[String],
		count: Number,
		title: String,
		description: String,
		privacy: String,
		created: Date,
		updated: Date,
	},
	components: {
		Markdown,
		Profile,
		Timestamp,
	},
	methods: {
		commafy,
	},
}
</script>

<style scoped>
.set {
	padding: 25px;
	background: var(--bg1color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
}
.set.nested {
	background: var(--bg2color);
}
.set:hover {
	border-color: var(--interact);
}
h2 {
	margin: 0;
}
a.profile:hover {
	background: var(--bg1color);
}
.set.nested a.profile:hover {
	background: var(--bg2color);
}
.dates {
	color: var(--subtle);
}
.privacy {
	color: var(--subtle);
	position: absolute;
	top: 25px;
	right: 25px;
}
</style>