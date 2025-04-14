<template>
	<a :href='href' @click.stop.prevent='$router.push(href)' ref='set' class='set'>
		<h2>{{title}}</h2>
		<Profile v-bind='owner' :link='owner.handle !== $route.path.substring(1)'/>
		<p>posts: {{ commafy(count) }}</p>
		<p class='dates'>created: <Timestamp :datetime='created'/><span v-show='updated !== created'> (updated: <Timestamp :datetime='updated'/>)</span></p>
		<p class='privacy' v-show='privacy !== "public"'>{{ privacy }}</p>
		<Markdown :content='description'/>
	</a>
</template>
<script setup lang='ts'>
import type { User } from '@/types/user';
import { onMounted, ref } from 'vue';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Timestamp from '@/components/Timestamp.vue';
import { commafy } from '@/utilities';

const props = withDefaults(defineProps<{
	setId: string,
	owner: User,
	count: number,
	title: string | null,
	description: string | null,
	privacy: string,
	created: string | Date,	
	updated: string | Date,
	nested?: boolean,
	unlink?: boolean,
}>(), {
	nested: false,
	unlink: false,
});

const set = ref<HTMLAnchorElement | null>(null);
const href = "/s/" + encodeURIComponent(props.setId);

onMounted(() => {
	if (props.nested && set.value) set.value.classList.add("nested");
});
</script>
<style scoped>
.set {
	padding: var(--margin);
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.set.nested {
	background: var(--bg3color);
}
.set:hover {
	border-color: var(--interact);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
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
	top: var(--margin);
	right: var(--margin);
}
</style>
