<template>
	<table class='theme-menu'>
		<tr>
			<td>theme</td>
			<td>
				<select ref='theme' name='theme' class='interactable' @change='setTheme' :value='$store.state.theme.theme'>
					<option value='kheina'>kheina</option>
					<option value='light'>light mode</option>
					<option value='midnight'>midnight</option>
					<option value='e621'>e621</option>
					<option value='youtube'>youtube</option>
					<option value='wikipedia'>wikipedia</option>
					<option value='terminal'>terminal</option>
					<option value='solarized-dark'>solarized dark</option>
					<option value='solarized-light'>solarized light</option>
					<option value='furaffinity'>fur affinity</option>
					<option value='discord'>discord</option>
					<option value='xfire'>xfire</option>
					<option value='gay'>gay</option>
				</select>
			</td>
		</tr>
		<tr>
			<td>accent</td>
			<td>
				<select ref='accent' name='accent' class='interactable' @change='setAccent' :value='$store.state.theme.accent'>
					<option value='none'>none</option>
					<option value='winter'>winter</option>
					<option value='spring'>spring</option>
					<option value='summer'>summer</option>
					<option value='autumn'>autumn</option>
					<option value='hex'>hex grid</option>
					<option value='fox'>fox</option>
					<option value='snep'>snep</option>
				</select>
			</td>
		</tr>
	</table>
</template>

<script>
import { ref } from 'vue';
import { setCookie, getCookie } from '@/utilities';

export default {
	name: 'ThemeSelector',
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
			theme: 'none',
			accent: 'none',
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
</style>
