<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='theme-menu'>
		<table>
			<tbody>
				<tr>
					<td>theme</td>
					<td>
						<select ref='theme' name='theme' class='interactable' @change='setTheme' :value='globals.theme'>
							<option v-for='[value, name] in themes' :value='value'>{{name}}</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>accent</td>
					<td>
						<select ref='accent' name='accent' class='interactable' @change='setAccent' :value='globals.accent'>
							<option v-for='[value, name] in accents' :value='value'>{{name}}</option>
						</select>
					</td>
				</tr>
			</tbody>
		</table>
		<div class='accent-checkbox'>
			<CheckBox
				skipInput
				:border='false'
				id='animated-accents'
				name='animated-accents'
				v-model:checked='globals.animations'
			>animated accents</CheckBox>
		</div>
	</div>
</template>

<script setup lang="ts">
import CheckBox from '@/components/CheckBox.vue';
import store from '@/globals';

const globals = store();
const themes = [
	['kheina', 'kheina'],
	['light', 'light mode'],
	['midnight', 'midnight'],
	['e621', 'e621'],
	['youtube', 'youtube'],
	['wikipedia', 'wikipedia'],
	['terminal', 'terminal'],
	['high-contrast-dark', 'high contrast dark'],
	['high-contrast-light', 'high contrast light'],
	['solarized-dark', 'solarized dark'],
	['solarized-light', 'solarized light'],
	['furaffinity', 'fur affinity'],
	['discord', 'discord'],
	['xfire', 'xfire'],
	['gay', 'gay'],
];
const accents = [
	['none', 'none'],
	['aurora', 'aurora'],
	['autumn', 'autumn'],
	['hex', 'hex grid'],
	['summer', 'summer'],
	['space', 'space'],
	['spring', 'spring'],
	['stars', 'stars'],
	['winter', 'winter'],
];

function setTheme(event: Event) {
	globals.setTheme((event.target as HTMLSelectElement).value);
}

function setAccent(event: Event) {
	globals.setAccent((event.target as HTMLSelectElement).value);
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
