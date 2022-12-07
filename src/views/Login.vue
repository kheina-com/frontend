<template>
	<main>
		<Loading :lazy='false' :isLoading='isLoading'>
		<Title static='center'>Login<template v-slot:super><router-link to='/account/create'>Create</router-link></template></Title>
		<form action='' method='post' enctype='multipart/form-data' class='centerx'>
			<div>
				<span>Email</span>
				<input ref='email' type='email' id='email' name='email' value='' class='interactable text'>
			</div>
			<div>
				<span>Password</span>
				<div style='display: flex'>
					<input ref='password' type='password' id='password' name='password' value='' autocomplete='off' class='interactable text password'>
					<Submit :onClick='sendLogin'>Submit »</Submit>
				</div>
			</div>
		</form>
		</Loading>
		<ThemeMenu/>
	</main>
</template>

<script>
import { ref } from 'vue';
import { khatch } from '@/utilities';
import { apiErrorMessage, accountHost } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import Sidebar from '@/components/Sidebar.vue';
import Submit from '@/components/Submit.vue';

export default {
	name: 'Login',
	setup() {
		const email = ref(null);
		const password = ref(null);

		return {
			email,
			password,
		};
	},
	data() {
		return {
			isLoading: false,
		};
	},
	components: {
		Submit,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Media,
	},
	methods: {
		sendLogin() {
			this.isLoading = true;
			khatch(`${accountHost}/v1/login`, {
					method: 'POST',
					credentials: 'include',
					body: {
						email: this.$refs.email.value,
						password: this.$refs.password.value,
					},
				})
				.then(response => {
					response.json().then(r => {
						if (response.status < 400 && r.token_data.token.length > 10)
						{
							this.$store.commit('setAuth', r.token_data);
							this.$router.push(this.$route.query?.path ? this.$route.query.path : '/');
						}
						else if (response.status === 400)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 401)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 404)
						{ this.$store.commit('error', r.error); }
						else
						{ this.$store.commit('error', apiErrorMessage, r); }
					});
				})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
form div {
	width: 100%;
}
form .text
{
	width: 100%;
	color: var(--textcolor);
	padding: 0.5em;
}
form .text:hover
{ color: var(--icolor); }
form .text:active, form .text:focus
{ color: var(--textcolor); }
input
{
	display: inline-block;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	padding: 1px 3px;
}
form
{
	width: 50em;
	max-width: calc(100% - 50px);
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin: 0 auto;
}
form span
{
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
form .maxrating, form .integratedsearch
{
	margin: -14px 0 9px;
	padding: 0.5em 0;
	display: inline-block;
	width: calc(100% - 80px);
	line-height: 3;
}
form .maxrating input, form .integratedsearch input, form .submit input
{
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
form input
{ margin: 0 0 25px; }
form p
{ margin-left: 25px; }

form
{ max-width: 22em; }
form input.submit
{ float: right; }
form input#passwordRepeat
{
	width: 225px;
	width: calc(100% - 125px);
}
form input.valid:active, form input.valid:focus
{ border-color: var(--valid); }
form input.error:active, form input.error:focus
{ border-color: var(--error); }

label.hide-password
{
	position: absolute;
	right: 0;
	margin: 0.5em;
	height: 24px;
}
label.hide-password svg
{ height: 24px; }
div#password-pwned
{
	position: absolute;
	right: 10px;
	display: inline-block;
	/* pointer-events: none; */
	margin-top: 7px;
	height: 24px;
}
input#hide-password
{ display: none; }
div#password-pwned svg
{ height: 24px; }
.password {
	margin: 0 25px 0 0;
}
</style>