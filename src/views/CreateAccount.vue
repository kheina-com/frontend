<template>
	<main v-if='!isError'>
		<Loading :lazy='false' :isLoading='isLoading'>
		<Title static='center'>Create Account</Title>
		<form action='' method='post' enctype='multipart/form-data' class='centerx'>
			<div>
				<span>Name</span>
				<input ref='name' type='name' id='name' name='name' value='' autocomplete='off' class='interactable text'>
			</div>
			<div>
				<span>Email</span>
				<input ref='email' type='email' id='email' name='email' value='' class='interactable text'>
			</div>
			<Submit :onClick='sendCreate'>Submit »</Submit>
		</form>
		</Loading>
		<ThemeMenu />
	</main>
	<Error :dump='errorDump' :message='errorMessage' v-else/>
</template>

<script>
import { ref } from 'vue';
import { apiErrorMessage, accountHost } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Submit from '../components/Submit.vue'

export default {
	name: 'CreateAccount',
	setup() {
		const email = ref(null);
		const name = ref(null);

		return {
			email,
			name,
		};
	},
	data() {
		return {
			isLoading: false,
			errorMessage: null,
			errorDump: null,
			typingTimer: null,
			typingInterval: 1000,
			passwordIcon: null,
			passwordColor: null,
			passwordRepeatClass: null,
			queriedPasswords: { },
		};
	},
	components: {
		Submit,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
	},
	computed: {
		isError()
		{ return this.errorMessage !== null; },
	},
	methods: {
		sendCreate() {
			this.isLoading = true;
			fetch(`${accountHost}/v1/create`,
				{
					method:'POST',
					credentials: 'include',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						name: this.$refs.email.value,
						email: this.$refs.email.value,
					}),
				})
				.then(response => {
					if (response.status < 300)
					{ this.$router.push('/account/finalize'); }
					else
					{
						response.json()
							.then(r => {
								this.errorMessage = apiErrorMessage;
								this.errorDump = r;
							});
					}
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bgcolor);
	position: relative;
	padding: 25px;
	overflow: hidden;
	display: block;
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
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	background: var(--boxcolor);
	color: var(--textcolor);
	font-size: 1em;
	padding: 1px 3px;
}
form
{
	width: 800px;
	max-width: calc(100% - 50px);
	display: flex;
	flex-direction: column;
	align-items: end;
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
i
{
	position: absolute;
	right: 10px;
	display: inline-block;
	pointer-events: none;
	margin-top: 7px;
	height: 24px;
}
input#hide-password
{ display: none; }

form
{ max-width: 350px; }
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

.warn {
	border-color: var(--warning);
}

.error {
	border-color: var(--error);
}
</style>