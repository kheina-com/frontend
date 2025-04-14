<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>	
		<Title>Report Content</Title>
		<div class='report-post' v-if='post'>
			<Post :postId='post.post_id' :nested='true' v-bind='post' hideButtons labels/>
			<button @click='post = null' class='close-post'><i class='material-icons-round'>close</i></button>
		</div>
		<div class='container' v-else>
			<span>Violating Post</span>
			<div class='post-field'>
				<input v-model='data.post' class='interactable text' placeholder='8-character post id'/>
				<button @click='() => fetchPost(data.post)' class='interactable'>Load&nbsp»</button>
			</div>
		</div>
		<div class='container'v-if='report'>
			<span>Report type</span>
		</div>
		<div class='container' v-else>
			<span>Select a report type below</span>
		</div>
		<div ref='radioButtons' class='type-select'>
			<RadioButtons
				name='report-type'
				v-model:value='data.report_type'
				:disabled='!!report'
				:data="[
					{ content: 'DMCA / Copyright',          value: 'copyright' },
					{ content: 'Improper Rating',           value: 'improper_rating' },
					{ content: 'Misinformation',            value: 'misinformation' },
					{ content: 'Impersonation',             value: 'impersonation' },
					{ content: 'Harassment / Intimidation', value: 'harassment' },
					{ content: 'Call to Violence',          value: 'violence' },

					// please always put other last
					{ content: 'Other', value: 'other' },
				]"
			/>
		</div>
		<div class='container'>
			<div v-show='data.report_type === "copyright"'>
				<div class='container'>
					<span>For legal reasons, additional fields will need to be added for DMCA</span>
					<textarea class='interactable text'></textarea>	
				</div>
			</div>
			<div class='container'>
				<span>Data included in this report</span>
				<button @click='showHistory = true' class='revisions' v-show='revisions'>{{ revisions }} revisions</button>
				<pre>{{ JSON.stringify(data, null, 4) }}</pre>
			</div>
			<div class='container'>
				<span>URL violation occurred on</span>
				<input v-model='data.url' class='interactable text'/>
			</div>
			<div class='container'>
				<span>Please describe the reason for your report below, including any offending usernames and post ids</span>
				<MarkdownEditor v-model:value='data.message' resize='vertical'/>
				<div class='buttons'>
					<button class='interactable' @click='sendReport'>{{ !report ? "Submit" : "Update" }} »</button>
				</div>
			</div>
			<div class='history' v-if='showHistory'>
				<div class='history-revision' v-for='(rd, rev) in history'>
					<p>Revision: {{ !rev ? "Current" : history.length - rev }}</p>
					<p>Post: {{ rd.post ?? "none"}}</p>
					<p>URL: {{ rd.url }}</p>
					<Markdown :content='rd.message' concise style='margin-top: var(--margin)'/>
				</div>
				<div class='buttons'>
					<button class='interactable' @click='showHistory = false'>Close</button>
				</div>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import type { Report, ReportType } from '@/types/report';
import type { PostLike } from '@/types/post';
import { computed, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createToast, khatch } from '@/utilities';
import { reportHistory, reportRevisions } from '@/utilities/report';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import Post from '@/components/Post.vue';	
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';

interface CreateReport {
	report_type: ReportType,
	post?:       string,
	message:     string,
	url:         string,
}

const route = useRoute();
const router = useRouter();
const data: Ref<{ [k: string]: any }> = ref(Object.fromEntries(Object.entries(route.query).map(([k, v]) => [k, v?.toString() ?? null])));
const post: Ref<PostLike | null> = ref(null);
const report: Ref<Report | null> = ref(null);
const showHistory: Ref<boolean> = ref(false);

const radioButtons = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

const props = defineProps<{
	id?: number,
}>();

const history = computed(() => reportHistory(report.value));
const revisions = computed(() => reportRevisions(report.value));

if (route.query?.post) {
	fetchPost(route.query.post.toString());
}

if (props?.id) {
	khatch(`${host}/v1/report/${props.id}`)
	.then(res => res.json())
	.then(res => {
		report.value = res as Report;
	});
}


function sendReport() {		
	const r: CreateReport = data.value as CreateReport;
	if (report.value?.report_id) {
		khatch(`${host}/v1/report/${report.value.report_id}`, {
			method: "PATCH",
			errorHandlers: {
				401: () => router.push("/a/login?path=" + encodeURIComponent(route.fullPath)),
			},
			body: r,
		}).then(() => {
			if (!report.value) return;
			report.value.data = {
				post: r.post ?? null,
				url: r.url,
				message: r.message,
				prev: report.value.data,
			};
		}).then(() => {
		createToast({
			icon: "done",
			title: "Report Updated!",
			color: "green",
			time: 5,
		});
	});
	}
	else {
		khatch(`${host}/v1/report`, {
			method: "PUT",
			errorHandlers: {
				401: () => router.push("/a/login?path=" + encodeURIComponent(route.fullPath)),
			},
			body: r,
		}).then(res => res.json())
		.then(res => {
			report.value = res as Report;
			router.replace("/r/" + report.value.report_id.toString());
		}).then(() => {
		createToast({
			icon: "done",
			title: "Report Created!",
			color: "green",
			time: 5,
		});
	});
	}
}

function fetchPost(postId: string) {
	post.value = null;
	khatch(`${host}/v1/post/${postId}`, {
		handleError: true,
	}).then(r => r.json())
	.then(response => {
		response.favorites = 0;
		response.reposts = 0;
		post.value = response;
	});
}

watch(report, (report: Report | null) => {
	if (!report) return;
	if (report.data.post && report.data.post !== post.value?.post_id) fetchPost(report.data.post);
	radioButtons.value.classList.add("disabled");

	data.value.report_type = report.report_type;
	data.value.post = report.data.post;
	data.value.message = report.data.message;
	data.value.url = report.data.url;
});

watch(data, (value: { [k: string]: any; }) => {
	if (value?.post && value.post !== post.value?.post_id) post.value = null;
})
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
.container, .type-select.disabled {
	position: relative;
	width: 50vw;
	min-width: 600px;
	margin: var(--margin) auto 0;
}
.mobile .container, .mobile .type-select.disabled {
	width: 100%;
}
textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}
span {
	position: relative;
	left: var(--margin);
}
pre {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
	margin: auto;
}
pre code {
	padding: 0;
}
.type-select, .type-select.disabled {
	margin: 0 auto var(--margin);
}
.type-select.disabled > .radio-buttons {
	justify-content: start;
}
.type-select > .radio-buttons {
	justify-content: center;
}

.buttons {
	margin-top: var(--margin);
	text-align: right;
}

span {
	padding-bottom: 0.1em;
}

.revisions {
	position: absolute;
	right: var(--margin);
	left: auto;
}

input {
	display: block;
	width: 100%;
}

.post {
	margin-top: var(--margin);
}

.md-link {
	position: absolute;
	right: var(--margin);
	font-size: 0.9em;
	color: var(--subtle);
}

.post-field {
	display: flex;
}

.post-field input {
	margin-right: var(--margin);
}

button {
	word-wrap: normal;
	white-space: nowrap;
}

.history {
	position: absolute;
	top: 0;
	height: 100%;
	background: var(--bg2color);
	padding: 0 var(--margin);
	border-radius: var(--border-radius);
	width: 100%;
	left: var(--neg-margin);
	border: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	overflow: scroll;
}

.history button {
	background: var(--bg3color);
	margin-bottom: var(--margin);
}

.history-revision {
	margin: var(--margin) auto 0;
	background: var(--bg3color);
	padding: var(--margin);
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}

.report-post {
	margin-top: var(--margin);
	position: relative;
}

.close-post {
	position: absolute;
	top: 0;
	right: 0;
}
.close-post > i {
	font-size: 1.5em;
	padding: 0.5em;
}
.close-post:hover {
	color: var(--red);
}
</style>
