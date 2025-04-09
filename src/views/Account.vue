<template>
	<main>
		<h2 style='margin-top: 0'>Settings</h2>
		<ul class='settings'>
			<li>
				<span>Maximum Rating for Autoloading Thumbnails</span>
				<RadioButtons
					name='rating'
					v-model:value='maxRating'
					:data='[
						{ value: Rating.general },
						{ value: Rating.mature },
						{ value: Rating.explicit },
					]'
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
				<span>Blocked Users</span>
				<textarea class='interactable text' v-model='localConfig.blocked_users' @change='save' placeholder='enter blocked users, separated by commas (without the @)'/>
			</li>
			<li>
				<span>Wallpaper Post Id</span>
				<input class='interactable text code' v-model='localConfig.wallpaper' @change='save' placeholder='enter the 8 character post id, found in the url of a post page after "/p/"'>
			</li>
		</ul>

		<h2 style='margin-top: 0'>Security</h2>
		<ul class='settings security'>
			<li>
				<Loading :isLoading='otpLoading' type='block'>
					<span>Multi-Factor Authentication</span>
					<div v-show='addOtpStage == -2' class='login'>
						<div class='final-field'>
							<span>Enter OTP to Remove Authenticator</span>
							<div>
								<input type='text' id='otp' name='otp' v-model='otp' autocomplete='off' class='interactable' @keydown.enter='removeOtp'>
								<button @click='removeOtp' class='interactable'>Submit »</button>
							</div>
						</div>
					</div>
					<div class='checkboxes' v-show='addOtpStage == -1'>
						<Button @click='removeOtp'>remove authenticator</Button>
					</div>
					<div class='checkboxes' v-show='addOtpStage == 0'>
						<Button @click='addOtp'>add authenticator</Button>
						<!-- <Button>add WebAuthn</Button> -->
					</div>
					<div v-show='addOtpStage == 1' class='login'>
						<div class='field'>
							<span>Email</span>
							<input type='email' id='email' name='email' v-model='email' class='interactable' @keydown.enter='addOtp'>
						</div>
						<div class='final-field'>
							<span>Password</span>
							<div>
								<input type='password' id='password' name='password' v-model='password' autocomplete='off' class='interactable' @keydown.enter='addOtp'>
								<button @click='addOtp' class='interactable'>Submit »</button>
							</div>
						</div>
					</div>
					<div class='qr-code' v-show='addOtpStage == 2'>
						<QR :content='qrContent'/>
						<p>Scan this QR code with your authenticor of choice and enter the code below</p>
						<div class='login final-field'>
							<div>
								<input type='text' id='otp' name='otp' v-model='otp' autocomplete='off' class='interactable' @keydown.enter='addOtp'>
								<button @click='addOtp' class='interactable'>Add OTP »</button>
							</div>
						</div>
					</div>
					<div class='qr-code' v-if='otpRecoveryKeys'>
						<CopyText :content='otpRecoveryKeys.join("\n")' code nested/>
						<p>Save these codes in a secure location, they will not be displayed again.</p>
					</div>
				</Loading>
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
import * as _ from 'lodash-es';
import { onMounted, ref, watch, type Ref } from 'vue';
// import QRCode from 'qrcode';
import { getCookie, khatch, setCookie, createToast, tagSplit } from '@/utilities';
import { cookieFailedError } from '@/globals';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Loading from '@/components/Loading.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import CheckBox from '@/components/CheckBox.vue';
import Button from '@/components/Button.vue';
import store, { Rating } from '@/globals';
import CopyText from '@/components/CopyText.vue';
import QR from '@/components/QR.vue';

interface Theme {
	wallpaper:      string | null,
	css_properties: { [k: string]: number | string } | null,
}

interface OTP {
	type:    "totp" | "u2f",
	created: Date | string,
}

interface UserConfig {
	blocking_behavior: "omit" | "hide",
	blocked_tags:      string[][],
	blocked_users:     string[],
	theme:             Theme | null,
	otp?:              OTP[],
}

const globals = store();
const maxRating: Ref<Rating> = ref(getCookie("max-rating", "general"));
const fontFamily: Ref<string> = ref(getCookie("font-family"));
const blockBehavior: Ref<string> = ref(getCookie("block-behavior"));
const mediaQuality: Ref<string> = ref(getCookie("media-quality"));
const animatedEmoji: Ref<boolean> = ref(getCookie("animated-emoji", true, "boolean"));
const CssTransitions: Ref<boolean> = ref(globals.transitions);
const isLoading: Ref<boolean> = ref(true);
const otpLoading: Ref<boolean> = ref(false);
const savedConfig: Ref<UserConfig | void> = ref();
const localConfig: Ref<any> = ref({ });
const addOtpStage: Ref<number> = ref(0);
const otpRecoveryKeys: Ref<Array<string> | null> = ref(null);
const qrContent: Ref<string | undefined> = ref();

let email:       string | null = null;
let password:    string | null = null;
let otp:         string | null = null;
let otpToken:    string | null = null;
let saveTimeout: number | null = null;

onMounted(retrieve);

const parseConfig = (c: {
	blocking_behavior?: "omit" | "hide",
	blocked_tags?:      string[][],
	blocked_users?:     string[],
	theme?:             Theme | null,
	otp?:               OTP[],
}) => {
	localConfig.value = {
		...c,
		blocked_tags: c.blocked_tags ? c.blocked_tags.map((x: string[]) => x.join(" ")).join("\n") : localConfig.value.blocked_tags,
		blocked_users: c.blocked_users ? c.blocked_users.join(" ") : localConfig.value.blocked_users,
	};
	savedConfig.value = {
		...localConfig.value,
	};
	c.otp?.forEach((x: { type: string }) => {
		if (x.type == "totp") {
			addOtpStage.value = Math.min(addOtpStage.value, -1);
		}
	});
}

function retrieve() {
	return khatch(`${host}/v1/config/user`, {
		errorMessage: "Could Not Retrieve User Config!",
		errorHandlers: {
			// do nothing, we don't care
			401: () => { },
		},
	}).then(
		r => r.json()
	).then((r: UserConfig) => {
		globals.userConfig(r);
		parseConfig(r);
		isLoading.value = false;
	});
}

function save() {
	if (saveTimeout) clearTimeout(saveTimeout);

	interface UserConfigRequest {
		field_mask:         string[],
		blocking_behavior?: "omit" | "hide",
		blocked_tags?:      string[][],
		blocked_users?:     string[],
		theme?:             Theme | null,
	}

	const body: UserConfigRequest = {
		field_mask: [],
	};

	if (localConfig.value.blocking_behavior !== savedConfig.value?.blocking_behavior) {
		body.blocking_behavior = localConfig.value.blocking_behavior;
		body.field_mask.push("blocking_behavior");
	}

	if (!_.isEqual(localConfig.value.blocked_tags, savedConfig.value?.blocked_tags)) {
		body.blocked_tags = localConfig.value.blocked_tags.split("\n").map(tagSplit);
		body.field_mask.push("blocked_tags");
	}

	if (!_.isEqual(localConfig.value.blocked_users, savedConfig.value?.blocked_users)) {
		body.blocked_users = tagSplit(localConfig.value.blocked_users);
		body.field_mask.push("blocked_users");
	}

	if (!_.isEqual(localConfig.value.theme, savedConfig.value?.theme)) {
		body.theme = localConfig.value.theme;
		body.field_mask.push("theme");
	}

	saveTimeout = setTimeout(() => {
		khatch(`${host}/v1/config/user`, {
			method: "PATCH",
			errorMessage: "Could Not Save User Config!",
			body,
		}).then(() => {
			parseConfig(body);
			createToast({
				icon: "done",
				title: "Saved Config!",
				color: "green",
				time: 5,
			});
		});
	}, 1000);
}

function addOtp() {
	switch(addOtpStage.value) {
	case 2:
		otpLoading.value = true;
		khatch(`${host}/v1/account/otp`, {
			method: "PATCH",
			errorMessage: "Could Not Add OTP",
			body: {
				token: otpToken,
				otp,
			},
		}).then(r => r.json())
		.then(r => {
			otpRecoveryKeys.value = (["fuzz.ly OTP recovery codes"]).concat(r.recovery_keys);
			addOtpStage.value++;
		}).then(() => {
			otp      = null;
			otpToken = null;
		}).finally(() => otpLoading.value = false);
		break;
	case 1:
		otpLoading.value = true;
		khatch(`${host}/v1/account/otp`, {
			method: "PUT",
			errorMessage: "Could Not Add OTP",
			body: {
				email,
				password,
			},
		}).then(r => r.json())
		.then(r => {
			otpToken = r.token.token;
			qrContent.value = r.uri;
			// QRCode.toCanvas(document.getElementById("qr-code"), r.uri, {
			// 	errorCorrectionLevel: "L",
			// 	// maskPattern: 0,
			// });
			addOtpStage.value++;
		}).then(() => {
			email = null;
			password = null;
		}).finally(() => otpLoading.value = false);
		break;
	default:
		addOtpStage.value++;
	}
}

function removeOtp() {
	switch(addOtpStage.value) {
	case -2:
		otpLoading.value = true;
		khatch(`${host}/v1/account/otp`, {
			method: "DELETE",
			errorMessage: "Could Not Remove Authenticator",
			body: {
				otp,
			},
		}).then(() => {
			createToast({
				icon: "done",
				title: "Removed Authenticator!",
				color: "green",
				time: 10,
			});
			addOtpStage.value = 0;
		}).finally(() => otpLoading.value = false);
		break;
	default:
		addOtpStage.value--;
	}
}

watch(maxRating, (value: Rating) => {
	globals.maxRating(value);
});

watch(fontFamily, (value: string) => {
	setCookie("font-family", value, 3155695200);

	const fontFamily = document.getElementById("font-family") as HTMLStyleElement;
	if (value) {
		fontFamily.innerText = `html * { font-family: ${value}, Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }`;
	}
	else {
		fontFamily.innerText = "html * { font-family: Bitstream Vera Sans, DejaVu Sans, Arial, Helvetica, sans-serif; }";
	}

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
.checkboxes .checkbox, .checkboxes button {
	margin-right: var(--margin);
}
.checkboxes:last-child {
	margin-right: 0;
}

.warn {
	margin-top: 10px;
	text-align: center;
}

.qr-code {
	text-align: center;
}
.qr-code canvas {
	display: block;
	image-rendering: crisp-edges;
}
.qr-code > :first-child {
	margin: 0 auto var(--margin);
}

.login {
	max-width: 25em;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin: auto;
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
.final-field button {
	word-wrap: normal;
	white-space: nowrap;
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
