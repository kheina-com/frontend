<template>
	<main>
		<Loading type='block' :isLoading='isLoading'>
			<Title static='center'>Remove Authenticator</Title>
			<div v-show='!token'>
				<div class='form' v-show='sent == false'>
					<div class='field'>
						<span>Email</span>
						<div>
							<input type='email' id='email' name='email' v-model='email' class='interactable'>
							<button @click='sendLogin' @keydown.enter='sendLogin' class='interactable'>Submit »</button>
						</div>
					</div>
				</div>
				<div v-show='sent == true'>
					<p>check your email for a link to disable your authenticator</p>
				</div>
			</div>
			<div v-show='token'>
				<div v-show='sent == false'>
					<p>attempting to remove authenticator</p>
				</div>
				<div v-show='sent == true'>
					<p>successfully removed authenticator</p>
				</div>
			</div>
		</Loading>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import { ref, type Ref } from 'vue';
import store from '@/globals';
import { useRoute, useRouter } from 'vue-router';
import { khatch, createToast } from '@/utilities';
import { host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';

const globals = store();
const router  = useRouter();
const route   = useRoute();

const email:     Ref<string | null>      = ref(null);
const isLoading: Ref<boolean>            = ref(false);
const sent:      Ref<boolean>            = ref(false);
const token:     Ref<string | undefined> = ref(route.query?.token?.toString());

if (token.value) {
	isLoading.value = true;
	khatch(`${host}/v1/account/otp`, {
		errorMessage: "Failed to remove authenticator",
		method: 'DELETE',
		body: {
			token: token.value,
		},
	}).then(() => {
		createToast({
			icon: "done",
			title: "Email Sent!",
			color: "green",
			time: 10,
		});
		sent.value = true;
	}).finally(() => isLoading.value = false);
}

function sendLogin() {
	isLoading.value = true;
	khatch(`${host}/v1/account/otp/email`, {
		errorMessage: "Failed to send authenticator removal email",
		method: 'POST',
		body: {
			email: email.value,
		},
	}).then(() => {
		createToast({
			icon: "done",
			title: "Removed Authenticator!",
			color: "green",
			time: 10,
		});
		sent.value = true;
	}).finally(() => isLoading.value = false);
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
	word-wrap: normal;
	white-space: nowrap;
}
.field:last-child {
	margin-bottom: 0;
}

p {
	text-align: center;
}
</style>
