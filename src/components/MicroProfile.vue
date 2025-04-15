<template>
	<a ref='profile' :href='`/${handle}`' class='profile' @click.stop.prevent='nav'>
		<Loading :isLoading='iconLoading' class='image'>
			<UserIcon :handle='handle' :post='icon' v-model:isLoading='iconLoading' class='profile-user-icon'/>
		</Loading>
	</a>
</template>
<script setup lang='ts'>
import { type User } from '@/types/user'
import { onMounted, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { demarkdown } from '@/utilities/markdown';
import Loading from '@/components/Loading.vue';
import UserIcon from '@/components/UserIcon.vue';

const router = useRouter();
const user = defineProps<User>();
const iconLoading: Ref<boolean> = ref(true);
const profile = ref<HTMLAnchorElement | null>(null) as Ref<HTMLAnchorElement>;

onMounted(() => {
	if (user.name) {
		demarkdown(user.name).then(name =>
			profile.value.title = name
		)
	}
	else {
		profile.value.title = "@" + user.handle;
	}
});

function nav() {
	router.push("/" + user.handle);
}
</script>
<style scoped>
.profile-user-icon {
	width: 1.5em;
	height: 1.5em;
	pointer-events: all;
	border-radius: var(--border-radius);
}
.profile {
	display: block;
	border-radius: var(--border-radius);
	border-radius: calc(var(--border-radius) + 0.25em);
	cursor: pointer;
	pointer-events: all;
	padding: 0.25em;
	background: var(--bg2color);
}
a.profile:hover {
	z-index: 1;
	background: var(--bg1color);
}
</style>
