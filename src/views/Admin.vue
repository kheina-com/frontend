<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main v-if='$store.state.auth?.isAdmin'>
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

<script>
import { createToast, khatch } from '@/utilities';
import { configHost } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';

export default {
	name: 'Admin',
	components: {
		ThemeMenu,
		Title,
	},
	data() {
		return {
			monthlyCost: null,
		};
	},
	methods: {
		setMonthlyCost() {
			const monthlyCost = parseInt(this.monthlyCost.trim());
			khatch(`${configHost}/v1/update_config`, {
				handleError: true,
				method: 'POST',
				body: {
					config: 'costs',
					value: {
						costs: monthlyCost
					},
				},
			}).then(response => {
				createToast({
					icon: 'done',
					title: 'Updated Value!',
					description: 'Set value to ' + monthlyCost,
					color: 'green',
					time: 5,
				});
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
	color: var(--icolor);
}
input:active, input:focus {
	color: var(--textcolor);
}

.container {
	width: 60vw;
	min-width: 600px;
	margin: 25px auto 0;
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
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}

.input-field {
	display: flex;
}
.input-field input {
	margin-right: 25px;
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

@media only screen and (max-width: 1000px) {
	.container {
		width: auto;
	}
}
</style>
