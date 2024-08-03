<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Mod Queue</Title>
		<div class='container'>
			<router-link :to='"/mod/" + encodeURIComponent(entry.report.report_id)' class='entry interactable' v-for='entry in queue' v-if='queue'>
				<div class='_header'>
					<Profile v-bind='entry.report.reporter' v-if='entry.report.reporter'/>
					<div class='report-info'>
						<h3>type: {{entry.report.report_type}}</h3>
						<p v-if='entry.report.data.post'>Post: {{ entry.report.data.post }}</p>
						<p>URL: {{ entry.report.data.url }}</p>
					</div>
				</div>
				<Markdown :content='entry.report.data.message'/>
				<div style='margin-top: var(--margin)'>
					<h3>Assignee:</h3>
					<Profile v-bind='entry.assignee' v-if='entry.assignee'/>
					<div v-else>
						<button @click.prevent.stop='() => assignSelf(entry)' class='interactable nested'>assign self</button>
					</div>
				</div>
				<Subtitle class='_ts' static='left'>created <Timestamp :datetime='entry.report.created'/></Subtitle>
			</router-link>
			<div class='loading' v-else>
				Loading...
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { khatch } from '@/utilities';
import { type ModQueueEntry } from '@/utilities/report';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import Profile from '@/components/Profile.vue';
import Markdown from '@/components/Markdown.vue';
import Subtitle from '@/components/Subtitle.vue';
import Timestamp from '@/components/Timestamp.vue';

const router = useRouter();
const queue: Ref<ModQueueEntry[] | null> = ref(null);

khatch(`${host}/v1/mod`, {
	handleError: true,
}).then(r => r.json())
.then(r => queue.value = r as ModQueueEntry[]);

function assignSelf(entry: ModQueueEntry) {
	khatch(`${host}/v1/mod/assign/${entry.queue_id}`, {
		method: "PATCH",
		handleError: true,
	}).then(() => {
		router.push("/mod/" + encodeURIComponent(entry.report.report_id));
	});
}
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
	margin: 0 auto;
}
.mobile .container {
	width: 100%;
}

.loading {
	text-align: center;
}

.entry {
	margin-bottom: var(--margin);
	padding: var(--margin);
	display: block;
	position: relative;
}
.entry:last-child {
	margin: 0;
}

._header {
	margin-bottom: var(--margin);
	display: flex;
	flex-flow: row;
	align-items: flex-start;
}
._header > .report-info {
	margin-left: var(--margin);
}

h3 {
	margin: 0;
}

._ts {
	margin-top: var(--margin);
}
.nested {
	background: var(--bg3color);
}
</style>
