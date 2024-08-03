<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<h3 class='swagger'>
			<a :href='`${host}/docs`' target='_blank'>swagger docs</a>
		</h3>
		<div class='clicky-things'>
			<table>
				<tr class='header'>
					<td>Service</td>
					<td/>
					<td>Hash</td>
				</tr>
				<tr v-for='(hash, service) in versioning'>
					<td>{{service}}</td>
					<td>:&nbsp;</td>
					<td>
						<Loading :isLoading='hash === null'>
							<a :href='`https://github.com/kheina-com/${service}/commit/${hash}`' target='_target'><code>{{hash || "xxxxxxx"}}</code></a>
						</Loading>
					</td>
				</tr>
			</table>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { khatch } from '@/utilities';
import { host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const versioning: Ref<{ [k: string]: string | null }> = ref({
	// key must be the repo name on github
	frontend: __SHORT_COMMIT_HASH__,
	backend: null,
});

khatch(host)
.then(response => versioning.value.backend = response.headers.get('kh-hash'))
.catch(() => { });
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
main > div {
	margin: 0.5em 0;
}
main > :first-child {
	margin-top: 0;
}
main > :last-child {
	margin-bottom: 0;
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

.swagger {
	text-align: center;
}

.clicky-things {
	display: flex;
	justify-content: space-around;
}

.header {
	text-align: center;
}
</style>