<template>
	<main>
		<ul class='settings'>
			<li>
				<span>maximum rating for autoloading thumbnails</span>
				<RadioButtons
					name='rating'
					v-model:value='maxRating'
					:data="[
						{ content: 'general' },
						{ content: 'mature' },
						{ content: 'explicit' },
					]"
				/>
			</li>
			<li>
				<span>set custom font-family</span>
				<input class='interactable text' style='display: block; width: 100%' v-model='fontFamily'>
			</li>
		</ul>

		<div class='eventually' style='display: flex; flex-direction: column; align-items: center'>
			<h2>things you will eventually be able to do here:</h2>
			<ul style='display: inline-block; margin-bottom: 0'>
				<li>
					change the query used to retrieve posts on your profile page
					<br>
					(defaults to pulling all posts containing one of your owned tags)
				</li>
				<li>
					change your handle to something else (or just change the capitalization)
				</li>
				<li>
					transfer ownership of tags to other users (may require permission or something, not sure yet)
				</li>
				<li>
					change what tags (or users) you have blocked
				</li>
				<li>
					change blocking behavior (omit entirely or just hide image/desc)
				</li>
				<li>
					delete your account
				</li>
				<li>
					change local performance settings (load thumbnails vs fullsize)
				</li>
			</ul>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { getCookie, setCookie } from '@/utilities';
import { ratingMap } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import RadioButtons from '@/components/RadioButtons.vue';

export default {
	name: 'Account',
	components: {
		ThemeMenu,
		RadioButtons,
	},
	data() {
		return {
			maxRating: getCookie('max-rating', 'general'),
			fontFamily: getCookie('font-family'),
		};
	},
	computed: {
	},
	methods: {
	},
	watch: {
		maxRating(value) {
			setCookie('max-rating', value, 3155695200);
			this.$store.commit('maxRating', ratingMap[value]);
		},
		fontFamily(value) {
			setCookie('font-family', value, 3155695200);
			const fontFamily = document.getElementById('custom-font');
			if (value)
			{ fontFamily.innerText = `html * { font-family: ${value}, Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }
			else
			{ fontFamily.innerText = `html * { font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }

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
h2 {
	margin: 0 auto;
}
.settings {
	padding: 0;
	margin: 0 auto 0;
	width: 70vw;
}
.settings li {
	list-style: none;
	margin-bottom: 25px;
}
.settings li span {
	margin-left: 25px;
}
</style>