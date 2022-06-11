<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<h3 class='swagger'>
			<a :href='`https://${environment != "prod" ? "dev." : ""}kheina.com/docs`' target='_blank'>swagger docs</a>
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
							<a :href='`https://github.com/kheina-com/${service}/commit/${hash}`' target='_target'><code>{{hash || 'abcdef0'}}</code></a>
						</Loading>
					</td>
				</tr>
			</table>
		</div>
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { accountHost, configHost, environment, postsHost, tagsHost, uploadHost, usersHost } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';


export default {
	name: 'Version',
	components: {
		Loading,
		ThemeMenu,
	},
	data() {
		return {
			versioning: {
				// key must be the repo name on github
				frontend: __SHORT_COMMIT_HASH__,
				account: null,
				configs: null,
				posts: null,
				tagger: null,
				uploader: null,
				users: null,
			},
			environment,
		}
	},
	created() {
		khatch(`${accountHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.account = response.headers.get('kh-hash'))
		.catch(() => { });

		khatch(`${configHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.configs = response.headers.get('kh-hash'))
		.catch(() => { });

		khatch(`${postsHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.posts = response.headers.get('kh-hash'))
		.catch(() => { });

		khatch(`${tagsHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.tagger = response.headers.get('kh-hash'))
		.catch(() => { });

		khatch(`${uploadHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.uploader = response.headers.get('kh-hash'))
		.catch(() => { });

		khatch(`${usersHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => this.versioning.users = response.headers.get('kh-hash'))
		.catch(() => { });

	},
	computed: {
		cookie() {
			try
			{
				const c = authCookie(this.content);
				if (c)
				{ delete c.token; }
				return '```json\n' + JSON.stringify(c, null, 4) + '\n```';
			}
			catch (e)
			{
				console.error(e);
				return 'could not decode token';
			}
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
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
	margin: 0 0 25px;
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
	color: var(--icolor);
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