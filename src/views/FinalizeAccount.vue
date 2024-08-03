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
import { khatch } from '@/utilities';
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
		body: {
			token: route.query.token,
			name: name.value.value,
			handle: handle.value,
			password: password.value.value,
		},
	})
	.then(response => {
		if (response.status < 300)
		{ router.push("/a/login"); }
		else {
			response.json().then(r => {
				console.log(r);
				if (response.status === 400)
				{ globals.setError(r.error); }
				else if (response.status === 401)
				{ globals.setError(r.error); }
				else if (response.status === 404)
				{ globals.setError(r.error); }
				else
				{ globals.setError(apiErrorMessage, r); }
			});
		}
		isLoading.value = false;
	})
	.catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
	});
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
	.then(response => {
		response.text()
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
		});
	})
	.catch(error => console.error(error));
}
function sha1 (msg: string)
{ // http://www.webtoolkit.info
	function rotate_left(n: number, s: number) {
		let t4 = ( n<<s ) | (n>>>(32-s));
		return t4;
	};
	function cvt_hex(val: number) {
		let str='';
		let i;
		let v;
		for( i=7; i>=0; i-- ) {
			v = (val>>>(i*4))&0x0f;
			str += v.toString(16);
		}
		return str;
	};
	function Utf8Encode(string: string) {
		string = string.replace(/\r\n/g,"\n");
		let utftext = '';
		for (let n = 0; n < string.length; n++) {
			let c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};
	let blockstart;
	let i, j;
	let W = new Array(80);
	let H0 = 0x67452301;
	let H1 = 0xEFCDAB89;
	let H2 = 0x98BADCFE;
	let H3 = 0x10325476;
	let H4 = 0xC3D2E1F0;
	let A, B, C, D, E;
	let temp;
	msg = Utf8Encode(msg);
	let msg_len = msg.length;
	let word_array = new Array();
	for( i=0; i<msg_len-3; i+=4 ) {
		j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
		msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
		word_array.push( j );
	}
	switch( msg_len % 4 ) {
		case 0:
			i = 0x080000000;
		break;
		case 1:
			i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
		break;
		case 2:
			i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
		break;
		case 3:
			i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8	| 0x80;
		break;
	}
	word_array.push( i );
	while( (word_array.length % 16) != 14 ) word_array.push( 0 );
	word_array.push( msg_len>>>29 );
	word_array.push( (msg_len<<3)&0x0ffffffff );
	for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
		for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
		for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for( i= 0; i<=19; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=20; i<=39; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=40; i<=59; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		for( i=60; i<=79; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}
	temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	return temp.toUpperCase();
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