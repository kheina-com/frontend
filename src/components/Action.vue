<template>
	<router-link :to='`/r/${encodeURIComponent(report_id)}`' class='_report'>
		<div class='report-info'>
			<h3>type: {{action_type}}</h3>
			<p v-if='(action as ForceUpdateAction).post'>Post: {{ (action as any).post }}</p>
			<div v-in='(action as ForceUpdateAction).field_updates'>
				<ol>
					<li v-for='(field, update) in (action as ForceUpdateAction).field_updates'>
						{{ field }}: {{ update }}
					</li>
				</ol>
			</div>
		</div>
		<Markdown :content='reason'/>
		<div style='margin-top: var(--margin)'>
			<h3>Assignee:</h3>
			<Profile v-bind='assignee' v-if='assignee'/>
			<p v-else>unassigned</p>
		</div>
		<Subtitle class='_ts' static='left'>created <Timestamp :datetime='created'/></Subtitle>
		<Subtitle class='_ts' static='left' v-if='completed'>completed <Timestamp :datetime='completed'/></Subtitle>
	</router-link>
</template>
<script setup lang='ts'>
import { type ForceUpdateAction, type ModAction } from '@/utilities/report';
import Markdown from '@/components/Markdown.vue';
import Profile from '@/components/Profile.vue';
import Timestamp from '@/components/Timestamp.vue';
import Subtitle from '@/components/Subtitle.vue';

defineProps<ModAction>();
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
