<template>
	<main>
		<h2 style='margin-top: 0'>Settings</h2>
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
				<span>custom font-family</span>
				<input class='interactable text' placeholder='font family' v-model='fontFamily'>
				<p v-show='fontFamily' class='warn'>
					warning: changing the site font may cause some elements to render incorrectly
				</p>
			</li>
		</ul>

		<h2>Performance</h2>
		<ul class='settings performance'>
			<li>
				<span>animations</span>
				<div class='checkboxes'>
					<CheckBox
						class='checkbox'
						id='css-transitions-checkbox'
						name='css-transitions-checkbox'
						v-model:checked='CssTransitions'
					>CSS Transitions</CheckBox>
					<CheckBox
						skipInput
						class='checkbox'
						id='animated-accents'
						name='animated-accents'
						v-model:checked='$store.state.animatedAccents'
					>Animated Accents</CheckBox>
				</div>
			</li>
		</ul>

		<h2>NOT IMPLEMENTED</h2>
		<p style='text-align: center; margin: -25px 0 25px'>
			everything below this point is non-functional and a work in progress
		</p>
		<ul class='settings'>
			<li>
				<span>query used to retrieve posts on your profile page</span>
				<input class='interactable text' :placeholder='`@${$store.state.user?.handle} sort:new`'>
			</li>
			<li>
				<span>change your @handle</span>
				<input class='interactable text' :placeholder='`${$store.state.user?.handle}`'>
			</li>
			<li>
				<span>blocking behavior</span>
				<RadioButtons
					name='block-behavior'
					v-model:value='blockBehavior'
					:data="[
						{ content: 'hide post content' },
						{ content: 'omit from results' },
					]"
				/>
			</li>
			<li>
				<span>blocked tags</span>
				<textarea class='interactable text' placeholder='enter blocked tags, separated by commas'/>
			</li>
			<li>
				<span>blocked users</span>
				<textarea class='interactable text' placeholder='enter blocked users, separated by commas (without the @)'/>
			</li>
		</ul>

		<h2>Performance</h2>
		<ul class='settings performance'>
			<li>
				<span>animations</span>
				<div class='checkboxes'>
					<CheckBox
						class='checkbox'
						id='animated-emoji'
						name='animated-emoji'
						v-model:checked='animatedEmoji'
					>Animated Emoji</CheckBox>
				</div>
			</li>
			<li>
				<span>post page media</span>
				<RadioButtons
					name='media-quality'
					v-model:value='mediaQuality'
					:data="[
						{ content: 'compressed' },
						{ content: 'fullsize' },
					]"
				/>
			</li>
		</ul>

		<h2 class='danger'>DANGER ZONE</h2>
		<ul class='settings'>
			<li>
				<span>change password</span>
				<input class='interactable text' placeholder='old password'>
				<input class='interactable text buffer' placeholder='new password'>
				<input class='interactable text buffer' placeholder='new password'>
			</li>
			<li>
				delete my account
			</li>
		</ul>
		<ThemeMenu/>
	</main>
</template>

<script>
import { getCookie, setCookie } from '@/utilities';
import { ratingMap } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import CheckBox from '@/components/CheckBox.vue';


export default {
	name: 'Account',
	components: {
		ThemeMenu,
		RadioButtons,
		CheckBox,
	},
	data() {
		return {
			maxRating: getCookie('max-rating', 'general'),
			fontFamily: getCookie('font-family'),
			blockBehavior: getCookie('block-behavior'),
			mediaQuality: getCookie('media-quality'),
			animatedEmoji: Boolean(getCookie('animated-emoji', true)),
			CssTransitions: this.$store.state.cssTransitions,
		};
	},
	watch: {
		maxRating(value) {
			setCookie('max-rating', value, 3155695200);
			this.$store.commit('maxRating', ratingMap[value]);
		},
		fontFamily(value) {
			setCookie('font-family', value, 3155695200);
			const fontFamily = document.getElementById('font-family');
			if (value)
			{ fontFamily.innerText = `html * { font-family: ${value}, Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }
			else
			{ fontFamily.innerText = `html * { font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }
		},
		CssTransitions(value) {
			this.$store.commit('cssTransitions', value);
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
	text-align: center;
	margin: 25px 0;
}
input, textarea {
	display: block;
	width: 100%;
}
textarea {
	resize: vertical;
}
span {
	position: relative;
	z-index: 1;
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
.performance h2 {
	display: inline;
}
.buffer {
	margin-top: 0.5em;
}
.checkboxes {
	display: flex;
}
.checkboxes .checkbox {
	margin-right: 25px;
}
.checkboxes:last-child {
	margin-right: 0;
}

.warn {
	margin-top: 10px;
	text-align: center;
}

.mobile .settings {
	width: auto;
}

@keyframes danger {
	0%, 100%
	{ color: var(--textcolor) }
	50%
	{ color: var(--red) }
}
.danger {
	animation: danger 2s ease-in-out infinite;
}
@media only screen and (max-width: 1000px) {
	.settings {
		width: auto;
	}
}
</style>