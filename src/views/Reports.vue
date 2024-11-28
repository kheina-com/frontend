<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Your Reports</Title>
		<div class='container' v-if='!reports'>
			<span>Loading...</span>
		</div>
		<div class='container' v-else-if='reports.length !== 0'>
			<ReportComponent class='report' v-bind='report' v-for='report in reports' nested/>
		</div>
		<div class='container' v-else>
			You have no active reports
		</div>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { khatch } from '@/utilities';
import { type Report } from '@/utilities/report';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import ReportComponent from '@/components/Report.vue';

const reports: Ref<Report[] | undefined> = ref();

khatch(`${host}/v1/reports`, {
	handleError: true
}).then(r => r.json())
.then(r => {
	reports.value = r;
	console.log(r);
});
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}

.container {
	position: relative;
	width: 50vw;
	min-width: 600px;
	margin: var(--margin) auto 0;
}
.mobile .container {
	width: 100%;
}

.report {
	margin-bottom: var(--margin);
}
.report:last-child {
	margin: 0;
}

@media only screen and (max-width: 1200px) {
	.container {
		width: auto;
	}
}
</style>
