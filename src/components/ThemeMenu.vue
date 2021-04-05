<template>
	<div class='themes'>
		<input id='themecheck' type='checkbox' name='themes'>
		<div class='theme-menu'>
			<table>
				<tr>
					<td>theme</td>
					<td>
						<select id='themeselector' name='theme' class='interactable' @change='setTheme'>
							<option value='kheina'>kheina</option>
							<option value='light'>light mode</option>
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
						<select id='accentselector' name='accent' class='interactable' @change='setAccent'>
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
		</div>
	</div>
	<label class='themebutton' for='themecheck'><a>theme</a></label>
</template>

<script>
import { setCookie, getCookie } from '@/utilities';

export default {
	name: 'ThemeMenu',
	data() {
		return {
			theme: 'none',
			accent: 'none',
		}
	},
	methods: {
		setTheme(event) {
			document.documentElement.classList.remove(this.theme);
			this.theme = event.target.value;
			document.documentElement.classList.add(this.theme);
			setCookie('theme', this.theme);
			this.$store.state.theme.theme = this.theme;
			this.$store.state.theme.bg1color = getComputedStyle(document.body).getPropertyValue('--bg1color');
		},
		setAccent(event) {
			document.documentElement.classList.remove(this.accent);
			this.accent = event.target.value;
			document.documentElement.classList.add(this.accent);
			setCookie('accent', this.accent);
			this.$store.state.theme.accent = this.accent;
		},
	},
	created() {
		// get theme data from cookie
		this.theme = getCookie('theme');
		this.accent = getCookie('accent');
	},
}
</script>

<style scoped>
.changemascot
{
	font-size: 0.9em;
	text-align: center;
}

.theme-menu select.interactable
{
	padding: 0;
	margin: 0;
	background: var(--bg1color);
}
.theme-menu select.interactable option
{ color: var(--textcolor) !important; }

.themes
{
	overflow: hidden;
	position: absolute;
	width: 300px;
	bottom: 0;
	right: 0;
	height: 100px;
	pointer-events: none;
	/* height: 120px; */
}
.themes input
{ display: none; }
.themes input:checked ~ .theme-menu
{ top: 5px; }
.theme-menu
{
	top: 105%;
	top: calc(100% + 5px);
	right: -25px;
	border-top-left-radius: 3px;
	position: absolute;
	pointer-events: all;
	background: var(--bg2color);
	padding: 25px 50px 50px 25px;
	border-left: 1px solid var(--bordercolor);
	border-top: 1px solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.theme-menu tr
{ text-align: right; }
.themes td:first-child
{ padding-right: 8px; }
select
{
	border-radius: 3px;
	background: var(--bg1color);
	color: var(--textcolor);
	border: 1px solid var(--bordercolor);
	width: 125px;
}
label {
	cursor: pointer;
	position: absolute;
	right: 0;
	font-size: 0.9em;
	color: var(--subtlecolor);
	margin-right: 25px;
	bottom: -1.25rem;
}
</style>
