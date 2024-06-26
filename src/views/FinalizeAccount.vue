<template>
	<main>
		<Loading type='block' :isLoading='isLoading' v-if='tokenProvided'>
			<Title static='center'>Create Account</Title>
			<div class='form'>
				<div class='field'>
					<div class='field-title'>
						<span>
							Name
							<i class='material-icons' title='the name that will be displayed on the site. can be anything you want.'>help_outline</i>
						</span>
					</div>
					<input ref='name' type='name' id='name' name='name' class='interactable'>
				</div>
				<div class='field'>
					<div class='field-title'>
						<span>
							@handle
							<i class='material-icons' title='your unique identifier across the site. determines your URL.'>help_outline</i>
						</span>
					</div>
					<input ref='handle' type='handle' id='handle' name='handle' class='interactable'>
				</div>
				<div class='final-field'>
					<div class='field-title'>
						<span>
							Password
							<i class='material-icons' title='must be at least 10 characters.'>help_outline</i>
						</span>
					</div>
					<input ref='password' type='password' id='password' name='password' autocomplete='off' class='interactable password'>
					<div class='pwned'>
						<i class='material-icons' ref='pwnedIcon' :style='`color: var(--${passwordColor})`'>{{passwordIcon}}</i>
						<span ref='pwnedDescription'>{{pwnedDescription}}</span>
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

<script>
import { ref } from 'vue';
import { khatch } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
	name: 'FinalizeAccount',
	setup() {
		const token = ref(null);
		const name = ref(null);
		const handle = ref(null);
		const password = ref(null);
		const passwordRepeat = ref(null);

		return {
			token,
			name,
			handle,
			password,
			passwordRepeat,
		};
	},
	data() {
		return {
			isLoading: false,
			typingTimer: null,
			typingInterval: 1000,
			passwordIcon: null,
			passwordColor: null,
			passwordRepeatClass: null,
			queriedPasswords: { },
			tokenProvided: null,
			pwnedDescription: null,
		};
	},
	components: {
		ThemeMenu,
		Loading,
		Sidebar,
		Subtitle,
		Title,
	},
	created() {
		this.tokenProvided = this.$route.query.token ? true : false;
	},
	mounted() {
		this.$refs.password.addEventListener('blur', this.checkPassword);
		this.$refs.password.addEventListener('input', this.checkPassword);
		this.$refs.password.addEventListener('keyup', this.checkPassword);
		this.$refs.password.addEventListener('paste', this.checkPassword);
		this.$refs.passwordRepeat.addEventListener('blur', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('input', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('keyup', this.checkPasswordRepeat);
		this.$refs.passwordRepeat.addEventListener('paste', this.checkPasswordRepeat);
	},
	methods: {
		sendFinalize() {
			this.isLoading = true;
			khatch(`${host}/v1/account/finalize`, {
				method:'POST',
				body: {
					token: this.tokenProvided ? this.$route.query.token : this.$refs.token.value,
					name: this.$refs.name.value,
					handle: this.$refs.handle.value,
					password: this.$refs.password.value,
				},
			})
			.then(response => {
				if (response.status < 300)
				{ this.$router.push('/account/login'); }
				else
				{
					response.json().then(r => {
						console.log(r);
						if (response.status === 400)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 401)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 404)
						{ this.$store.commit('error', r.error); }
						else
						{ this.$store.commit('error', apiErrorMessage, r); }
					});
				}
				this.isLoading = false;
			})
			.catch(error => {
				this.$store.commit('error', apiErrorMessage, error);
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
					this.pwnedDescription = 'Password invalid, passwords must be 10 characters or longer';
				}
				else if (this.queriedPasswords.hasOwnProperty(this.$refs.password.value))
				{
					if (this.queriedPasswords[this.$refs.password.value])
					{
						this.passwordColor = this.passwordIcon = 'warning';
						this.pwnedDescription = 'This password has been compromised';
					}
					else
					{
						this.passwordIcon = 'check_circle_outline';
						this.passwordColor = 'valid';
						this.pwnedDescription = 'This password has not been compromised!';
					}
				}
				else
				{
					this.passwordIcon = 'timer';
					this.passwordColor = 'subtle';
					this.pwnedDescription = 'Checking password...';
					this.typingTimer = setTimeout(() => this.hasPasswordBeenPwned(this.$refs.password.value), this.typingInterval);
				}
			}
			else
			{
				this.passwordIcon = '';
				this.pwnedDescription = null;
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
			const hash = this.sha1(password);
			fetch('https://api.pwnedpasswords.com/range/'.concat(hash.substring(0, 5)))
			.then(response => {
				response.text()
				.then(hashes => {
					if (hashes.split('\r\n').map(x => x.substring(0,35)).includes(hash.substring(5,40).toUpperCase()))
					{
						this.passwordColor = this.passwordIcon = 'warning';
						this.pwnedDescription = 'This password has been compromised';
						this.queriedPasswords[password] = true;
					}
					else
					{
						this.passwordIcon = 'check_circle_outline';
						this.passwordColor = 'valid';
						this.pwnedDescription = 'This password has not been compromised!';
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