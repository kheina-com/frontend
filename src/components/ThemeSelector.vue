<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='theme-menu'>
		<table>
			<tr>
				<td>theme</td>
				<td>
					<select ref='theme' name='theme' class='interactable' @change='setTheme' :value='$store.state.theme.theme'>
						<option v-for='[value, name] in themes' :value='value'>{{name}}</option>
					</select>
				</td>
			</tr>
			<tr>
				<td>accent</td>
				<td>
					<select ref='accent' name='accent' class='interactable' @change='setAccent' :value='$store.state.theme.accent'>
						<option v-for='[value, name] in accents' :value='value'>{{name}}</option>
					</select>
				</td>
			</tr>
		</table>
		<div class='accent-checkbox'>
			<CheckBox
				skipInput
				:border='false'
				id='animated-accents'
				name='animated-accents'
				v-model:checked='$store.state.animatedAccents'
			>animated accents</CheckBox>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';
import { setCookie, getCookie } from '@/utilities';
import CheckBox from '@/components/CheckBox.vue';

export default {
	name: 'ThemeSelector',
	components: {
		CheckBox,
	},
	setup() {
		const accent = ref(null);
		const theme = ref(null);

		return {
			accent,
			theme,
		};
	},
	data() {
		return {
			animations: false,
			theme: 'none',
			accent: 'none',
			themes: [
				['kheina', 'kheina'],
				['light', 'light mode'],
				['midnight', 'midnight'],
				['e621', 'e621'],
				['youtube', 'youtube'],
				['wikipedia', 'wikipedia'],
				['terminal', 'terminal'],
				['high-contrast-dark', 'high contrast dark'],
				['solarized-dark', 'solarized dark'],
				['solarized-light', 'solarized light'],
				['furaffinity', 'fur affinity'],
				['discord', 'discord'],
				['xfire', 'xfire'],
				['gay', 'gay'],
			],
			accents: [
				['none', 'none'],
				['aurora', 'aurora'],
				['autumn', 'autumn'],
				['hex', 'hex grid'],
				['summer', 'summer'],
				['space', 'space'],
				['spring', 'spring'],
				['stars', 'stars'],
				['winter', 'winter'],
			],
		}
	},
	methods: {
		setTheme(event) {
			document.documentElement.classList.remove(this.$store.state.theme.theme);
			this.$store.state.theme.theme = event.target.value;
			document.documentElement.classList.add(this.$store.state.theme.theme);
			setCookie('theme', this.$store.state.theme.theme);
			this.$store.state.theme.bg1color = getComputedStyle(document.body).getPropertyValue('--bg1color');
		},
		setAccent(event) {
			document.documentElement.classList.remove(this.$store.state.theme.accent);
			this.$store.state.theme.accent = event.target.value;
			document.documentElement.classList.add(this.$store.state.theme.accent);
			setCookie('accent', this.$store.state.theme.accent);
		},
	},
	mounted() {
		this.$store.state.theme.theme = getCookie('theme');
		this.$store.state.theme.accent = getCookie('accent');

		this.$refs.theme.value = this.$store.state.theme.theme;
		this.$refs.accent.value = this.$store.state.theme.accent;
	},
}
</script>

<style scoped>
select option
{ color: var(--textcolor) !important; }

tr
{ text-align: right; }
td:first-child
{ padding-right: 8px; }
td:last-child {
	width: 100%;
}
select {
	padding: 0;
	margin: 0;
	border-radius: var(--border-radius);
	background: var(--bg1color);
	color: var(--textcolor);
	border: var(--border-size) solid var(--bordercolor);
	width: 100%;
}

.accent-checkbox {
	text-align: center;
	font-size: 0.8em;
	background: none;
	border: none;
}
</style>
