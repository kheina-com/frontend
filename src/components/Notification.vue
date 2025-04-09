<template>
	<div class='notification'>
		<a :href='target' class='link' @click.prevent='nav' v-if='target'/>
		<div class='user' v-if='notification.type === "user"'>
			<div class='content'>
				<div class='interaction follow' v-if='notification.event === "follow"'>
					<i class='material-icons-round'>person_add_alt</i>
					<span v-translate:followed_by>followed by</span>
				</div>
				<Profile v-bind='notification.user' :link='false'/>
			</div>
		</div>
		<div class='post' v-else-if='notification.type === "post"'>
			<div class='content'>
				<div class='interaction follow' v-if='notification.event === "mention"'>
					<i class='material-icons'>alternate_email</i>
					<!-- <i class='material-icons-outline'>feedback</i> -->
					<span v-translate:followed_by>mentioned you</span>
				</div>
				<div class='header-block'>
					<Score :score='notification.post.score' :postId='notification.post.post_id' :disabled='notification.post.locked'/>
					<div class='locked' v-if='notification.post.locked'><p>This post has been locked.</p></div>
					<div class='post-header' v-else>
						<h2 v-if='notification.post.title'>
							<Markdown :content='notification.post.title' inline class='title' lazy/>
						</h2>
						<Profile v-bind='notification.post.user'/>
					</div>
				</div>
				<Markdown :content='notification.post.description' superconcise/>
			</div>
			<div class='_thumbnail' v-if='notification.post.media'>
				<Thumbnail :key='notification.post.post_id' :media='notification.post.media' :size='400'/>
			</div>
		</div>
		<div class='post' v-else-if='notification.type === "interact"'>
			<div class='content'>
				<div class='interaction fav' v-if='notification.event === "favorite"'>
					<i class='material-icons-round'>favorite</i>
					<span v-translate:favorited_by>favorited by</span>
					<MicroProfile v-bind='notification.user'/>
				</div>
				<div class='interaction reply' v-else-if='notification.event === "reply"'>
					<i class='material-icons'>reply</i>
					<span v-translate:reply_from>reply from</span>
					<MicroProfile v-bind='notification.user'/>
				</div>
				<div class='interaction repost' v-else-if='notification.event === "repost"'>
					<i class='material-icons'>repeat</i>
					<span v-translate:reposted_by>reposted by</span>
					<MicroProfile v-bind='notification.user'/>
				</div>
				<div class='header-block'>
					<Score :score='notification.post.score' :postId='notification.post.post_id' :disabled='notification.post.locked'/>
					<div class='locked' v-if='notification.post.locked'><p>This post has been locked.</p></div>
					<div class='post-header' v-else>
						<h2 v-if='notification.post.title'>
							<Markdown :content='notification.post.title' inline class='title' lazy/>
						</h2>
						<Profile v-bind='notification.post.user'/>
					</div>
				</div>
				<Markdown :content='notification.post.description' superconcise/>
			</div>
			<div class='_thumbnail' v-if='notification.post.media'>
				<Thumbnail :key='notification.post.post_id' :media='notification.post.media' :size='400'/>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import type { Notification } from '@/types/notifications';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import store from '@/globals';
import Score from '@/components/Score.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Thumbnail from '@/components/Thumbnail.vue';
import MicroProfile from '@/components/MicroProfile.vue';

const globals = store();
const router = useRouter();
const notification = defineProps<Notification>();
const target = computed(() => {
	switch (notification.type) {
	case "interact":
	case "post":
		return "/p/" + notification.post.post_id;
	case "user":
		return "/" + notification.user.handle;
	}
});

function nav() {
	if (!target.value) return;

	if (notification.type === "post" || notification.type === "interact") {
		globals.postCache = notification.post;
	}

	router.push(target.value);
}
</script>
<style scoped>
.notification {
	overflow: hidden;
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	padding: var(--margin);
	align-items: flex-start;
	position: relative;
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}

.link {
	top: 0;
	left: 0;
	position: absolute;
	width: 100%;
	height: 100%;
}
.notification:has(> .link) {
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.notification:has(> .link):hover {
	border-color: var(--interact);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}

.post {
	display: flex;
	width: 100%;
	justify-content: space-between;
}

.header-block {
	display: flex;
	position: relative;
	pointer-events: none;
}

.post-header {
	margin-bottom: var(--margin);
	display: flex;
	flex-flow: column;
	align-items: flex-start;
	--bg2color: var(--bg1color);
}
.post-header h2 {
	font-size: 1.5em;
	font-weight: normal;
	margin: 0;
}
.post .markdown {
	overflow: hidden;
}
.score {
	margin: -0.5em 0.5em 0 -0.5em;
	--bg2color: var(--bg1color);
}
.mobile .score {
	margin: var(--neg-margin) 0 0 var(--neg-margin);
}

.thumbnail {
	max-height: 10em;
}

.interaction {
	display: flex;
	align-items: center;
	position: relative;
	pointer-events: none;
	margin: -0.35em 0.35em 0.35em -0.35em;
}
.interaction span {
	margin: 0 0.25em;
}
.interaction .profile {
	margin-right: -0.75em;
}
.interaction :last-child.profile {
	margin-right: 0;
}

.fav i {
	color: var(--red);
}
.reply i, .follow i, .mention i {
	color: var(--blue);
}
.repost i {
	color: var(--green);
}
</style>
