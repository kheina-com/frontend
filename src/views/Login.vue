<template>
	<div class='bg'/>
	<main>
		<Loading type='block' :isLoading='isLoading'>
			<Title static='center'>Login<template v-slot:super><router-link to='/a/create'>Create</router-link></template></Title>
			<div class='form'>
				<div class='field'>
					<span>Email</span>
					<input type='email' id='email' name='email' v-model='email' class='interactable'>
				</div>
				<div class='field'>
					<span>Password</span>
					<div>
						<router-link to='/a/reset_password'>forgot?</router-link>
						<input type='password' id='password' name='password' v-model='password' autocomplete='off' class='interactable'>
						<button @click='sendLogin' @keydown.enter='sendLogin' class='interactable' v-show='!otpRequired'>Submit »</button>
					</div>
				</div>
				<div class='field' v-if='otpRequired'>
					<span>One-Time Password</span>
					<div>
						<router-link to='/a/remove_otp'>lost?</router-link>
						<input id='otp' name='otp' v-model='otp' autocomplete='off' class='interactable'>
						<button @click='sendLogin' @keydown.enter='sendLogin' class='interactable'>Submit »</button>
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
import { khatch, createToast } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const globals = store();
const router = useRouter();
const route = useRoute();

const email:       Ref<string | null> = ref(null);
const password:    Ref<string | null> = ref(null);
const otp:         Ref<string | null> = ref(null);
const otpRequired: Ref<boolean>       = ref(false);
const isLoading:   Ref<boolean>       = ref(false);

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
	isLoading.value = true;
	khatch(`${host}/v1/account/login`, {
		method: 'POST',
		credentials: 'include',
		body: {
			email:    email.value,
			password: password.value,
			otp:      otp.value,
		},
		errorHandlers: {
			401: r => {
				otp.value = null;
				r.json().then(r => createToast({
					title: "Failed to Login",
					description: r?.error ?? "unknown error occurred",
					dump: r,
				}));
			},
			422: () => otpRequired.value = true,
		},
	}).then(r => r.json())
	.then(r => {
		globals.setAuth(r.token);
		router.push(route.query?.path ? route.query.path.toString() : '/');
	}).catch(() => isLoading.value = false);
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
	position: relative;
}
.field div {
	display: flex;
}
.field a {
	color: var(--subtle);
	font-size: 0.9em;
	position: absolute;
	top: 0;
	right: var(--margin);
}
.field button {
	margin-left: var(--margin);
}
.field:last-child {
	margin-bottom: 0;
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
	/* colors from https://upload.wikimedia.org/wikipedia/commons/f/fd/LGBTQ%2B_rainbow_flag_Quasar_%22Progress%22_variant.svg */
	background: linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #004dff, #750787, #FFFFFF, #FFAFC8, #74D7EE, #613915, #000000, #E40303, #FF8C00) 0% 0% / 1200%;
	animation: 45s linear infinite login;
}

@keyframes login {
	0% { background-position: 0% 0%; }
	100% { background-position: 100% 0%; }
}
</style>
