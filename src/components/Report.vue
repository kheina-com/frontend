<template>
	<router-link :to='`/r/${encodeURIComponent(report_id)}`' class='_report'>
		<div class='_header'>
			<Profile v-bind='reporter' v-if='reporter'/>
			<div class='report-info'>
				<h3>type: {{report_type}}</h3>
				<p v-if='data.post'>Post: {{ data.post }}</p>
				<p>URL: {{ data.url }}</p>
			</div>
		</div>
		<Markdown :content='data.message'/>
		<div style='margin-top: var(--margin)'>
			<h3>Assignee:</h3>
			<Profile v-bind='assignee' v-if='assignee'/>
			<p v-else>unassigned</p>
		</div>
		<div>
			<h3>Response:</h3>
			<Markdown :content='response ?? "none"'/>
		</div>
		<Subtitle class='_ts' static='left'>created <Timestamp :datetime='created'/></Subtitle>
	</router-link>
</template>
<script setup lang='ts'>
import type { Report } from '@/types/report';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Timestamp from '@/components/Timestamp.vue';
import Subtitle from '@/components/Subtitle.vue';

defineProps<Report>();
</script>
<style scoped>
._header {
	margin-bottom: var(--margin);
	display: flex;
	flex-flow: row;
	align-items: flex-start;
}
._header > .report-info {
	margin-left: var(--margin);
}
._report {
	padding: var(--margin);
	background: var(--bg2color);
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
._report:hover {
	border-color: var(--interact);
}

h3 {
	margin: 0;
}

._ts {
	margin-top: var(--margin);
}

a.profile:hover {
	background: var(--bg1color);
}
._report.nested a.profile:hover {
	background: var(--bg2color);
}
</style>
