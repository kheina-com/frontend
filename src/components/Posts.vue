<template>
	<ol class='results'>
		<p v-if='posts?.length === 0' style='text-align: center'>
			<slot/>
		</p>
		<li v-for='post in posts || 20' v-else-if='tiles'>
			<PostTile :key='(post as any)?.post_id' :postId='(post as any)?.post_id' :nested='nested' v-bind='(post as any)' link/>
		</li>
		<li v-for='post in posts || 3' v-else>
			<Post :postId='(post as any)?.post_id' :nested='nested' v-bind='(post as any)' labels/>
		</li>
	</ol>
</template>
<script setup lang='ts'>
import type { PostLike } from '@/types/post';
import PostTile from '@/components/PostTile.vue';
import Post from '@/components/Post.vue';

defineProps<{
	nested: boolean,
	tiles: boolean,
	posts?: PostLike[] | null,
}>();
</script>
<style scoped>
.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: var(--neg-half-margin);
}
.tiles ol li {
	margin: var(--half-margin);
}
.tiles ol.results > :last-child {
	margin-bottom: var(--half-margin);
}

ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}
</style>
