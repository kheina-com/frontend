<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button class='interactable edit-button' @click='editToggle' v-if='editable'>
			<i class='material-icons'>{{editing ? 'edit_off' : 'edit'}}</i>
		</button>
		<Loading v-if='editing' class='editing' type='block' :isLoading='pendingUpdate'>
			<div>
				<h2>Title</h2>
				<input class='interactable text' v-model='updateBody.title'>
				<div class='title'>
					<Markdown :content='updateBody.title' inline v-show='updateBody.title'/>
				</div>
			</div>
			<div>
				<h2>Owner</h2>
				<input class='interactable text' v-model='updateBody.owner'>
			</div>
			<div>
				<h2>Privacy</h2>
				<select name='set-privacy' v-model='updateBody.privacy' placeholder='privacy' class='interactable'>
					<option value='public'>public</option>
					<option value='private'>private</option>
				</select>
			</div>
			<div>
				<h2>Description</h2>
				<MarkdownEditor class='markdown-editor' resize='vertical' v-model:value='updateBody.description'/>
			</div>
			<div class='update-button'>
				<Button @click='updateSet' green><i class='material-icons-round'>check</i><span>Update</span></Button>
				<Button @click='deleteSet' red><i class='material-icons-outline'>delete</i><span>Delete</span></Button>
			</div>
		</Loading>
		<div v-else>
			<Title>
				<Loading :isLoading='!setData' span>
					<Markdown :content='setData?.title || "this set does not exist"' inline lazy/>
				</Loading>
			</Title>
			<div class='set'>
				<div>
					<p class='set-field'>
						<i class='material-icons'>schedule</i>
						<Loading :isLoading='!setData' span>created: <Timestamp class='timestamp' :datetime='setData?.created'/></Loading>
					</p>
					<p class='set-field' v-show='setData?.created !== setData?.updated'>
						<span>(updated: <Timestamp class='timestamp' :datetime='setData?.updated'/>)</span>
					</p>
				</div>
				<div class='privacy' v-show='setData?.privacy !== "public"'>
					<p>{{ setData?.privacy }}</p>
				</div>
				<ShareLink :content='`/s/${setData?.set_id}`' v-show='setData?.privacy === "public"'/>
				<div>
					<Profile :isLoading='isLoading' v-bind='setData?.owner'/>
				</div>
			</div>
			<div class='markdown-block'>
				<Markdown :content='setDescription'/>
				<!-- TODO: add a button here to toggle showMore -->
			</div>
		</div>
		<div class='buttons'>
			<div>
				<button v-if='false'><i class='material-icons'>notification_add</i></button>
				<DropDown v-model:value='sort' :options='[
					{ html: "Newest",        value: "new" },
					{ html: "Oldest",        value: "old" },
					{ html: "Top",           value: "top" },
					{ html: "Hot",           value: "hot" },
					{ html: "Best",          value: "best" },
					{ html: "Controversial", value: "controversial" },
				]'>
					<span class='sort-by'>
						<i class='material-icons-round'>sort</i>
						sort by
					</span>
				</DropDown>
			</div>
			<div>
				<CheckBox
					:border='false'
					id='search-results-tiles'
					name='search-results-tiles'
					class='checkbox'
					v-model:checked='tiles'
					nested
				>Tiles</CheckBox>
			</div>
		</div>
		<ol class='results'>
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found in set <em>{{ setData?.title ?? props.setId }}</em></p>
			<li v-for='post in posts || setData?.count || 20' v-else-if='tiles'>
				<PostTile :key='post?.post_id' :postId='post?.post_id' :nested='true' v-bind='post' link/>
			</li>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length ? Math.ceil(total_results / count) : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/globals';
import { khatch, saveToHistory, setTitle, createToast } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Loading from '@/components/Loading.vue';
import Post from '@/components/Post.vue';
import Profile from '@/components/Profile.vue';
import Button from '@/components/Button.vue';
import Markdown from '@/components/Markdown.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import DropDown from '@/components/DropDown.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import CheckBox from '@/components/CheckBox.vue';
import PostTile from '@/components/PostTile.vue';
import Title from '@/components/Title.vue';
import Timestamp from '@/components/Timestamp.vue';
import ShareLink from '@/components/ShareLink.vue';

const path = "/s/";
const route = useRoute();
const router = useRouter();
const globals = store();
const props = defineProps<{
	setId: string,
}>();

const tiles: Ref<boolean> = ref(globals.tiles);
const setData: Ref<PostSet | null> = ref(null);
const posts: Ref<any[] | null | void> = ref();
const editing: Ref<boolean> = ref(false);
const showMore: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const count: Ref<number> = ref(64);
const sort: Ref<string | null> = ref(null);
const total_results: Ref<number> = ref(1);

const updateBody: Ref<any> = ref();
const pendingUpdate: Ref<boolean> = ref(false);

fetchPosts();
khatch(`${host}/v1/sets/${props.setId}`, {
	errorMessage: "Could not retrieve set with id: " + props.setId,
}).then(response => {
	response.json().then(r => {
		setData.value = r;
		setTitle(`Set: ${r.title} | fuzz.ly`);	
	});
});

const isLoading = computed(() => !setData.value);
const editable = computed(() => (globals.user && setData.value?.owner?.handle === globals.user?.handle) || Boolean(globals.auth?.scope?.includes("admin")));
const setDescription = computed(() => {
	if (!setData.value?.description) return null;

	const newline = setData.value.description.indexOf("\n", setData.value.description.indexOf("\n") + 1);
	if (newline >= 0) {
		showMore.value = true;
		return setData.value.description.substring(0, newline);
	}

	return setData.value.description;
});

function fetchPosts() {
	if (!route.path.startsWith(path + props.setId)) return;

	page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
	count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;
	sort.value = route.query?.sort ? route.query?.sort.toString() : "old";

	if (window.history.state.posts) {
		posts.value = window.history.state.posts;
		total_results.value = window.history.state.total;
		return;
	}

	posts.value = null;

	khatch(`${host}/v1/posts`, {
		errorMessage: "Could not retrieve posts from set!", 
		method: "POST",
		body: {
			sort: sort.value,
			tags: ["set:" + props.setId],
			page: page.value,
			count: count.value,
		},
	}).then(response => {
		response.json().then(r => {
			saveToHistory(r)
			posts.value = r.posts;
			total_results.value = r.total;
		});
	});
}

function editToggle() {
	editing.value = !editing.value;
	if (editing.value && setData.value) {
		updateBody.value.title = setData.value.title;
		updateBody.value.description = setData.value.description;
		updateBody.value.owner = setData.value.owner.handle;
		updateBody.value.privacy = setData.value.privacy
	}
}

function updateSet() {
	pendingUpdate.value = true;

	const body: any = { mask: [] };

	if (updateBody.value?.title && updateBody.value.title !== setData.value?.title) {
		body.title = updateBody.value.title;
		body.mask.push("title");
	}

	if (updateBody.value?.owner && updateBody.value.owner !== setData.value?.owner?.handle) {
		body.owner = updateBody.value.owner;
		body.mask.push("owner");
	}

	if (updateBody.value?.description && updateBody.value.description !== setData.value?.description) {
		body.description = updateBody.value.description;
		body.mask.push("description");
	}

	if (updateBody.value?.privacy && updateBody.value.privacy !== setData.value?.privacy) {
		body.privacy = updateBody.value.privacy;
		body.mask.push("privacy");
	}

	if (body.mask.length === 0) {
		pendingUpdate.value = false;
		editing.value = false;
		createToast({
			title: "Could not update set!",
			description: "nothing to update.",
		});
		return;
	}

	khatch(`${host}/v1/sets/${props.setId}`, {
		errorMessage: "Could not update set!",
		method: "PATCH",
		body,
	}).then(() => {
		if (body.hasOwnProperty("owner")) {
			khatch(`${host}/v1/user/${body.owner}`, {
				errorMessage: "Failed to retrieve new set owner.",
			}).then(response => {
				response.json().then(r => {
					if (!setData.value) return;
					setData.value.owner = {
						handle:    r.handle,
						name:      r.name,
						icon:      r.icon,
						privacy:   r.privacy,
						verified:  r.verified,
						following: r.following,
					};
				});
			});
		}

		setData.value = {
			...setData.value,
			...body,
		};

		if (body.title)
		{ setTitle(`Set: ${body.title} | fuzz.ly`); }
	}).finally(() => {
		pendingUpdate.value = editing.value = false;
	});
}

function deleteSet() {
	pendingUpdate.value = true;
	khatch(`${host}/v1/sets/${props.setId}`, {
		errorMessage: "Could not delete set!",
		method: "DELETE",
	}).then(() => {
		setData.value = { } as PostSet;
	}).finally(() => {
		pendingUpdate.value = false;
		editing.value = false;
	});
}

function pageLink(p: number) {
	let query = [];

	if (p !== 1)
	{ query.push(`page=${p}`); }

	if (count.value !== 64)
	{ query.push(`count=${count.value}`); }

	if (sort.value !== "hot")
	{ query.push(`sort=${sort.value}`); }

	return path + encodeURIComponent(props.setId) + "?" + query.join("&");
}

function setPage(p: number) {
	page.value = p;
	router.push(pageLink(page.value));
}

watch(tiles, globals.searchResultsTiles);
watch(() => route.query, fetchPosts);
watch(sort, () => {
	if (route.name !== "set")
	{ return; }
	router.push(pageLink(page.value));
});
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
	display: block;
}
.profile {
	margin-top: 0;
}
a.profile:hover {
	background: var(--bg2color);
}
ul {
	margin: 0;
	padding-left: var(--margin);
}
.set {
	width: 70vw;
	margin: 0 auto var(--margin);
	display: flex;
	justify-content: space-between;
}
.set h2, .editing h2 {
	margin: 0;
}
.set-field {
	display: flex;
	align-items: center;
}
.set-field i {
	margin: 0 0.25em 0 0;
}
.timestamp {
	color: var(--textcolor);
}
.markdown-block {
	width: 70vw;
	margin: 0 auto var(--margin);
}
.markdown-editor {
	background: var(--bg2color);
}
.mobile .markdown-block, .mobile .set {
	width: auto;
}

.editing .title {
	margin-top: 1em;
}

.edit-button {
	margin-left: 0.5em;
	padding: 0.25em;
	position: absolute;
	right: var(--margin);
}
.edit-button i {
	display: block;
}
.update-button {
	margin: 0 auto var(--margin);
	display: flex;
	justify-content: center;
}
.update-button > * {
	margin-right: var(--margin);
}
.update-button > :last-child {
	margin: 0;
}
.update-button button i {
	margin-right: 0.2em;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}

.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: var(--neg-half-margin);
}
.tiles ol li {
	margin: var(--half-margin);
}

.page-links {
	margin-top: var(--margin);
}

.buttons {
	margin: 0 var(--margin);
	display: flex;
	justify-content: space-between;
}
.buttons button {
	color: var(--subtle);
	margin-right: var(--margin);
}
.buttons button:hover {
	color: var(--interact);
}
.sort-by {
	display: flex;
	align-items: center;
	color: var(--subtle);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.sort-by i {
	margin-right: 0.25em;
}
.sort-by:hover {
	color: var(--interact);
}

.privacy, .checkbox {
	color: var(--subtle);
}

ul {
	margin: 0 0 0 1em;
	padding: 0;
}

.editing {
	width: 70vw;
	margin: 0 auto var(--margin);
	display: flex;
	flex-direction: column;
}
.editing h2 {
	margin-left: var(--margin);
}
.editing > * {
	margin-bottom: var(--margin);
}
.editing > :last-child {
	margin-bottom: 0;
}

.interactable.text {
	width: 100%;
}

@media only screen and (max-width: 1200px) {
	.set, .editing, .markdown-block {
		margin: 0 0 var(--margin);
		width: auto;
	}
}

/* theme overrides */
html.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 var(--margin);
}

html.e621 .subject {
	color: var(--green);
}

html.e621 .sponsor {
	color: var(--violet);
}
</style>
