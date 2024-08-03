<template>
	<main>
		<h2 style='margin-top: 0'>Settings</h2>
		<ul class='settings'>
			<li>
				<span>Maximum Rating for Autoloading Thumbnails</span>
				<RadioButtons
					name='rating'
					v-model:value='maxRating'
					:data="[
						{ value: Rating.general },
						{ value: Rating.mature },
						{ value: Rating.explicit },
					]"
				/>
			</li>
			<li>
				<span>Custom Font-Family</span>
				<input class='interactable text' placeholder='font family' v-model='fontFamily'>
				<p v-show='fontFamily' class='warn'>
					warning: changing the site font may cause some elements to render incorrectly
				</p>
			</li>
			<li>
				<span>Blocking Behavior</span>
				<RadioButtons
					name='block-behavior'
					v-model:value='localConfig.blocking_behavior'
					@change='save'
					:data="[
						{ content: 'hide post content', value: 'hide' },
						{ content: 'omit from results', value: 'omit' },
					]"
				/>
			</li>
			<li>
				<span>Blocked Tags</span>
				<textarea class='interactable text' v-model='localConfig.blocked_tags' @change='save' placeholder='enter blocked tag combinations in the same format as a search&#10;each combination should be on its own line'/>
			</li>
			<li>
				<span>Wallpaper Post Id</span>
				<input class='interactable text code' v-model='localConfig.wallpaper' @change='save' placeholder='enter the 8 character post id, found in the url of a post page after "/p/"'>
			</li>
		</ul>

		<h2>Performance</h2>
		<ul class='settings performance'>
			<li>
				<span>Animations</span>
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
						v-model:checked='globals.animations'
					>Animated Accents</CheckBox>
				</div>
			</li>
		</ul>

		<h2>NOT IMPLEMENTED</h2>
		<p style='text-align: center; margin: var(--neg-margin) 0 var(--margin)'>
			everything below this point is non-functional and a work in progress
		</p>
		<ul class='settings'>
			<li>
				<span>Query Used to Retrieve Posts on Your Profile Page</span>
				<input class='interactable text' :placeholder='`@${globals.user?.handle} sort:new`'>
			</li>
			<li>
				<span>Change Your @handle</span>
				<input class='interactable text' :placeholder='`${globals.user?.handle}`'>
			</li>
			<li>
				<span>Blocked Users</span>
				<textarea class='interactable text' v-model='localConfig.blocked_users' @change='save' placeholder='enter blocked users, separated by commas (without the @)'/>
			</li>
			<li>
				<span>Custom Theme</span>
				<textarea class='interactable text' v-model='localConfig.colors' @change='save' placeholder='enter blocked users, separated by commas (without the @)'/>
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
						{ value: 'compressed' },
						{ value: 'fullsize' },
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

<script setup lang="ts">
import { getCookie, khatch, setCookie, createToast, tagSplit } from '@/utilities';
import { cookieFailedError } from '@/globals';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import CheckBox from '@/components/CheckBox.vue';
import { onMounted, ref, watch, type Ref } from 'vue';
import store, { Rating } from '@/globals';


const globals = store();
const maxRating: Ref<Rating> = ref(getCookie("max-rating", "general"));
const fontFamily: Ref<string> = ref(getCookie("font-family"));
const blockBehavior: Ref<string> = ref(getCookie("block-behavior"));
const mediaQuality: Ref<string> = ref(getCookie("media-quality"));
const animatedEmoji: Ref<boolean> = ref(getCookie("animated-emoji", true, "boolean"));
const CssTransitions: Ref<boolean> = ref(globals.transitions);
const isLoading: Ref<boolean> = ref(true);
const localConfig: Ref<any> = ref({ });

let saveTimeout: number | null = null;

onMounted(retrieve);

function retrieve() {
	return khatch(`${host}/v1/config/user`, {
		errorMessage: "Could Not Retrieve User Config!",
		errorHandlers: {
			// do nothing, we don't care
			401: () => { },
		},
	}).then(response => response.json().then(r => {
		globals.userConfig(r);
		localConfig.value = {
			...r,
			blocked_tags: r.blocked_tags ? r.blocked_tags.map((x: string[]) => x.join(" ")).join("\n") : null,
			blocked_users: r.blocked_users ? r.blocked_users.join(" ") : null,
		};
		isLoading.value = false;
	}));
}
function save() {
	if (saveTimeout) clearTimeout(saveTimeout);

	saveTimeout = setTimeout(() => {
		khatch(`${host}/v1/config/user`, {
			method: "PATCH",
			errorMessage: "Could Not Save User Config!",
			body: {
				blocking_behavior: localConfig.value?.blocking_behavior,
				blocked_tags: localConfig.value?.blocked_tags ? localConfig.value.blocked_tags.split("\n").map(tagSplit) : null,
				blocked_users: localConfig.value?.blocked_users ? tagSplit(localConfig.value.blocked_users) : null,
				wallpaper: localConfig.value?.wallpaper ? localConfig.value.wallpaper.trim() : null,
			},
		})
		.then(retrieve)
		.then(() => {
			createToast({
				icon: "done",
				title: "Saved Config!",
				color: "green",
				time: 5,
			});
		});
	}, 1000);
}

watch(maxRating, (value: Rating) => {
	globals.maxRating(value);
});

watch(fontFamily, (value: string) => {
	setCookie("font-family", value, 3155695200);

	const fontFamily = document.getElementById("font-family") as HTMLStyleElement;
	if (value)
	{ fontFamily.innerText = `html * { font-family: ${value}, Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }
	else
	{ fontFamily.innerText = `html * { font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`; }

	if (!globals.cookies) {
		createToast({
			title: "Could could not set font family cookie",
			description: cookieFailedError,
		});
	}
});

watch(CssTransitions, (value: boolean) => {
	globals.cssTransitions(value);
});
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
h2 {
	text-align: center;
	margin: var(--margin) 0;
}
input, textarea {
	display: block;
	width: 100%;
}
textarea {
	resize: vertical;
	height: 10em;
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
	margin-bottom: var(--margin);
}
.settings li span {
	margin-left: var(--margin);
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
	margin-right: var(--margin);
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
@media only screen and (max-width: 1200px) {
	.settings {
		width: auto;
	}
}
</style>