<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main v-if='globals.auth?.isAdmin'>
		<Title>Admin Shit</Title>
		<div class='container'>
			<span class='container-title'>Set Monthly Cost</span>
			<div class='input-field'>
				<input v-model='monthlyCost' placeholder='monthly cost (in USD cents)' autocomplete='off' class='interactable'>
				<button class='interactable' @click='setMonthlyCost'><i class='material-icons'>attach_money</i>Set Value</button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
	<main v-else>
		<Title>Admin Shit</Title>
		<div class='container not-admin'>
			<div class='icon'>
				<i class='kheina-icons'>sword</i> Admin shit, don't worry about it.
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import { createToast, khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import store from '@/globals';

const globals = store();

let monthlyCost: string = "";
function setMonthlyCost() {
	const costs = parseInt(monthlyCost.trim().replace(".", ""));
	khatch(`${host}/v1/config`, {
		method: "PATCH",
		handleError: true,
		body: {
			config: "costs",
			value: {
				costs,
			},
		},
	}).then(response => {
		createToast({
			icon: "done",
			title: "Updated Value!",
			description: "Set value to " + costs,
			color: "green",
			time: 5,
		});
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
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
input:hover {
	color: var(--interact);
}
input:active, input:focus {
	color: var(--textcolor);
}

.container {
	width: 60vw;
	min-width: 600px;
	margin: var(--margin) auto 0;
}
.mobile .container {
	width: 100%;
}

button {
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
}

.container-title {
	position: relative;
	left: var(--margin);
	padding: 0 0 2px;
	display: inline-block;
}

.input-field {
	display: flex;
}
.input-field input {
	margin-right: var(--margin);
	width: 100%;
}
.input-field i {
	margin-right: 0.25em;
}

.not-admin {
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	margin: auto;
}

.not-admin i {
	margin-right: 0.25em;
}

@media only screen and (max-width: 1200px) {
	.container {
		width: auto;
	}
}
</style>
