<template>
	<a :href='`/${handle}`' class='profile' :title='verifiedDescription' v-if='link && !isLoading' @click.stop.prevent='navigateToUser'>
		<div class='inner'>
			<Loading :isLoading='isLoading || iconLoading' class='image'>
				<UserIcon :handle='handle' :post='icon' v-model:isLoading='iconLoading' class='profile-user-icon'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'>
					<Markdown :content='name' inline lazy/>
				</Loading>
				<Loading :isLoading='isLoading' span class='handle'>
					<p>
						<i :class='iconClass' v-if='verified'>{{iconName}}</i>@{{handle || 'handle'}}
					</p>
				</Loading>
			</div>
		</div>
	</a>
	<div class='profile' :title='verifiedDescription' v-else>
		<div class='inner'>
			<Loading :isLoading='isLoading || iconLoading' class='image'>
				<UserIcon :handle='handle' :post='icon' v-model:isLoading='iconLoading' class='profile-user-icon'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'>
					<Markdown :content='name' inline lazy/>
				</Loading>
				<Loading :isLoading='isLoading' span class='handle'>
					<p>
						<i :class='iconClass' v-if='verified'>{{iconName}}</i>@{{handle || 'handle'}}
					</p>
				</Loading>
			</div>
		</div>
	</div>
</template>
<script setup lang='ts'>
import { computed, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import Loading from '@/components/Loading.vue';
import UserIcon from '@/components/UserIcon.vue';
import Markdown from '@/components/Markdown.vue';

const router = useRouter();
const props = withDefaults(defineProps<{
	name?:      string,
	handle?:    string,
	icon?:      string | null,
	isLoading?: boolean,
	link?:      boolean,
	verified?:  string | null,
}>(), {
	name: "user name",
	icon: null,
	isLoading: false,
	link: true,
	verified: null,
});

const iconLoading: Ref<boolean> = ref(true);

const iconClass = computed(() => {
	switch (props.verified) {
		case "mod" :
			return "material-icons";
		case "admin" :
			return "kheina-icons";
		default :
			return "material-icons-round";
	}
});

const iconName = computed(() => {
	switch (props.verified) {
		case "mod" :
			return "verified_user";
		case "admin" :
			return "sword";
		default :
			return "brush";
	}
});

const verifiedDescription = computed(() => {
	switch (props.verified) {
		case "verified" :
		case "artist" :
			return `@${props.handle} is a verified artist`;
		case "mod" :
			return `@${props.handle} is a moderator`;
		case "admin" :
			return `@${props.handle} is an admin`;
		default :
			return `@${props.handle}`;
	}
});

function navigateToUser() {
	router.push("/" + props.handle);
}
</script>
<style scoped>
.profile-user-icon {
	width: 3em;
	height: 3em;
	border-radius: var(--border-radius);
}
.profile {
	display: block;
	margin-right: auto;
	padding: 0.25em 0.5em 0.25em 0.25em;
	margin: -0.25em;
	border-radius: var(--border-radius);
	border-radius: calc(var(--border-radius) + 0.25em) var(--border-radius) var(--border-radius) calc(var(--border-radius) + 0.25em);
}
a.profile:hover {
	background: var(--bg1color);
}
.profile .inner {
	display: flex;
	align-items: center;
}
.profile .image, img {
	border-radius: var(--border-radius);
}
.profile .image, .profile .image img {
	display: block;
	width: 3em;
	height: 3em;
}
.profile .user {
	display: inline-block;
	margin: 0 0 0 0.5em;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.profile .name {
	font-size: 1.2em;
	margin: 0 0 0.1em;
	display: flex;
	align-items: center;
}
.profile .handle p {
	color: var(--subtle);
	display: flex;
	align-items: center;
}
i {
	display: inline-block;
	font-size: 1em;
	margin-right: 0.25em;
	color: var(--textcolor);
}
i.kheina-icons {
	margin-right: 0.35em;
}
</style>
