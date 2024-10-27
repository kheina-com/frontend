<template>
	<main>
		<ol class='results'>
			<p v-if='users?.length === 0' style='text-align: center'>No users found!</p>
			<li v-for='user in users' v-else>
				<router-link :to='`/${user.handle}`' class='interactable'>
					<div>
						<Profile v-bind='user' :link='false' class='profile'/>
						<div>
							<p class='user-field'><i class='material-icons'>public</i><Markdown :content='user?.website'/></p>
							<p class='user-field'><i class='material-icons'>schedule</i><span>Joined <Timestamp :datetime='user?.created'/></span></p>
						</div>
					</div>
					<div>
						<Markdown :content='user?.description'/>
					</div>
				</router-link>
			</li>
		</ol>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import store from '@/globals';
import { khatch } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Timestamp from '@/components/Timestamp.vue';

const users: Ref<FullUser[] | null> = ref(null);

onMounted(() => {
	khatch(`${host}/v1/users/all`, {
		handleError: true,
	}).then(r => r.json())
	.then(r => {
		console.log(r);
		console.log(Object.values(r));
		users.value = r;
	});
});
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
ol li a {
	display: block;
}
ol li div {
	display: flex;
}
ol li div div {
	flex-direction: column;
}

ol > :last-child {
	margin-bottom: 0;
}

.user-field {
	display: flex;
	align-items: center;
	color: var(--textcolor);
}
.user-field span button {
	color: var(--textcolor);
}
.user-field span button:hover {
	color: var(--interact);
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
</style>
