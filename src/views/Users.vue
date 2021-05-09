<template>
	<main v-if='!isError'>
		<ol class='results'>
			<p v-if='users?.length === 0' style='text-align: center'>No users found!</p>
			<li v-for='user in users' v-else>
				<div>
					<Profile v-bind='user'/>
				</div>
			</li>
		</ol>
		<ThemeMenu />
	</main>
	<main v-else>
		<Error :dump='errorDump' :message='errorMessage' />
		<ThemeMenu />
	</main>
</template>

<script>
import { khatch } from '@/utilities';
import { apiErrorMessage, usersHost } from '@/config/constants';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Profile from '@/components/Profile.vue';


export default {
	name: 'Tags',
	components: {
		ThemeMenu,
		Error,
		Profile,
	},
	data() {
		return {
			users: null,
			errorDump: null,
			errorMessage: null,
		}
	},
	mounted() {
		khatch(`${usersHost}/v1/all_users`)
			.then(response => {
				response.json().then(r => {
					console.log(r);
					console.log(Object.values(r));
					if (response.status < 300)
					{ this.users = r; }
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});
	},
	computed: {
		isError()
		{ return this.errorMessage !== null; },
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
.results {
	display: flex;
	flex-direction: column;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol > :last-child {
	margin-bottom: 0;
}
</style>