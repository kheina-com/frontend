<template>
	<div class='set-controls'>
		<p>
			<a :href='"/p/" + set.first?.post_id' @click.prevent='() => nav(set.first)' :id='setTitle(set.first)'><i class='material-icons'>first_page</i></a>
			<a v-for='(p, i) in reverse(set.neighbors.before)' :href='"/p/" + p.post_id' @click.prevent='() => nav(p)' :id='setTitle(p)'><span v-if='set.neighbors.before.length - i - 1'>{{ set.neighbors.index + i - set.neighbors.before.length + 1 }}</span><i class='material-icons' v-else>navigate_before</i></a>
		</p>
		<router-link :to='`/s/${set.set_id}`' :title='`${set.title} post ${set.neighbors.index + 1} of ${set.count}`'>{{ set.title }}</router-link>
		<p>
			<a v-for='(p, i) in set.neighbors.after' :href='"/p/" + p.post_id' @click.prevent='() => nav(p)' :id='setTitle(p)'><span v-if='i'>{{ set.neighbors.index + i + 2 }}</span><i class='material-icons' v-else>navigate_next</i></a>
			<a :href='"/p/" + set.last?.post_id' @click.prevent='() => nav(set.last)' :id='setTitle(set.last)'><i class='material-icons'>last_page</i></a>
		</p>
	</div>
</template>
<script setup lang='ts'>
import type { PostLike, PostSet } from '@/types/post';
import { useRouter } from 'vue-router';
import store from '@/globals';
import { RefId } from '@/utilities';
import { demarkdown } from '@/utilities/markdown';

defineProps<{ set: PostSet }>();
const router = useRouter();
const globals = store();

function nav(post: PostLike | null | undefined) {
	if (!post || !post.post_id) return;
	globals.postCache = post;
	router.push("/p/" + post.post_id);
}

function reverse(l: any[]): any[] {
	const reversed: any[] = [];
	l.forEach(i =>
		reversed.unshift(i)
	);
	return reversed;
}

// setTitle should be called in the id parameter, as it is async and uses the returned id to set the title later
// ex: <a :id='setTitle(set.last)'>...</a>
function setTitle(post: PostLike | null | undefined): string {
	if (!post) return "";
	const refid = RefId().toString(16);

	demarkdown(post.title || post.post_id).then(title => {
		const e = document.getElementById(refid);
		if (e) e.title = title;
	});

	return refid;
}
</script>
<style scoped>
.set-controls {
	margin: var(--margin) var(--margin) 0;
	display: flex;
	justify-content: space-between;
}
.mobile .set-controls {
	margin: var(--margin) var(--margin) 0;
}
.set-controls:first-child {
	margin-top: 0;
	margin-bottom: var(--margin);
}
.set-controls p {
	display: flex;
	align-items: center;
}
.set-controls p a {
	margin: 0 var(--half-margin);
}
.set-controls p a i {
	display: block;
}
.set-controls p > :last-child {
	margin-right: 0;
}
.set-controls p > :first-child {
	margin-left: 0;
}
.disabled {
	opacity: 50%;
	pointer-events: none;
}
</style>
