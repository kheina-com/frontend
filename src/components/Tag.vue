<template>
	<router-link :to='`/t/${encodeURIComponent(props.tag)}`' ref='tag' class='tag'>
		<h2>{{props.tag}}</h2>
		<Profile v-bind='owner' v-if='owner' :link='owner.handle !== $route.path.substring(1)'/>
		<p :class='group'>{{group}}</p>
		<p>Status: {{deprecated ? 'deprecated' : 'active'}}</p>
		<p>Inherited Tags: {{inheritedTags.length === 0 ? 'None' : inheritedTags.join(', ')}}</p>
		<Markdown :content='description'/>
	</router-link>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';

const props = withDefaults(defineProps<{
	tag: string,
	group: string,
	deprecated: boolean,
	inheritedTags: string[],
	description: string | null,
	owner: User | null,
	nested: boolean,
}>(), {
	nested: false,
});

const tag = ref<HTMLAnchorElement | null>(null);

onMounted(() => {
	if (props.nested && tag.value) tag.value.classList.add("nested");
});
</script>

<style scoped>
.tag {
	padding: var(--margin);
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.tag:hover {
	border-color: var(--interact);
}
h2 {
	margin: 0;
}
a.profile:hover {
	background: var(--bg1color);
}
.tag.nested a.profile:hover {
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