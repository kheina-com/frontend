<template>
	<main>
		<Loading type='block' :isLoading='isLoading'>
			<Title static='center'>Create Account</Title>
			<div class='form'>
				<div class='field'>
					<span>Email</span>
					<input ref='email' type='email' id='email' name='email' value='' class='interactable text'>
				</div>
				<div class='final-field'>
					<span>Name</span>
					<div>
						<input ref='name' type='name' id='name' name='name' value='' autocomplete='off' class='interactable text'>
						<button @click='sendCreate' class='interactable'>Submit »</button>
					</div>
				</div>
			</div>
		</Loading>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { khatch } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import store from '@/globals';

const router = useRouter();
const globals = store();
const email = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const name = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const isLoading: Ref<boolean> = ref(false);

function sendCreate() {
	isLoading.value = true;
	khatch(`${host}/v1/account/create`, {
		method: "POST",
		handleError: true,
		body: {
			name: name.value.value.trim(),
			email: email.value.value.trim(),
		},
	}).then(() =>
		router.push("/a/finalize")
	)
	.finally(() =>
		isLoading.value = false
	);
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
</style>
