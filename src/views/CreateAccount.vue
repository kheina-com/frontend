<template>
	<main>
		<Loading type='block' :isLoading='isLoading'>
			<Title static='center'>Create Account</Title>
			<div class='form'>
				<div class='field'>
					<span>Email</span>
					<input ref='email' type='email' id='email' name='email' value='' class='interactable'>
				</div>
				<div class='final-field'>
					<span>Name</span>
					<div>
						<input ref='name' type='name' id='name' name='name' value='' autocomplete='off' class='interactable'>
						<button @click='sendCreate' class='interactable'>Submit »</button>
					</div>
				</div>
			</div>
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
import ThemeMenu from '@/components/ThemeMenu.vue';


export default {
	name: 'CreateAccount',
	components: {
		ThemeMenu,
		Loading,
		Title,
	},
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
			typingTimer: null,
			typingInterval: 1000,
			passwordIcon: null,
			passwordColor: null,
			passwordRepeatClass: null,
			queriedPasswords: { },
		};
	},
	methods: {
		sendCreate() {
			this.isLoading = true;
			khatch(`${accountHost}/v1/create`, {
				method:'POST',
				body: {
					name: this.$refs.name.value.trim(),
					email: this.$refs.email.value.trim(),
				},
			})
			.then(response => {
				if (response.status < 300)
				{ this.$router.push('/account/finalize'); }
				else
				{
					response.json().then(r => {
						if (response.status === 400)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 401)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 404)
						{ this.$store.commit('error', r.error); }
						else
						{ this.$store.commit('error', apiErrorMessage, r); }
					});
				}
				this.isLoading = false;
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
	background: var(--main);
	position: relative;
	padding: 25px;
}
input {
	display: block;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	width: 100%;
}
input:hover {
	color: var(--icolor);
}
input:active, input:focus {
	color: var(--textcolor);
}

.form {
	max-width: 25em;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin: auto;
}
.form span {
	position: relative;
	left: 25px;
	padding: 0 0 0.1em;
	display: block;
}

.field {
	width: 100%;
	margin-bottom: 25px;
}

.final-field {
	width: 100%;
}
.final-field div {
	display: flex;
}
.final-field input {
	margin-right: 25px;
}

button {
	word-wrap: normal;
	white-space: nowrap;
}
</style>