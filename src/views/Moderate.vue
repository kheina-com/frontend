<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Moderate Content</Title>
		<Post :postId='post.post_id' :nested='true' v-bind='post' hideButtons labels v-if='post'/>
		<div class='container' v-else>
			<span>Violating Post</span>
			<div class='post-field'>
				<input v-model='data.post' class='interactable text' placeholder='8-character post id'/>
				<button @click='() => fetchPost(data.post)' class='interactable'>Load&nbsp»</button>
			</div>
		</div>
		<div class='container'>
			<div class='container' v-if='reportData'>
				<span>Data included from the report</span>
				<button @click='showHistory = true' class='revisions' v-show='revisions'>{{ revisions }} revisions</button>
				<div class='report-data'>
					<p>Post: {{ reportData.post ?? "none"}}</p>
					<p>URL: {{ reportData.url }}</p>
					<Markdown :content='reportData.message' concise style='margin-top: var(--margin)'/>
				</div>
			</div>
			<div class='container'>
				<span>Select an action to perform below</span>
			</div>
			<div class='action-select'>
				<RadioButtons
					name='action-type'
					v-model:value='action'
					:data='[
						{ content: "Force Update", value: "force_update" },
						{ content: "Remove Post",  value: "remove_post" },
						{ content: "Account Ban",  value: "ban" },
						{ content: "IP Ban",       value: "ip_ban" },
					]'
				/>
			</div>
			<div class='action-description'>
				<p v-if='action === "ban"'>Locks the user's account, preventing them from posting again. Prevents other users from viewing their account or its contents.</p>
				<p v-else-if='action === "ip_ban"'>Locks the user's current IP address and the IP address they initially logged in from. Prevents anyone from that IP from creating a new account or logging in.</p>
				<p v-else-if='action === "remove_post"'>Prevents the post from being modified or viewed by non-mods and non-admins. The user can still view the post.</p>
				<p v-else-if='action === "force_update"'>Locks the post from being viewed by non-mods and non-admins until the user updates a specific field.</p>
			</div>
			<div class='container force-update' v-if='action === "force_update"'>
				<span>Violating Post</span>
				<div class='post-field' style='margin-bottom: var(--margin)'>
					<input v-model='data.post' @input='setFields' class='interactable text' placeholder='post id'/>
					<button @click='() => fetchPost(data.post)' class='interactable'>Load »</button>
				</div>
				<span>Field and change that must be applied to the post before it is unlocked</span>
				<div v-for='i in fieldUpdates.length' class='field-updates'>
					<select name='post-field' v-model='fieldUpdates[i-1].field' @change='setFields' placeholder='field' class='interactable'>
						<option value='rating'>Rating</option>
						<option value='title'>Title</option>
						<option value='description'>Description</option>
						<option value='privacy'>Privacy</option>
						<option value='tags'>Tags</option>
					</select>
					<input name='post-field-value' v-model='fieldUpdates[i-1].value' @change='setFields' placeholder='value to add' autocomplete='off' class='interactable'>
					<button class='interactable' @click='fieldUpdates.splice(i-1, 1); setFields()'><i class='material-icons-outline'>delete</i>Remove</button>
				</div>
				<div class='buttons'>
					<button class='interactable' @click='fieldUpdates.push({ }); setFields()'><i class='material-icons'>add</i>Add Field</button>
				</div>
			</div>
			<div class='container' v-else-if='action === "ban" || action === "ip_ban"'>
				<span>Violating User</span>
				<input v-model='data.user' @input='setFields' class='interactable text' placeholder='user handle'/>
			</div>
			<div class='container' v-else-if='action === "remove_post"'>
				<span>Violating Post</span>
				<div class='post-field' style='margin-bottom: var(--margin)'>
					<input v-model='data.post' @input='setFields' class='interactable text' placeholder='post id'/>
					<button @click='() => fetchPost(data.post)' class='interactable'>Load »</button>
				</div>
			</div>
			<div class='container'>
				<span>Message that will be sent to the reporter regarding the above action</span>
				<textarea class='interactable text' v-model='data.response'></textarea>
			</div>
			<div class='container'>
				<span>Message listed alongside the action for the violator</span>
				<textarea class='interactable text' v-model='data.reason'></textarea>
			</div>
			<div class='container'>
				<span>Action data</span>
				<pre>{
	report_id   (required): {{ JSON.stringify(data?.report_id) ?? placeholder }},
	response    (required): {{ JSON.stringify(data?.response) ?? placeholder }},
	reason      (required): {{ JSON.stringify(data?.reason) ?? placeholder }},
	action_type (required): {{ JSON.stringify(data?.action_type) ?? placeholder }},
	action      (required): {{ JSON.stringify(data?.action, null, "\t")?.replace(/\n/g, "\n\t") ?? placeholder }},
}</pre>
			</div>
			<div class='container buttons'>
				<button class='interactable' @click='closeNoAction'>Close without Action</button>
				<button class='interactable' @click='takeAction'>Take Action »</button>
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
import type { PostLike } from '@/types/post';
import type { Report, ReportData } from '@/types/report';
import { computed, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { createToast, khatch } from '@/utilities';
import { reportHistory, reportRevisions } from '@/utilities/report';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import Post from '@/components/Post.vue';
import Markdown from '@/components/Markdown.vue';

type ActionType = "force_update" | "remove_post" | "ban" | "ip_ban";

interface RemovePostAction {
	post: string,
}

interface FieldUpdates {
	rating:      null | string,
	title:       null | string,
	description: null | string,
	privacy:     null | string,
	tags:        null | string,
}

interface ForceUpdateAction {
	post:          string
	field_updates: FieldUpdates
}

interface BanAction {
	user:     string,
	duration: number,
}

interface CreateAction {
	report_id:   number,
	action_type: ActionType,
	response:    string,
	reason:      string,
	action:      RemovePostAction | ForceUpdateAction | BanAction,
}

interface CloseWithoutAction {
	response: string,
}

const placeholder = "undefined";
const route = useRoute();
const report: Ref<Report | null> = ref(null);
const reportData: Ref<ReportData | null> = ref(null);
const showHistory: Ref<boolean> = ref(false);
const data: Ref<{ [k: string]: any }> = ref(Object.fromEntries(Object.entries(route.query).map(([k, v]) => [k, v?.toString() ?? null])));
const action: Ref<ActionType | undefined> = ref();
const post: Ref<PostLike | null> = ref(null);
const fieldUpdates: Ref<{ field?: string, value?: string }[]> = ref([{ }]);

const props = defineProps<{
	id?: number,
}>();

const history = computed(() => reportHistory(report.value));
const revisions = computed(() => reportRevisions(report.value));

if (route.query?.post) {
	fetchPost(route.query.post.toString());
}

if (props?.id) {
	data.value.report_id = parseInt(props.id.toString());
	khatch(`${host}/v1/report/${props.id}`)
	.then(r => r.json())
	.then(r => {
		report.value = r as Report;
	});	
}

function closeNoAction() {
	const title = "unable to close report";
	if (!data.value.report_id) {
		return createToast({
			title,
			description: "no report id available (should be in the url /mod/:report_id)",
		});
	}
	if (!data.value.response) {
		return createToast({
			title,
			description: "no reporter response written",
		});
	}

	const cna: CloseWithoutAction = {
		response: data.value.response,
	}

	khatch(`${host}/v1/report/${data.value.report_id}`, {
		method: "DELETE",
		errorMessage: "failed to close report",
		body: cna,
	}).then(() =>
		createToast({
			title: "Report Closed",
			icon:  "done",
			color: "green",
		})
	);
}

function takeAction() {
	const title = "unable to take action";
	if (!action.value) {
		return createToast({
			title,
			description: "no action type selected",
		});
	}
	if (!data.value.report_id) {
		return createToast({
			title,
			description: "no report id available (should be in the url /mod/:report_id)",
		});
	}
	if (!data.value.response) {
		return createToast({
			title,
			description: "no reporter response written",
		});
	}
	if (!data.value.reason) {
		return createToast({
			title,
			description: "no action reason written",
		});
	}
	if (!data.value.action) {
		return createToast({
			title,
			description: "no action specified",
		});
	}

	const ca: CreateAction = {
		report_id:   data.value.report_id,
		response:    data.value.response,
		reason:      data.value.reason,
		action_type: action.value,
		action:      data.value.action,
	};

	khatch(`${host}/v1/action`, {
		method: "PUT",
		errorMessage: "failed to create mod action",
		body: ca,
	}).then(() =>
		createToast({
			title: "Action Created",
			icon:  "done",
			color: "green",
		})
	);
}

function fetchPost(postId: string) {
	post.value = null;
	khatch(`${host}/v1/post/${postId}`, {
		handleError: true,
	}).then(response => response.json())
	.then(response => {
		response.favorites = 0;
		response.reposts = 0;
		post.value = response;
	});
}

function setFields() {
	switch (action.value) {
	case "force_update":
		if (!data.value?.post) {
			return createToast({
				title: "Post is undefined",
				description: "action cannot be taken on post without a post id",
			});
		}
		data.value.action = {
			post: data.value.post,
			field_updates: { },
		};
		data.value.action.field_updates = { };
		fieldUpdates.value.forEach(entry => data.value.action.field_updates[entry.field ?? "null"] = entry.value);
		break;

	case "ban":
	case "ip_ban":
		data.value.action = { };
		data.value.action.user = data.value.user = data.value.user ?? post.value?.user?.handle;
		break;

	default:
		data.value.action = {
			post: data.value.post,
		};
	}
}

watch(action, (value?: ActionType) => {
	data.value.action_type = value;
	setFields();
});

watch(report, (report: Report | null) => {
	if (!report) return;
	if (report.data.post && report.data.post !== post.value?.post_id) fetchPost(report.data.post);

	reportData.value = {
		post:    report.data.post,
		url:     report.data.url,
		message: report.data.message,
	};
	data.value.post = report.data.post;
});

watch(data, (value: { [k: string]: any; }) => {
	if (value?.post && value.post !== post.value?.post_id) post.value = null;
});

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
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
input:hover {
	color: var(--interact);
}
input:active, input:focus {
	color: var(--textcolor);
}

.not-mod {
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	margin: auto;
}

.not-mod i {
	margin-right: 0.25em;
}

.container, .action-description {
	position: relative;
	width: 60vw;
	min-width: 600px;
}
.mobile .container, .mobile .action-description {
	width: 100%;
}
.container {
	margin: var(--margin) auto 0;
}
.action-description {
	text-align: center;
	margin: 0.5em auto var(--margin);
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
	margin: 0 auto;
}
pre code {
	padding: 0;
}

.action-select {
	margin-bottom: 0.5em;
}

.radio-buttons {
	justify-content: center;
}

span {
	padding-bottom: 0.1em;
}

.buttons {
	margin-top: var(--margin);
	text-align: right;
}
.buttons > * {
	margin-right: 25px;
}
.buttons :last-child {
	margin-right: 0;
}

.field-updates {
	display: flex;
	margin-bottom: 1em;
}
.force-update .buttons {
	margin-top: 0;
}
.field-updates > input {
	margin: 0 var(--margin);
	width: 100%;
}
.force-update  button {
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
}
.force-update button i {
	margin-right: 0.25em;
}

.revisions {
	position: absolute;
	right: var(--margin);
	left: auto;
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

.history-revision, .report-data {
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
.report-data {
	margin: 0 auto;
	background: var(--bg2color);
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

@media only screen and (max-width: 1200px) {
	.container, .action-description {
		width: auto;
	}
}
</style>
