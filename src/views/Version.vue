<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<h3 class='swagger'>
			<a :href='`https://${environment != "prod" ? "dev." : ""}kheina.com/docs`' target='_blank'>swagger docs</a>
		</h3>
		<div class='clicky-things'>
			<table>
				<tr v-for='(hash, service) in versioning'>
					<td>{{service}}</td>
					<td>:</td>
					<td>{{hash}}</td>
				</tr>
			</table>
		</div>
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { accountHost, configHost, environment, postsHost, tagsHost, uploadHost, usersHost } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';


export default {
	name: 'Version',
	components: {
		ThemeMenu,
	},
	data() {
		return {
			versioning: {
				account: null,
				configs: null,
				posts: null,
				tags: null,
				uploader: null,
				users: null,
			},
			environment,
		}
	},
	created() {
		khatch(`${postsHost}/`, {
			// errorMessage: 'Error occurred while retrieving post deployment hash.',
			method: 'GET',
		})
		.then(response => {
			console.log(response.headers);
			this.versioning.posts = response.headers.get('kh-hash');
		})
		.catch(() => { });

		var xhr = new XMLHttpRequest();

		xhr.open('GET', `${postsHost}/`, true);            // Relative path of resource

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				console.log(xhr.getAllResponseHeaders());
			}
		}

		xhr.send(null);
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

.clicky-things div div {
	margin: 0.5em 0;
}

.token {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] 25px [preview-start] 1fr [preview-end];
	margin: 0 auto;
	min-width: 1000px;
	position: relative;
}
.token textarea {
	grid-area: editor;
	resize: vertical;
	line-height: 1.5;
}
.token div {
	grid-area: preview;
}
</style>