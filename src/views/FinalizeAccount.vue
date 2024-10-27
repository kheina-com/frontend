<template>
	<main>
		<Loading type='block' :isLoading='isLoading' v-if='$route.query.token'>
			<Title static='center'>Create Account</Title>
			<div class='form'>
				<div class='field'>
					<div class='field-title'>
						<span>
							Name
							<i class='material-icons' title='the name that will be displayed on the site. can be anything you want.'>help_outline</i>
						</span>
					</div>
					<input ref='name' type='name' id='name' name='name' placeholder='display name' class='interactable'>
				</div>
				<div class='field'>
					<div class='field-title'>
						<span>
							@handle
							<i class='material-icons' title='your unique identifier across the site. determines your URL.'>help_outline</i>
						</span>
					</div>
					<input ref='handle' type='handle' id='handle' name='handle' placeholder='handle' class='interactable'>
				</div>
				<div class='final-field'>	
					<div class='field-title'>
						<span>
							Password
							<i class='material-icons' title='must be at least 10 characters.'>help_outline</i>
						</span>
					</div>
					<input ref='password' type='password' id='password' name='password' placeholder='password' autocomplete='off' class='interactable password'>
					<div class='pwned'>
						<i class='material-icons' ref='pwnedIcon' :style='`color: let(--${passwordColor})`'>{{passwordIcon}}</i>
						<span ref='pwnedDescription'></span>
					</div>
					<div class='submit-field'>
						<input ref='passwordRepeat' type='password' id='passwordRepeat' name='passwordRepeat' placeholder='re-enter password' autocomplete='off' :class='`interactable ${passwordRepeatClass}`'>
						<button @click='sendFinalize' class='interactable'>Submit »</button>
					</div>
				</div>
			</div>
		</Loading>
		<p style='text-align: center' v-else>
			Please check your email for a link to finish creating your account.
		</p>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/globals';
import { khatch, sha1 } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const route = useRoute();
const router = useRouter();
const globals = store();
const name = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const handle = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const password = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const passwordRepeat = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const pwnedDescription = ref<HTMLSpanElement | null>(null) as Ref<HTMLSpanElement>;

const isLoading = ref<boolean>(false);
const typingInterval: number = 1000;
const passwordIcon: Ref<string | null> = ref(null);
const passwordColor: Ref<string | null> = ref(null);
const passwordRepeatClass: Ref<string | null> = ref(null);
const queriedPasswords: { [k: string]: boolean } = { };

let typingTimer: number | null = null;

onMounted(() => {
	password.value.addEventListener("blur", checkPassword);
	password.value.addEventListener("input", checkPassword);
	password.value.addEventListener("keyup", checkPassword);
	password.value.addEventListener("paste", checkPassword);
	passwordRepeat.value.addEventListener("blur", checkPasswordRepeat);
	passwordRepeat.value.addEventListener("input", checkPasswordRepeat);
	passwordRepeat.value.addEventListener("keyup", checkPasswordRepeat);
	passwordRepeat.value.addEventListener("paste", checkPasswordRepeat);
});

function sendFinalize() {
	isLoading.value = true;
	khatch(`${host}/v1/account/finalize`, {
		method:"POST",
		errorMessage: "an error occurred while creating your account",
		body: {
			token: route.query.token,
			name: name.value.value,
			handle: handle.value.value,
			password: password.value.value,
		},
	}).then(() =>
		router.push("/a/login")
	).finally(() =>
		isLoading.value = false
	);
}

function checkPassword() {
	passwordRepeat.value.style.borderColor = "";

	if (typingTimer) clearTimeout(typingTimer);

	if (!password.value.value) {
		passwordRepeat.value.placeholder = "re-enter password";
		passwordIcon.value = "";
		pwnedDescription.value.innerText = "";
		return;
	}

	passwordRepeat.value.placeholder = "re-enter password".substring(0, password.value.value.length);

	if (password.value.value.length < 10) {
		passwordIcon.value = "report";
		passwordColor.value = "error";
		pwnedDescription.value.innerText = "Password invalid, passwords must be 10 characters or longer";
	}
	else if (queriedPasswords.hasOwnProperty(password.value.value)) {
		if (queriedPasswords[password.value.value]) {
			passwordColor.value = passwordIcon.value = "warning";
			pwnedDescription.value.innerText = "This password has been compromised";
		}
		else {
			passwordIcon.value = "check_circle_outline";
			passwordColor.value = "valid";
			pwnedDescription.value.innerText = "This password has not been compromised!";
		}
	}
	else {
		passwordIcon.value = "timer";
		passwordColor.value = "subtle";
		pwnedDescription.value.innerText = "Checking password...";
		typingTimer = setTimeout(() => hasPasswordBeenPwned(password.value.value), typingInterval);
	}
}

function checkPasswordRepeat() {
	if (password.value.value) {
		if (password.value.value === passwordRepeat.value.value)
		{ passwordRepeatClass.value = "valid"; }
		else
		{ passwordRepeatClass.value = "error"; }
	}
	else
	{ passwordRepeatClass.value = null; }
}

function hasPasswordBeenPwned(password: string) {
	const hash = sha1(password);

	fetch("https://api.pwnedpasswords.com/range/".concat(hash.substring(0, 5)))
	.then(r => r.text())
	.then(hashes => {
		if (hashes.split("\r\n").map(x => x.substring(0,35)).includes(hash.substring(5,40).toUpperCase())) {
			passwordColor.value = passwordIcon.value = "warning";
			pwnedDescription.value.innerText = "This password has been compromised";
			queriedPasswords[password] = true;
		}
		else {
			passwordIcon.value = "check_circle_outline";
			passwordColor.value = "valid";
			pwnedDescription.value.innerText = "This password has not been compromised!";
			queriedPasswords[password] = false;
		}
	})
	.catch(error => console.error(error));
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
	display: flex;
}
i {
	font-size: 1.2em;
	margin-left: 0.25em;
}

.field {
	width: 100%;
	margin-bottom: var(--margin);
}

.final-field {
	width: 100%;
}

.pwned {
	display: flex;
	align-items: center;
	margin-bottom: 1em;
}
.pwned span {
	left: 0.25em;
}
.password {
	margin-bottom: 1em;
}

.submit-field {
	width: 100%;
	display: flex;
}
.submit-field input {
	margin-right: var(--margin);
}

button {
	word-wrap: normal;
	white-space: nowrap;
}

.valid {
	border-color: var(--valid);
}
.error {
	border-color: var(--error);
}
</style>
