<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button class='interactable edit-button' @click='editToggle' v-if='editable'>
			<i class='material-icons'>{{editing ? 'edit_off' : 'edit'}}</i>
		</button>
		<Loading v-if='editing' class='editing' type='block' :isLoading='pendingUpdate'>
			<div class='tag'>
				<div>
					<h2>Tag</h2>
					<input class='interactable text' v-model='updateBody.name'>
				</div>
				<div>
					<h2>Class</h2>
					<select name='tag-class' v-model='updateBody.group' placeholder='class' class='interactable'>
						<option value='artist'>artist</option>
						<option value='subject'>subject</option>
						<option value='species'>species</option>
						<option value='gender'>gender</option>
						<option value='misc'>misc</option>
					</select>
				</div>
				<div>
					<h2>Inherited Tags</h2>
					<ul>
						<li v-for='tag in tagData?.inherited_tags'>
							<button @click='removeInheritance(tag)'><i class='material-icons'>close</i></button>
							<span>
								{{tag.replace(/_/g, ' ')}}
							</span>
						</li>
					</ul>
				</div>
				<div>
					<h2>Owner</h2>
					<input class='interactable text' v-model='updateBody.owner'>
				</div>
			</div>
			<div class='add-inherited-tag'>
				<h2>Add Inherited Tag</h2>
				<p>warning: this will add the new inherited tag to every post containing "{{tag.replace(/_/g, ' ')}}"</p>
				<div>
					<input class='interactable text' placeholder='inherited tag' v-model='newInheritedTag'>
					<Button @click='inheritTag' :isLoading='newInheritLoading'><i class='material-icons'>add</i><span>Add Tag</span></Button>
				</div>
			</div>
			<MarkdownEditor class='markdown-editor' resize='vertical' v-model:value='updateBody.description'/>
		</Loading>
		<div class='tag' v-else>
			<div>
				<h2>Tag</h2>
				<Loading v-if='isLoading'>default</Loading>
				<p :class='tagData?.group' v-else>
					{{tagData?.tag.replace(/_/g, ' ')}}
				</p>
			</div>
			<div>
				<h2>Class</h2>
				<Loading v-if='isLoading'>default</Loading>
				<i e-else>{{tagData?.group}}</i>
			</div>
			<div>
				<h2>Inherited Tags</h2>
				<Loading v-if='isLoading'>default</Loading>
				<ul v-else-if='tagData?.inherited_tags.length'>
					<li v-for='tag in tagData.inherited_tags'>
						<router-link :to='`/t/${tag}`'>
							{{tag.replace(/_/g, ' ')}}
						</router-link>
					</li>
				</ul>
				<b v-else>None</b>
			</div>
			<div>
				<h2>Owner</h2>
				<Profile :isLoading='isLoading' v-if='tagData?.owner' v-bind='tagData.owner'/>
				<b v-else>None</b>
			</div>
		</div>
		<Button @click='updateTag' green v-if='editing' class='update-button'><i class='material-icons-round'>check</i><span>Update</span></Button>
		<div class='markdown-block' v-else>
			<Markdown :content='tagDescription'/>
			<button v-show='showMore === false' class='show-more' @click='showMore = true'>show more</button>
		</div>
		<div class='buttons'>
			<div>
				<button v-if='false'><i class='material-icons'>notification_add</i></button>
				<DropDown v-model:value='sort' :options="[
					{ html: 'Newest', value: 'new' },
					{ html: 'Oldest', value: 'old' },
					{ html: 'Top', value: 'top' },
					{ html: 'Hot', value: 'hot' },
					{ html: 'Best', value: 'best' },
					{ html: 'Controversial', value: 'controversial' },
				]">
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
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{tag}}</em></p>
			<li v-for='post in posts || 20' v-else-if='tiles'>
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
import { khatch, saveToHistory, setTitle } from '@/utilities';
import { apiErrorMessage, host } from '@/config/constants';
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


const path = "/t/";
const route = useRoute();
const router = useRouter();
const globals = store();
const props = defineProps<{
	tag: string,
}>();

const tiles: Ref<boolean> = ref(globals.tiles);
const tagData: Ref<Tag | null> = ref(null);
const posts: Ref<any[] | null | void> = ref();
const editing: Ref<boolean> = ref(false);
const showMore: Ref<boolean | null> = ref(null);
const page: Ref<number> = ref(1);
const count: Ref<number> = ref(64);
const sort: Ref<string | null> = ref(null);
const total_results: Ref<number> = ref(1);

const updateBody: Ref<any> = ref({ });
const pendingUpdate: Ref<boolean> = ref(false);
const newInheritedTag: Ref<string> = ref("");
const newInheritLoading: Ref<boolean> = ref(false);

fetchPosts();

khatch(`${host}/v1/tag/${encodeURIComponent(props.tag)}`, {
	errorMessage: "Could not fetch tag details!",
	errorHandlers: {
		404: r => r.json().then(r => globals.setError(r.error || "NotFound: the provided tag does not exist.")),
	},
}).then(r => r.json())
.then(r => {
	tagData.value = r;
	setTitle(`${r.tag}, ${r.group} tag | fuzz.ly`);
});

const isLoading = computed(() => !tagData.value);
const editable = computed(() => (globals.user && tagData.value?.owner?.handle === globals.user?.handle) || Boolean(globals.auth?.scope?.includes("admin")));
const tagDescription = computed(() => {
	if (!tagData.value?.description) return null;

	const newline = tagData.value.description.indexOf("\n", tagData.value.description.indexOf("\n") + 1);
	if (newline >= 0 && !showMore.value) {
		showMore.value = false;
		return tagData.value.description.substring(0, newline);
	}

	return tagData.value.description;
});

function fetchPosts() {
	if (!route.path.startsWith(path + props.tag)) return;

	page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
	count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;
	sort.value = route.query?.sort ? route.query?.sort.toString() : "hot";

	if (window.history.state.posts) {
		posts.value = window.history.state.posts;
		total_results.value = window.history.state.total;
		return;
	}

	posts.value = null;

	khatch(`${host}/v1/posts`, {
		method: "POST",
		handleError: true,
		body: {
			sort: sort.value,
			tags: [props.tag],
			page: page.value,
			count: count.value,
		},
	}).then(r => r.json())
	.then(r => {
		saveToHistory(r)
		posts.value = r.posts;
		total_results.value = r.total;
	}).catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
	});
}
function editToggle() {
	editing.value = !editing.value;
	if (!editing.value || !tagData.value) return;

	updateBody.value.name = props.tag;
	updateBody.value.group = tagData.value.group;
	updateBody.value.description = tagData.value.description;
	updateBody.value.owner = tagData.value.owner?.handle;
}
function inheritTag() {
	if (!newInheritedTag.value) return;
	newInheritLoading.value = true;
	khatch(`${host}/v1/tag/inherit`, {
		method: "POST",
		errorMessage: "Could not create inheritance.",
		body: {
			parent_tag: props.tag,
			child_tag: newInheritedTag.value,
		},
	}).then(() => {
		if (!tagData.value) return;
		tagData.value.inherited_tags.push(newInheritedTag.value);
		newInheritedTag.value = "";
	}).finally(() => newInheritLoading.value = false);
}
function removeInheritance(tag_to_remove: string) {
	khatch(`${host}/v1/tag/remove_inheritance`, {
		method: "POST",
		errorMessage: "Could not remove inherited tag.",
		body: {
			parent_tag: props.tag,
			child_tag: tag_to_remove,
		},
	}).then(() => {
		if (!tagData.value) return;
		tagData.value.inherited_tags.splice(tagData.value.inherited_tags.indexOf(tag_to_remove), 1);
	});
}
function updateTag() {
	pendingUpdate.value = true;

	let body: any = { tag: props.tag };

	if (updateBody.value?.name && updateBody.value.name !== props.tag)
	{ body.name = updateBody.value.name; }

	if (updateBody.value?.group && updateBody.value.group !== tagData.value?.group)
	{ body.group = updateBody.value.group; }

	if (updateBody.value?.owner && updateBody.value.owner !== tagData.value?.owner?.handle)
	{ body.owner = updateBody.value.owner; }

	if (updateBody.value?.description && updateBody.value.description !== tagData.value?.description)
	{ body.description = updateBody.value.description; }

	khatch(`${host}/v1/tag/${props.tag}`, {
		method: "PATCH",
		handleError: true,
		body,
	}).then(() => {
		if (body.name) {
			router.push("/t/" + body.name);
			return;
		}

		if (!tagData.value) return;

		tagData.value.group = body?.group ?? tagData.value?.group;
		tagData.value.description = body?.description ?? tagData.value?.description;

		if (body.hasOwnProperty("owner")) {
			if (!body.owner) {
				tagData.value.owner = null;
			}
			else {
				khatch(`${host}/v1/user/${body.owner}`, {
					errorMessage: "Failed to retrieve new tag owner.",
				}).then(r => r.json())
				.then(r => {
					if (!tagData.value) return;
					tagData.value.owner = {
						handle:    r.handle,
						name:      r.name,
						icon:      r.icon,
						privacy:   r.privacy,
						verified:  r.verified,
						following: r.following,
					};
				}).catch(() => { });
			}
		}

		pendingUpdate.value = false;
		editing.value = false;
		showMore.value = null;
	}).catch(error => {
		globals.setError(apiErrorMessage, error);
		console.error(error);
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

	return path + encodeURIComponent(props.tag) + "?" + query.join("&");
}

function setPage(p: number) {
	page.value = p;
	router.push(pageLink(page.value));
}

watch(tiles, globals.searchResultsTiles);
watch(() => route.query, fetchPosts);
watch(sort, () => {
	if (route.name !== "tag")
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
h2, .add-inherited-tag p {
	margin: 0 0 10px;
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
.tag {
	width: 70vw;
	margin: 0 auto var(--margin);
	display: flex;
	justify-content: space-between;
}
.add-inherited-tag {
	width: 70vw;
	margin: 0 auto var(--margin);
}
.add-inherited-tag h2 {
	margin: 0;
}
.add-inherited-tag input {
	width: 100%;
	margin-right: var(--margin);
}
.add-inherited-tag div {
	display: flex;
}
.markdown-block {
	width: 70vw;
	margin: 0 auto var(--margin);
}
.markdown-editor {
	background: var(--bg2color);
	margin: 0 auto var(--margin);
	width: 70vw;
}
.mobile .markdown-block, .mobile .tag, .mobile .add-inherited-tag {
	width: auto;
}
.show-more {
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

.checkbox {
	color: var(--subtle);
}

.artist {
	color: var(--pink);
}

.sponsor {
	color: var(--green);
}

.subject {
	color: var(--violet);
}

.species {
	color: var(--orange);
}

.gender {
	color: var(--blue);
}

.misc {
	color: var(--subtle);
}

ul {
	margin: 0 0 0 1em;
	padding: 0;
}

.editing ul {
	list-style-type: none;
	margin: 0;
}

.editing ul li {
	display: flex;
	justify-items: center;
}

.editing ul li button {
	font-size: 0.8em;
}

.editing ul li i {
	display: block;
}

.mobile .editing .tag {
	justify-content: flex-start;
	flex-flow: column;
}

.mobile .editing h2 {
	margin-left: var(--margin);
}

.mobile .tag .interactable.text {
	width: 100%;
}

@media only screen and (max-width: 1200px) {
	.tag, .add-inherited-tag {
		margin: 0 0 var(--margin);
		width: auto;
	}
	.markdown-editor, .markdown-block {
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
