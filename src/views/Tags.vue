<template>
	<main>
		<ol class='results'>
			<p v-if='tags?.length === 0' style='text-align: center'>No tags found!</p>
			<li v-for='tag in tags' v-else>
				<TagComponent :inheritedTags='tag.inherited_tags' v-bind='tag'/>
			</li>
		</ol>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import type { Tag } from '@/types/tag';
import { ref, type Ref } from 'vue';
import { khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import TagComponent from '@/components/Tag.vue';

const tags: Ref<Tag[] | null> = ref(null);

khatch(`${host}/v1/tags/lookup`, {
	method: "POST",
	handleError: true,
	body: { },
}).then(r => r.json())
.then(r => tags.value = r);
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}
</style>
