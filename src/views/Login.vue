<template>
	<div class='bg'/>
	<main>
		<Loading type='block' :isLoading='isLoading'>
			<Title static='center'>Login<template v-slot:super><router-link to='/a/create'>Create</router-link></template></Title>
			<div class='form'>
				<div class='field'>
					<span>Email</span>
					<input ref='email' type='email' id='email' name='email' value='' class='interactable'>
				</div>
				<div class='final-field'>
					<span>Password</span>
					<div>
						<input ref='password' type='password' id='password' name='password' value='' autocomplete='off' class='interactable'>
						<button @click='sendLogin' class='interactable'>Submit »</button>
					</div>
				</div>
			</div>
		</Loading>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { onUnmounted, ref, type Ref } from 'vue';
import store from '@/globals';
import { useRoute, useRouter } from 'vue-router';
import { khatch } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const email = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const password = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const globals = store();
const router = useRouter();
const route = useRoute();
let isLoading = false;
// mounted() {
// 	const colors = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#24408E', '#732982', '#FFFFFF', '#FFAFC8', '#74D7EE', '#613915', '#000000', '#E40303', '#FF8C00'].map(e => e + '20').join(', ');
// 	document.body.style.background = 'linear-gradient(90deg,' + colors + ')';
// 	document.body.style.backgroundSize = `${100 * 12}%`;
// 	document.body.style.animation = 'login 10s linear infinite';
// };
onUnmounted(() => {
	document.body.style.cssText = "";
});
function sendLogin() {
	isLoading = true;
	khatch(`${host}/v1/account/login`, {
		method: 'POST',
		credentials: 'include',
		body: {
			email: email.value.value,
			password: password.value.value,
		},
	})
	.then(response => {
		response.json().then(r => {
			if (response.status < 400 && r.token.token.length > 10) {
				globals.setAuth(r.token);
				router.push(route.query?.path ? route.query.path.toString() : '/');
			}
			else if (response.status === 400)
			{ globals.setError(r.error); }
			else if (response.status === 401)
			{ globals.setError(r.error); }
			else if (response.status === 404)
			{ globals.setError(r.error); }
			else
			{ globals.setError(apiErrorMessage, r); }
		});
	})
	.catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
	});
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
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
	color: var(--interact);
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
	left: var(--margin);
	padding: 0 0 0.1em;
	display: block;
}

.field {
	width: 100%;
	margin-bottom: var(--margin);
}

.final-field {
	width: 100%;
}
.final-field div {
	display: flex;
}
.final-field input {
	margin-right: var(--margin);
}

button {
	word-wrap: normal;
	white-space: nowrap;
}
.bg {
	position: fixed;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	width: max(200vw, 200vh);
	height: max(200vw, 200vh);
	rotate: -30deg;
	opacity: 20%;
	pointer-events: none;
	background: linear-gradient(90deg, #000000, #E40303, #FF8C00, #FFED00, #008026, #24408E, #732982, #FFFFFF, #FFAFC8, #74D7EE, #613915, #000000, #E40303) 0% 0% / 1200%;
	animation: 45s linear infinite login;
}

@keyframes login {
	0% { background-position: 0% 0%; }
	100% { background-position: 100% 0%; }
}
</style>