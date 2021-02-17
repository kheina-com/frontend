<template>
	<main v-if='!isError'>
		<Loading :lazy='false' :isLoading='isLoading'>
		<Title static='center'>Create Account</Title>
		<form action='' method='post' enctype='multipart/form-data' class='centerx'>
			<div v-if='!tokenProvided'>
				<span>Token</span>
				<input ref='token' type='token' id='token' name='token' value='' class='interactable text'>
			</div>
			<div>
				<span>Name</span>
				<input ref='name' type='name' id='name' name='name' value='' class='interactable text'>
			</div>
			<div>
				<span>Handle</span>
				<input ref='handle' type='handle' id='handle' name='handle' value='' class='interactable text'>
			</div>
			<div>
				<span>Password</span>
				<input ref='password' type='password' id='password' name='password' value='' autocomplete='off' class='interactable text'><i class='material-icons' ref='passwordPwned' :style='`color: var(--${passwordColor})`'>{{passwordIcon}}</i>
				<input ref='passwordRepeat' type='password' id='passwordRepeat' name='passwordRepeat' value='' autocomplete='off' :class='`interactable text ${passwordRepeatClass}`'>
			</div>
			<Submit :onClick='sendFinalize'>Submit »</Submit>
		</form>
		</Loading>
		<ThemeMenu />
	</main>
	<Error :dump='errorDump' :message='errorMessage' v-else/>
</template>

<script>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { apiErrorMessage, accountHost } from '../config/constants';
import Loading from '../components/Loading.vue';
import Title from '../components/Title.vue';
import Subtitle from '../components/Subtitle.vue';
import Error from '../components/Error.vue';
import ThemeMenu from '../components/ThemeMenu.vue';
import Media from '../components/Media.vue';
import Sidebar from '../components/Sidebar.vue';
import Submit from '../components/Submit.vue'

export default {
	name: 'FinalizeAccount',
	setup() {
		const token = ref(null);
		const name = ref(null);
		const handle = ref(null);
		const password = ref(null);
		const passwordRepeat = ref(null);
		const passwordPwned = ref(null);

		return {
			token,
			name,
			handle,
			password,
			passwordRepeat,
			passwordPwned,
		};
	},
	data() {
		return {
			isLoading: false,
			errorMessage: null,
			errorDump: null,
			typingTimer: null,
			typingInterval: 1000,
			passwordIcon: null,
			passwordColor: null,
			passwordRepeatClass: null,
			queriedPasswords: { },
			tokenProvided: null,
		};
	},
	components: {
		Submit,
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
		Error,
		Media,
	},
	created() {
		this.tokenProvided = this.$route.query.token ? true : false;
	},
	mounted() {
		this.$refs.token.value = route.query?.token;
		this.$refs.password.addEventListener('blur', this.checkPassword);
		this.$refs.password.addEventListener('input', this.checkPassword);
		this.$refs.password.addEventListener('keyup', this.checkPassword);
		this.$refs.password.addEventListener('paste', this.checkPassword);
		this.$refs.passwordRepeat.addEventListener('blur', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('input', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('keyup', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('paste', this.checkPasswordRepeat);
	},
	computed: {
		isError()
		{ return this.errorMessage !== null; },
	},
	methods: {
		sendFinalize() {
			this.isLoading = true;
			fetch(`${accountHost}/v1/finalize`,
				{
					method:'POST',
					credentials: 'include',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						token: this.tokenProvided ? this.$route.query.token : this.$refs.token.value,
						name: this.$refs.name.value,
						handle: this.$refs.handle.value,
						password: this.$refs.password.value,
					}),
				})
				.then(response => {
					response.json()
						.then(r => {
							console.log(r);
							if (response.status < 300)
							{ this.$router.push('/account/login'); }
							else if (response.status === 401)
							{ this.errorMessage = r.error; }
							else if (response.status === 404)
							{ this.errorMessage = r.error; }
							else
							{
								this.errorMessage = apiErrorMessage;
								this.errorDump = r;
							}
						});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		},
		checkPassword() {
			this.$refs.passwordRepeat.style.borderColor = '';
			this.$refs.passwordRepeat.placeholder = 're-enter password'.substring(0, this.$refs.password.value.length)
			clearTimeout(this.typingTimer);
			if (this.$refs.password.value)
			{
				if (this.$refs.password.value.length < 10)
				{
					this.passwordIcon = 'report';
					this.passwordColor = 'error';
				}
				else if (this.queriedPasswords.hasOwnProperty(this.$refs.password.value))
				{
					if (this.queriedPasswords[this.$refs.password.value])
					{ this.passwordColor = this.passwordIcon = 'warning'; }
					else
					{
						this.passwordIcon = 'check_circle';
						this.passwordColor = 'valid';
					}
				}
				else
				{
					this.passwordIcon = 'timer';
					this.passwordColor = 'subtlecolor';
					this.typingTimer = setTimeout(() => this.hasPasswordBeenPwned(this.$refs.password.value), this.typingInterval);
				}
			}
			else
			{
				this.passwordIcon = '';
			}
		},
		checkPasswordRepeat() {
			if (this.$refs.password.value)
			{
				if (this.$refs.password.value === this.$refs.passwordRepeat.value)
				{ this.passwordRepeatClass = 'valid'; }
				else
				{ this.passwordRepeatClass = 'error'; }
			}
			else
			{ this.passwordRepeatClass = null; }
		},
		hasPasswordBeenPwned(password) {
			let hash = this.sha1(password);
			fetch('https://api.pwnedpasswords.com/range/'.concat(hash.substring(0, 5)))
			.then(response =>
			{
				response.text()
				.then(hashes =>
				{
					if (hashes.split('\r\n').map(x => x.substring(0,35)).includes(hash.substring(5,40).toUpperCase()))
					{
						this.passwordColor = this.passwordIcon = 'warning';
						this.queriedPasswords[password] = true;
					}
					else
					{
						this.passwordIcon = 'check_circle_outline';
						this.passwordColor = 'valid';
						this.queriedPasswords[password] = false;
					}
				});
			})
			.catch(error => console.error(error));
		},
		sha1 (msg)
		{ // http://www.webtoolkit.info
			function rotate_left(n,s) {
				var t4 = ( n<<s ) | (n>>>(32-s));
				return t4;
			};
			function cvt_hex(val) {
				var str='';
				var i;
				var v;
				for( i=7; i>=0; i-- ) {
					v = (val>>>(i*4))&0x0f;
					str += v.toString(16);
				}
				return str;
			};
			function Utf8Encode(string) {
				string = string.replace(/\r\n/g,"\n");
				var utftext = '';
				for (var n = 0; n < string.length; n++) {
					var c = string.charCodeAt(n);
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
			var blockstart;
			var i, j;
			var W = new Array(80);
			var H0 = 0x67452301;
			var H1 = 0xEFCDAB89;
			var H2 = 0x98BADCFE;
			var H3 = 0x10325476;
			var H4 = 0xC3D2E1F0;
			var A, B, C, D, E;
			var temp;
			msg = Utf8Encode(msg);
			var msg_len = msg.length;
			var word_array = new Array();
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
			var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
			return temp.toUpperCase();
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
	overflow: hidden;
	display: block;
}
form div {
	width: 100%;
}
form .text
{
	width: 100%;
	color: var(--textcolor);
	padding: 0.5em;
}
form .text:hover
{ color: var(--icolor); }
form .text:active, form .text:focus
{ color: var(--textcolor); }
input
{
	display: inline-block;
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	padding: 1px 3px;
}
form
{
	width: 800px;
	max-width: calc(100% - 50px);
	display: flex;
	flex-direction: column;
	align-items: end;
}
form span
{
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
form .maxrating, form .integratedsearch
{
	margin: -14px 0 9px;
	padding: 0.5em 0;
	display: inline-block;
	width: calc(100% - 80px);
	line-height: 3;
}
form .maxrating input, form .integratedsearch input, form .submit input
{
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
form input
{ margin: 0 0 25px; }
form p
{ margin-left: 25px; }

form input.submit
{ float: right; }
form input#passwordRepeat
{
	width: 225px;
	width: calc(100% - 125px);
}
form input.valid:active, form input.valid:focus
{ border-color: var(--valid); }
form input.error:active, form input.error:focus
{ border-color: var(--error); }

label.hide-password
{
	position: absolute;
	right: 0;
	margin: 0.5em;
	height: 24px;
}
label.hide-password svg
{ height: 24px; }
i
{
	position: absolute;
	right: 10px;
	display: inline-block;
	pointer-events: none;
	margin-top: 7px;
	height: 24px;
}
input#hide-password
{ display: none; }

form
{ max-width: 350px; }
form input.submit
{ float: right; }
form input#passwordRepeat
{
	width: 225px;
	width: calc(100% - 125px);
}
form input.valid:active, form input.valid:focus
{ border-color: var(--valid); }
form input.error:active, form input.error:focus
{ border-color: var(--error); }

label.hide-password
{
	position: absolute;
	right: 0;
	margin: 0.5em;
	height: 24px;
}
label.hide-password svg
{ height: 24px; }

.warn {
	border-color: var(--warning);
}

.error {
	border-color: var(--error);
}
</style>