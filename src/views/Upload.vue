<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button @click.stop.prevent='() => toggleDrafts()' class='drafts-button'><i class='material-icons'>{{showDrafts ? 'chevron_left' : 'chevron_right'}}</i>Drafts <span v-show='drafts'>({{ drafts?.length }})</span></button>
		<div ref='draftsPanel' @click.stop.prevent class='drafts-panel'>
			<button @click='fetchDrafts' class='refresh-drafts' title='refresh drafts'><i class='material-icons'>refresh</i></button>
			<div class='menu-border'/>
			<ol class='results'>
				<p v-show='drafts?.length === 0' style='text-align: center'>No drafts found</p>
				<li v-for='post in drafts || [undefined, undefined, undefined]' @click='closeDrafts'>
					<Post :postId='post?.post_id' :to='`/create?post=${post?.post_id}`' v-bind='post' hideButtons/>
				</li>
			</ol>
		</div>
		<Title static='center'>New Post</Title>
		<Subtitle static='center'>Your post {{PublishedPrivacies.has(privacy)? 'is' : 'will be'}} live at <Loading :isLoading='!postId' span><router-link :to='`/p/${postId}`'>{{environment === 'prod' ? `fuzz.ly/p/${postId}` : `dev.fuzz.ly/p/${postId}`}}</router-link></Loading></Subtitle>
		<div class='form'>
			<Loading type='block' :isLoading='isUploading'>
				<!-- this hasn't been implemented server-side yet, though the field is already handled here -->
				<!-- <div class='field'>
					<div>
						<span>Reply To</span>
						<input class='interactable text' v-model='update.parent'>
						<div v-if='validParent'>
							<Post :postId='parentPost.post_id' v-bind='parentPost' style='margin-top: var(--margin)' nested hideButtons/>
						</div>
						<div v-else-if='update.parent' style='margin-top: var(--margin)'>
							invalid post id
						</div>
					</div>
				</div> -->
				<div class='field'>
					<div>
						<span>File</span>
						<FileField v-model:file='file' :showSlot='uploadDone && !file' v-model:width='width' v-model:height='height'>
							<Media :key='postId' :mime='mime' :src='mediaUrl' :link='false' v-model:width='width' v-model:height='height'/>
						</FileField>
						<div class='field flex' v-if='file'>
							<div>
								width: {{width ? commafy(width) : '...'}}px height: {{height ? commafy(height) : '...'}}px
								<br>
								size: {{abbreviateBytes(file.size)}}
							</div>
							<div class='actions'>
								<CheckBox
									class='checkbox'
									id='resize-for-web'
									name='resize-for-web'
									v-model:checked='showResize'
									@click='update.webResize = "1500"'
								>Resize For Web</CheckBox>
								<Button @click='uploadFile(true)' green><i class='material-icons'>upload</i><span>Upload</span></Button>
							</div>
						</div>
					</div>
				</div>
				<div class='field resize-field' v-if='showResize'>
					<div>
						<span>Longest Side in Pixels to Resize</span>
						<input class='interactable text' v-model='update.webResize'>
					</div>
					<div>
						<span>Resized Dimensions</span>
						<div v-if='resized'>
							width: {{resized ? commafy(resized?.width) : '...'}}px height: {{resized ? commafy(resized?.height) : '...'}}px
							<br>
							size: {{resized.scale.toFixed(2)}}%
						</div>
					</div>
				</div>
				<template v-slot:onLoad>
					<Spinner :loaded='uploadLoaded' :total='uploadTotal'/>
					<!-- <ProgressBar :fill='uploadProgress'/> -->
				</template>
			</Loading>
			<!-- <Media :mime='mime' :src='mediaUrl' v-model:width='width' v-model:height='height' style='margin-top: var(--margin)' v-else/> -->
			<div class='field'>
				<div>
					<span>Title</span>
					<input class='interactable text' v-model='update.title'>
					<Markdown class='title-render' :content='update.title' v-show='update.title' inline/>
				</div>
			</div>
			<div class='field'>
				<div>
					<span>Description</span>
					<router-link style='position: absolute; right: var(--margin); font-size: 0.9em' to='/md'>markdown guide</router-link>
					<MarkdownEditor v-model:value='update.description' :hideGuide='true' style='min-width: 100%; display: inline-block; transform: translateX(-50%); left: 50%;' v-if='isMobile'/>
					<div class='markdown-editor' v-else>
						<MarkdownEditor v-model:value='update.description' :hideGuide='true' :hidePreview='true' style='grid-area: editor'/>
						<Markdown :content='update.description || "**Your description is empty.**"'/>
					</div>
				</div>
			</div>
			<div class='field'>
				<span>Tags</span>
				<div ref='tagDiv' class='tag-field interactable text' contenteditable='true' @input='tagTracker'></div>
				<div class='frequently-used' v-if='tagSuggestions'>
					<span style='margin-top: var(--margin)'><button @click='showSuggestions = !showSuggestions'>Frequently Used Tags <i class='material-icons'>{{showSuggestions ? 'expand_less' : 'expand_more'}}</i></button></span>
					<div class='frequently-used-border'/>
					<div v-show='showSuggestions'>
						<ol :class='group' v-for='(tags, group) in sortTagGroups(tagSuggestions)'>
							<p class='group-title'>{{group}}</p>
							<li v-for='tag in tags'>
								<button class='interactable' @click='addTag(tag)' :id='tag.tag'>
									{{tag.tag.replace(new RegExp(`_\\(${group}\\)$`), '').replace(/_/g, ' ')}}
								</button>
							</li>
						</ol>
					</div>
				</div>
			</div>
			<div class='field' v-if='newSet'>
				<span>New Set</span>
				<div class='nested'>
					<div class='field'>
						<span>Title</span>
						<input class='interactable text' v-model='newSet.title'>
					</div>
					<div class='field'>
						<span>Description</span>
						<input class='interactable text' v-model='newSet.description'>
					</div>
					<div class='actions'>
						<Button @click='() => newSet = null' :isLoading='saving' red><i class='material-icons'>close</i><span>Cancel</span></Button>
						<Button @click='createSet' :isLoading='saving'><i class='material-icons'>add</i><span>Create Set</span></Button>
					</div>
				</div>
			</div>
			<div class='field' v-else>
				<span>Sets</span>
				<div class='set-selector flex' v-for='set in sets'>
					<SetComponent :setId='set.set_id' v-bind='set'/>
					<Button @click='() => removeSet(set.set_id)' :isLoading='saving'><i class='material-icons'>playlist_remove</i><span>Remove Set</span></Button>
				</div>
				<div class='set-selector'>
					<DropDownSelector v-model:value='addSet' placeholder='set id'>
						<SetComponent @click.capture.stop.prevent='addSet = set.set_id' v-for='set in userSets' :setId='set.set_id' v-bind='set' nested/>
					</DropDownSelector>
					<Button @click='putSet' :isLoading='saving'><i class='material-icons'>playlist_add</i><span>Add Set</span></Button>
				</div>
				<div class='actions'>
					<Button @click='() => newSet = { }' :isLoading='saving'><i class='material-icons'>add</i><span>New Set</span></Button>
				</div>
			</div>
			<div class='field popup-info'>
				<div>
					<span>Privacy</span>
					<RadioButtons
						class='radio-buttons'
						name='privacy'
						v-model:value='update.privacy'
						:data='[
							{ value: "public" },
							{ value: "unlisted" },
							{ value: "private" },
						]'
					/>
				</div>
				<div class='selection-info'>
					<p v-if='update.privacy === "public"'>Anyone can view, and appears in searches</p>
					<p v-else-if='update.privacy === "unlisted"'>Hidden from searches, but anyone with a link can view</p>
					<!-- <p v-else-if='update.privacy === "private"'>Only people you explicitly invite can view</p> -->
					<p v-else-if='update.privacy === "private"'>Only you can view</p>
				</div>
			</div>
			<div class='field popup-info'>
				<div>
					<span>Rating</span>
					<RadioButtons
						class='radio-buttons'
						name='rating'
						v-model:value='update.rating'
						:data='[
							{ value: "general" },
							{ value: "mature" },
							{ value: "explicit" },
						]'
					/>
				</div>
				<div class='selection-info'>
					<p v-if='update.rating === "general"'>Appropriate for all audiences</p>
					<p v-if='update.rating === "mature"'>Tasteful nudity, nudity where genitals are not the primary focus</p>
					<p v-if='update.rating === "explicit"'>Sex, porn, or nudity where genitals are the primary focus</p>
				</div>
			</div>
			<div class='field' v-show='false'>
				<span>Flags</span>
				<div class='checkboxes'>
					<!-- <CheckBox
						id='is-post-auction'
						name='is-post-auction'
						v-model:checked='update.auction'
					>Auction</CheckBox>
					<CheckBox
						id='is-post-emoji'
						name='is-post-emoji'
						v-model:checked='update.emoji'
					>Emoji</CheckBox>
					<CheckBox
						id='is-post-user-icon'
						name='is-post-user-icon'
						v-model:checked='update.userIcon'
					>User Icon</CheckBox> -->
				</div>
				<ul class='selection-info'>
					<li v-if='update?.webResize'>Resize your post 1500px on its longest side</li>
					<li v-if='update?.auction'>Include bidding functions on your post</li>
					<li v-if='update?.emoji'>Create an emoji from your post, to be used across the site</li>
					<li v-if='update?.userIcon'>Make this post your current icon</li>
				</ul>
			</div>
			<div class='field' v-if='update.flags?.auction'>
				<p class='underline'>Auction Info</p>
				<div class='multi-field'>
					<div>
						<span>Duration</span>
						<input class='interactable text' placeholder='hours' v-model='update.title'>
					</div>
					<div>
						<span>Minimum Bid Increment</span>
						<input class='interactable text' placeholder='Leave Empty for $1' v-model='update.title'>
					</div>
					<div>
						<span>Starting Bid</span>
						<input class='interactable text' placeholder='Leave empty for $0' v-model='update.title'>
					</div>
					<div>
						<span>Auto Buy</span>
						<input class='interactable text' placeholder='Leave empty to omit' v-model='update.title'>
					</div>
				</div>
				<div class='field'>
					<span>Snipe Protection</span>
					<div>
					If a bid is made within <input class='interactable text' placeholder='Leave empty for 60' v-model='update.title'> minutes of the auction ending,
					extend the auction by <input class='interactable text' placeholder='Leave empty for 60' v-model='update.title'> minutes.
					</div>
				</div>
				<b style='text-align: center; display: block'>Note: fuzz.ly will not charge your clients for you. You must invoice your clients yourself or use a third party payment processor.</b>
			</div>
			<div class='field popup-info' v-if='update.flags?.emoji'>
				<div>
					<span>Emoji Name</span>
					<div>
						<input class='interactable text' :placeholder='emojiPlaceholder' v-model='update.emoji_name'>
					</div>
				</div>
				<div class='selection-info'>
					Your handle will be appended to the end of the emoji name for uniqueness.
					Don't worry, it can still be used across the site, without any restrictions
				</div>
			</div>
			<div class='actions'>
				<Button @click='showData' v-if='environment !== `prod`'><i class='material-icons'>science</i><span>test</span></Button>
				<Button @click='markDraft' :isLoading='saving' v-show='privacy === "unpublished"'><i class='material-icons'>note_add</i><span>Mark Draft</span></Button>
				<Button @click='savePost' :isLoading='saving'><i class='material-icons'>save</i><span>Save</span></Button>
				<Button @click='publishPost' :isLoading='saving' green><i class='material-icons'>publish</i><span>Publish</span></Button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>
<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/globals';
import { abbreviateBytes, commafy, createToast, khatch, tagSplit, getMediaUrl, sortTagGroups } from '@/utilities';
import { cdnHost, host, environment, isMobile } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Spinner from '@/components/Spinner.vue';
import Button from '@/components/Button.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import FileField from '@/components/FileField.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import CheckBox from '@/components/CheckBox.vue';
import Post from '@/components/Post.vue';
import SetComponent from '@/components/Set.vue';
import DropDownSelector from '@/components/DropDownSelector.vue';

const globals = store();
const route = useRoute();
const router = useRouter();
const PublishedPrivacies: Set<string | null> = new Set(["public", "unlisted", "private"]);
const path = "/create";
const postIdRegex = /^[a-zA-Z0-9_-]{8}$/;

const tagDiv = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const draftsPanel = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;

// serverTags: null;
const savedTags: Ref<Set<string>> = ref(new Set());
const activeTags: Ref<Set<string>> = ref(new Set());
const tagSuggestions: Ref<{ [k: string]: string[] } | null> = ref(null);
const showSuggestions: Ref<boolean> = ref(true);
const showUpload: Ref<boolean> = ref(false);
const showResize: Ref<boolean> = ref(false);
const resized: Ref<{ height: number, width: number, scale: number } | null> = ref(null);
const isUploading: Ref<boolean> = ref(false);
const saving: Ref<boolean> = ref(false);

const uploadLoaded: Ref<number> = ref(0);
let uploadTotal: number = 0;  // only loaded needs to be a ref since they're updated together
// uploadUnavailable: false;
const uploadDone: Ref<boolean> = ref(false);
const mime: Ref<string | undefined> = ref();
const file: Ref<File | undefined> = ref();
const width: Ref<number> = ref(0);
const height: Ref<number> = ref(0);
const update: Ref<any> = ref({ });
const mediaUrl: Ref<string | undefined> = ref();

let filename: string | null = null;

// request fields
const postId: Ref<string | undefined> = ref("");  // this must start as not-undefined as route.query?.post?.toString() returns undefined with no query
const description: Ref<string | null> = ref(null);
const title: Ref<string | null> = ref(null);
const privacy: Ref<string | null> = ref(null);
const rating: Ref<"general" | "mature" | "explicit"> = ref("explicit");
const parent: Ref<string | null> = ref(null);

// drafts
const drafts: Ref<Post[] | null> = ref(null);
const showDrafts: Ref<boolean> = ref(false);

// sets
const sets: Ref<PostSet[] | null> = ref(null);
const newSet: Ref<{ title?: string, description?: string } | null> = ref(null);
const userSets: Ref<PostSet[] | null> = ref(null);
const addSet: Ref<string> = ref("");

// parent post
const parentPost: Ref<Post | null> = ref(null);
const validParent: Ref<boolean | null> = ref(null);

// active tag tracking
let tagTrackerTimeout: number | null = null;

interface RouterEvent {
	query: {
		post?: string,
	},
}

onMounted(() => {
	postWatcher(route.query?.post?.toString());
	document.addEventListener("router-event", queryListener);
	khatch(`${host}/v1/sets/user`, {
		errorMessage: "Could not retrieve user sets!",
	}).then(r => r.json())
	.then(r => {
		userSets.value = r;
	});
});

onUnmounted(() =>
	document.removeEventListener("router-event", queryListener)
);

const emojiPlaceholder = computed(() => ":" +
	(update.value.title || title.value || postId.value)
		.toLowerCase()
		.split(/\s+/)
		.filter((x: string) => x)
		.join("-")
		.replaceAll(/[^a-z-]/gi, "") +
	"-" +
	globals.user?.handle +
	":"
);

function createSet() {
	if (!newSet.value) return;

	khatch(`${host}/v1/set/`, {
		method: "PUT",
		errorMessage: "Failed to create new set!",
		body: {
			title:       newSet.value.title,
			description: newSet.value.description,
			privacy:     "public",
		},
	}).then(r => r.json())
	.then(r => 
		userSets.value?.push(r)
	).then(() =>
		newSet.value = null
	);
}

function putSet() {
	if (!addSet.value.match(/^[A-Za-z0-9_-]{7}$/)) {
		createToast({
			title: "set id values must be in the format of /^[a-zA-Z0-9_-]{7}$/",
		});
		return;
	}

	if (sets.value && sets.value.find((x: PostSet) => x.set_id === addSet.value)) {
		createToast({
			title: "Post already exists within set!",
		});
		return;
	}

	khatch(`${host}/v1/set/post/${addSet.value}`, {
		method: "PUT",
		errorMessage: "Failed to add post to set!",
		body: {
			post_id: postId.value,
			index:   -1,
		},
	}).then(() =>
		khatch(`${host}/v1/set/${addSet.value}`, {
			errorMessage: "Failed to fetch set!",
		})
	).then(r => r.json())
	.then(r => {
		if (!sets.value) {
			sets.value = [];
		}
		sets.value.push(r);
	});
}

function removeSet(value: string) {
	if (!value.match(/^[A-Za-z0-9_-]{7}$/)) {
		createToast({
			title: "set id values must be in the format of /^[a-zA-Z0-9_-]{7}$/",
		});
		return;
	}

	khatch(`${host}/v1/set/post/${value}?post_id=${postId.value}`, {
		method: "DELETE",
		errorMessage: "Failed to add post to set!",
	}).then(() => {
		if (!sets.value) return;
		const i = sets.value.findIndex((x: PostSet) => x.set_id === value);
		if (i >= 0) {
			sets.value.splice(i, 1);
		}
	});
}

function fetchParent(parentId: string) {
	if (postIdRegex.exec(parentId)) {
		validParent.value = true;
		if (globals.postCache?.post_id === parentId) {
			parentPost.value = globals.postCache;
		}
		else {
			khatch(`${host}/v1/post/${parentId}`, {
				errorMessage: "Unable To Retrieve Post Data!",
			}).then(r => r.json())
			.then(r => parentPost.value = r);
		}
	}
	else {
		validParent.value = false;
		parentPost.value = null;
	}
}

function calcResize() {
	if (!update.value.webResize) resized.value = null;

	if (width.value > height.value) {
		const size = Math.min(parseInt(update.value.webResize), width.value);
		resized.value = {
			width: size,
			height: Math.round((height.value / width.value) * size),
			scale: size / width.value * 100,
		};
	}
	else {
		const size = Math.min(parseInt(update.value.webResize), height.value);
		resized.value = {
			height: size,
			width: Math.round((width.value / height.value) * size),
			scale: size / height.value * 100,
		};
	}
}

const closeDrafts = () => toggleDrafts(false);

function toggleDrafts(state: boolean | null = null) {
	showDrafts.value = state ?? !showDrafts.value;
	if (showDrafts.value) {
		window.addEventListener("click", closeDrafts, { once: true });
		draftsPanel.value.classList.add("open");

		if (!drafts.value) fetchDrafts();
	}
	else {
		window.removeEventListener("click", closeDrafts);
		draftsPanel.value.classList.remove("open");
	}
}

function fetchDrafts() {
	drafts.value = null;
	khatch(`${host}/v1/posts/drafts`, {
		handleError: true,
	}).then(r => r.json())
	.then(r => drafts.value = r.toSorted((a: Post, b: Post) => new Date(b.updated).valueOf() - new Date(a.updated).valueOf()));
}

function markDraft() {
	saving.value = true;
	uploadFile()
	.then(() => saveData())
	.then(() => khatch(`${host}/v1/upload/privacy`, {
		handleError: true,
		method: "PATCH",
		body: {
			post_id: postId.value,
			privacy: "draft",
		},
	})).then(() => {
		privacy.value = "draft";
		createToast({
			icon: "done",
			title: "Saved as Draft!",
			color: "green",
			time: 5,
		});
	}).finally(() => saving.value = false);
}

function savePost() {
	saving.value = true;
	uploadFile()
	.then(() => saveData())
	.finally(() => saving.value = false);
}

function publishPost() {
	if (!PublishedPrivacies.has(update.value.privacy)) {
		createToast({
			title: "Privacy Not Set!",
			time: 5,
		});
		return;
	}
	saving.value = true;
	uploadFile()
	.then(() => saveData(true))
	.then(() => khatch(`${host}/v1/upload/privacy`, {
		handleError: true,
		method: "PATCH",
		body: {
			post_id: postId.value,
			privacy: update.value.privacy,
		},
	})).then(() => {
		privacy.value = update.value.privacy;
		router.push(`/p/${postId.value}`);
	}).catch(() => saving.value = false);
}

function addTag(tag: TagPortable) {
	if (activeTags.value.has(tag.tag)) {
		activeTags.value.delete(tag.tag);
		tagDiv.value.innerText = Array.from(activeTags.value).join(" ");
		(document.getElementById(tag.tag) as HTMLElement).style.borderColor = "";
	} else {
		activeTags.value.add(tag.tag);
		tagDiv.value.innerText = Array.from(activeTags.value).join(" ");
		(document.getElementById(tag.tag) as HTMLElement).style.borderColor = "var(--interact)";
	}
}

function showData() {
	console.log({
		// errorDump: this.errorDump,
		file: file.value,
		update: JSON.parse(JSON.stringify(update.value)),
		title: title.value,
		description: description.value,
		privacy: privacy.value,
		rating: rating.value,
		activeTags: activeTags.value,
		savedTags: savedTags.value,
		tagSuggestions: tagSuggestions.value,
		meta: {
			filename: filename,
			showUpload: showUpload.value,
			isUploading: isUploading.value,
			uploadLoaded: uploadLoaded.value,
			uploadTotal: uploadTotal,
			// uploadUnavailable: this.uploadUnavailable,
			uploadDone: uploadDone.value,
		},
	});
}

function uploadFile(finish=false) {
	saving.value = true;
	return new Promise<void>((resolve, reject) => {
		if (isUploading.value || !file.value /* || this.uploadUnavailable */) return resolve();

		if (!postId.value) return reject("postId has no value");

		isUploading.value = true;

		let formdata = new FormData();
		formdata.append("file", file.value);
		formdata.append("post_id", postId.value);

		if (update.value.webResize) formdata.append("web_resize", parseInt(update.value.webResize.trim()).toString());

		const complete = () => {
			showResize.value = false;
			uploadDone.value = true;
			isUploading.value = false;
			uploadLoaded.value = 0;
			uploadTotal = 0;
			if (finish)
			{ saving.value = false; }
		};

		const errorHandler = (event: XMLHttpRequestEventMap["load"]) => {
			createToast({
				title: "Something broke during upload",
				description: "If you submit a bug report, please include the data below.",
				dump: ajax?.responseType === "text" ? ajax.responseText : event,
			});
			console.error("error:", event);
			complete();
		};

		const ajax = new XMLHttpRequest();

		ajax.upload.addEventListener("progress", event => {
			uploadLoaded.value = event.loaded;
			uploadTotal = event.total;
		}, false);
		ajax.addEventListener("load", (event) => {
			if (ajax.response.status >= 400) return complete(), reject(errorHandler(event));

			const response = JSON.parse(ajax.responseText);
			mediaUrl.value = `${cdnHost}/${encodeURIComponent(response.url)}`;

			if (!file.value) return complete(), reject("file was unset during upload, please refresh the page");

			mime.value = file.value.type;
			file.value = undefined;
			complete();
			resolve();
		}, false);
		ajax.addEventListener("error", e => reject(errorHandler(e)), false);

		const auth = globals.auth?.token;
		ajax.open("POST", `${host}/v1/upload/image`);
		ajax.setRequestHeader("authorization", "bearer " + auth);

		ajax.send(formdata);
	});
}

function saveData(publish=false) {
	return new Promise<void>((resolve, reject) => {
		let sendUpdate = false;
		let requiredSuccesses = 0;
		let successes = 0;

		if (title.value !== update.value.title) {
			sendUpdate = true;
			title.value = update.value.title = update.value.title.trim();
		}

		if (description.value !== update.value.description) {
			sendUpdate = true;
			description.value = update.value.description;
		}

		if (rating.value !== update.value.rating) {
			sendUpdate = true;
			rating.value = update.value.rating;
		}

		if (parent.value !== update.value.parent) {
			sendUpdate = true;
			parent.value = update.value.parent;
		}

		const success = () => {
			successes++;
			if (successes >= requiredSuccesses) {
				createToast({
					icon: "done",
					title: "Post Updated!",
					color: "green",
					time: 5,
				});
				resolve();
			}
		};

		if (sendUpdate) {
			requiredSuccesses++;
			khatch(`${host}/v1/upload/post`, {
				method: "PATCH",
				errorMessage: "failed to update post!",
				body: {
					post_id: postId.value,
					title: title.value,
					description: description.value,
					rating: rating.value,
					parent: parent.value,
				},
			}).then(success)
			.catch(reject);
		}

		const aTags = new Set(activeTags.value);

		let rTags: string[] = [];
		savedTags.value.forEach(tag => {
			if (!aTags.has(tag))
			{ rTags.push(tag); }
		});

		if (rTags.length > 0) {
			requiredSuccesses++;
			khatch(`${host}/v1/tags/remove`, {
				errorMessage: "failed to remove tags!",
				method: "POST",
				body: {
					post_id: postId.value,
					tags: rTags,
				},
			}).then(success)
			.catch(reject);
		}

		let newTags: string[] = [];
		aTags.forEach(tag => {
			if (!savedTags.value.has(tag))
			{ newTags.push(tag); }
		});

		if (newTags.length > 0) {
			requiredSuccesses++;
			khatch(`${host}/v1/tags/add`, {
				errorMessage: "failed to add tags!",
				method: "POST",
				body: {
					post_id: postId.value,
					tags: newTags,
				},
			}).then(success)
			.catch(reject);
		}

		if (requiredSuccesses === 0) {
			if (!publish && privacy.value !== update.value.privacy) {
				createToast({
					title: "Post Not Updated!",
					description: "privacy was not updated, click Publish to update privacy.",
					time: 5,
				});
			}
			resolve();
		}

		console.debug(JSON.parse(JSON.stringify({
			aTags,
			newTags,
			rTags,
			savedTags: savedTags.value,
		})));

		savedTags.value = aTags;
	});
}

function queryListener(event: Event): void {
	const query = (event as CustomEvent<RouterEvent | null>).detail?.query;
	if (postId.value === query?.post) return;

	let p = route.path;
	if (query) {
		p += "?" + Object.entries(query).map(e => e[0] + "=" + encodeURIComponent(e[1])).join("&");
	}
	history.replaceState(null, "", p);
	return postWatcher(query?.post);
}

function postWatcher(value?: string) {
	if (route.path !== path || postId.value === value) return;
	console.debug("postWatcher:", value);

	postId.value = value;
	const unset = () => {
		uploadDone.value = false;
		filename = null;
		mediaUrl.value = undefined;
		isUploading.value = false;
		uploadLoaded.value = 0;
		uploadTotal = 0;
	};

	if (postId.value?.length === 8) {
		if (globals.postCache?.post_id === postId.value) {
			const r = globals.postCache;
			description.value = update.value.description = r.description;
			title.value = update.value.title = r.title;
			privacy.value = update.value.privacy = r.privacy;
			rating.value = update.value.rating = r.rating;
			parent.value = update.value.parent = r.parent;
			mime.value = r.media_type?.mime_type;

			if (r.filename) {
				uploadDone.value = true;
				filename = r.filename;
				mediaUrl.value = getMediaUrl(postId.value, filename);
				width.value = r?.size?.width ?? 0;
				height.value = r?.size?.height ?? 0;
			}
			else {
				unset();
			}
			globals.postCache = null;
		}
		else {
			khatch(`${host}/v1/post/${postId.value}`, {
				errorMessage: "Unable To Retrieve Post Data!",
			}).then(r => r.json())
			.then(r => {
				description.value = update.value.description = r.description ?? "";
				title.value = update.value.title = r.title ?? "";
				privacy.value = update.value.privacy = r.privacy;
				rating.value = update.value.rating = r.rating;
				parent.value = update.value.parent = r.parent ?? "";
				mime.value = r.media_type?.mime_type;
				if (r.filename) {
					uploadDone.value = true;	
					filename = r.filename;
					mediaUrl.value = getMediaUrl(r.post_id, r.filename);
					width.value = r?.size?.width;
					height.value = r?.size?.height;
				}
				else {
					unset();
				}
				// if (privacy.value !== "unpublished" && (Date.now() - new Date(r.created).getTime()) / 3600000 > 1)
				// { this.uploadUnavailable = true; }
			});
		}

		khatch(`${host}/v1/tags/${postId.value}`, {
			errorMessage: "Unable To Retrieve Post Tags!",
		}).then(r => r.json())
		.then(r => {
			savedTags.value = new Set(Object.values(r).flat().map(x => (x as { tag: string }).tag)) as Set<string>;
			colorizeTags(savedTags.value);
			tagDiv.value.innerText = Array.from(savedTags.value).join(" ");
		});

		khatch(`${host}/v1/tags/frequently_used`, {
			errorMessage: "Unable To Retrieve Your Recommended Tags!",
			errorHandlers: { 404: () => { } },
		}).then(r => r.json())
		.then((r: { [k: string]: string[] }) => {
			tagSuggestions.value = { };
			for (let [group, tags] of Object.entries(r)) {
				if (Object.values(tags).length !== 0) {
					tagSuggestions.value[group] = tags;
				}
			}
			setTimeout(colorizeTags);
		});

		khatch(`${host}/v1/sets/post/${postId.value}`, {
			errorMessage: "Could not retrieve post sets!",
		}).then(r => r.json())
		.then(r => {
			sets.value = r;
		});
	}
	else {
		unset();
		khatch(`${host}/v1/upload/post`, {
			method: "PUT",
			errorMessage: "Unable To Create New Post Draft!",
			body: { },
		}).then(r => r.json())
		.then(r => document.dispatchEvent(new CustomEvent<RouterEvent>("router-event", { detail: { query: { post: r.post_id } } })));
	}
}

function tagTracker() {
	if (tagTrackerTimeout) clearTimeout(tagTrackerTimeout);

	tagTrackerTimeout = setTimeout(() => {
		colorizeTags();
		tagTrackerTimeout = null;
	}, 300);
}

function colorizeTags(tags: Set<string> | null = null) {
	tags = tags || new Set(tagSplit(tagDiv.value.innerText));
	tags.forEach(e => {
		const b = document.getElementById(e);
		if (b && !b.style.borderColor) {
			// for every new tag, set border color
			b.style.borderColor = "var(--interact)";
		}
	});
	activeTags.value.forEach(e => {
		if (!tags.has(e)) {
			// for every old tag, unset border color
			const b = document.getElementById(e);
			if (b) {
				b.style.borderColor = "";
			}
		}
	});
	activeTags.value = new Set(tags);
}

// watch: {
// 	activeTags(value) {
// 		const tags = new Set(tagSplit(tagDiv.value.innerText));
// 	},
// },

watch(() => route.query?.post?.toString(), postWatcher);
watch(() => update.value?.webResize, calcResize);
watch(() => update.value.parent, fetchParent);
watch(width, calcResize);
watch(height, calcResize);
</script>
<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
.form {
	margin: 0 auto;
	width: 60vw;
	position: relative;
}
.form .field {
	margin: var(--margin) 0;
}
.form .flex {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.form .multi-field {
	display: flex;
	align-items: center;
	flex-flow: wrap;
	margin: 0 var(--margin);
}
.form .multi-field div {
	margin-right: var(--margin);
}
.form .multi-field div, .form .multi-field span {
	display: block;
}
.form .multi-field :last-child, .form .multi-field span {
	margin: 0;
	left: 0;
}
.loading .field, .loading .field * {
	pointer-events: none;
}
.underline {
	border-bottom: var(--border-size) solid var(--bordercolor);
	margin-bottom: 5px;
}
.form .field.popup-info {
	display: flex;
	align-items: center;
}
.selection-info {
	text-align: right;
	width: 100%;
}
.selection-info p {
	padding: 0;
	margin: 0;
}
.selection-info li {
	margin: 0 0 10px;
}
.selection-info > :last-child {
	margin: 0;
}
.actions {
	display: flex;
	justify-content: flex-end;
}
.actions button, .actions .checkbox {
	margin-right: var(--margin);
}
.actions > :last-child {
	margin: 0;
}
.form > :last-child {
	margin-bottom: 0;
}
.form > :first-child {
	margin-top: 0;
}
.form div > span {
	position: relative;
	left: var(--margin);
	padding: 0 0 2px;
	display: inline-block;
}
.tag-field {
	display: block;
	height: 10em;
	resize: vertical;
	overflow: scroll;
}
.tag-field input {
	padding: 0.5em;
	background: none;
	margin: 0;
	border: none;
}
.tag-field ol {
	padding: 0.25em 1em 0.5em;
	margin: 0;
	position: absolute;
}
.tag-field li {
	margin: 0 0 0.5em;
}
.tag-field ol > :last-child {
	margin: 0;
}
.resize-field {
	display: grid;
	grid-template-columns: [input-start] 1fr [input-end] var(--margin) [data-start] 1fr [data-end];
}
.resize-field > :first-child {
	grid-area: input;
}
.resize-field > :last-child {
	grid-area: data;
	text-align: right;
}
.resize-field > :last-child span {
	left: initial;
	right: var(--margin);
}
.resize-field > :last-child div {
	border-top: 1px solid var(--bordercolor);
}

.drafts-button {
	z-index: 2;
	top: var(--margin);
	left: 0;
	position: absolute;
	display: flex;
	align-items: center;
	padding-right: 0.25em;
}
.drafts-button i {
	width: var(--margin);
}
.drafts-button span {
	margin-left: 0.25em;
}
.mobile .drafts-button i {
	width: auto;
}

.set-selector {
	display: flex;
	margin-bottom: var(--margin);
}
.set-selector button {
	margin-left: var(--margin);
}
.set-selector.flex {
	align-items: self-end;
}
.set-selector.flex .set {
	width: 100%;
}
.set-selector .set {
	margin-top: var(--margin);
}
.set-selector .set:first-child {
	margin-top: 0;
}

.nested {
	border: var(--border-size) solid var(--bordercolor);
	padding: var(--margin);
	background: var(--bg2color);
	border-radius: var(--border-radius);
}
.nested .interactable {
	background: var(--bg3color);
}
.nested :first-child {
	margin-top: 0;
}
.menu-border {
	border-bottom: var(--border-size) solid var(--bordercolor);
	padding: 3.0625em var(--margin) 0;
	padding: calc(1.5em + var(--margin)) var(--margin) 0;
	margin: 0 20px;
}

.drafts-panel {
	z-index: 1;
	position: absolute;
	background: var(--bg2color);
	top: 0;
	height: 100%;
	width: 30%;
	min-width: 18em;
	left: -50%;
	left: calc(min(-30%, -18em) - 6px);
	border-right: var(--border-size) solid var(--bordercolor);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.mobile .drafts-panel {
	width: 100%;
	left: -100%;
	left: calc(min(-100%, -18em) - 6px);
}
.drafts-panel.open {
	left: 0;
}

.drafts-panel ol {
	list-style-type: none;
	margin: 0;
	padding: 0.5em var(--margin) 0;
	overflow: auto;
	max-height: calc(100% - var(--margin) - 2em);
}
.drafts-panel ol li {
	margin: 0 0 var(--margin);
}

.refresh-drafts {
	position: absolute;
	top: calc(var(--margin) - 0.25em);
	right: var(--half-margin);
	color: var(--subtle);
	border-radius: var(--border-radius);
	display: flex;
	padding: 0.25em;
}
.refresh-drafts:hover {
	color: var(--interact);
	background: var(--bg1color);
}

h4 {
	margin: 0;
}

li {
	list-style: none;
}

input {
	display: block;
	width: 100%;
}

.media {
	display: flex;
	justify-content: center;
}

.markdown-editor {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] var(--margin) [preview-start] 1fr [preview-end];
}
.markdown-editor textarea {
	grid-area: editor;
	resize: vertical;
	min-height: 5em;
	height: 100%;
}
.markdown-editor .markdown {
	grid-area: preview;
}

.form .field .title-render {
	left: 0;
	margin: 15px 0 0;
}

.checkboxes {
	display: flex;
}

.checkboxes > div {
	margin-right: var(--margin);
}

.radio-buttons {
	flex-flow: nowrap;
}

.checkboxes > :last-child {
	margin-right: 0;
}

.frequently-used ol {
	padding: 0;
	margin: 2.5em 0 -10px;
	list-style: none;
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	align-content: flex-start;
	position: relative;
}

.frequently-used li {
	list-style: none;
	margin: 0 var(--half-margin) 10px;
}

.frequently-used > div {
	display: flex;
	width: calc(100vw - 50px);
	left: calc(50% - 50vw + var(--margin));
	position: relative;
	justify-content: center;
}
.mobile .frequently-used > div {
	flex-direction: column;
}

.frequently-used button {
	display: inline-flex;
	align-items: center;
	white-space: nowrap;
}

.frequently-used .group-title {
	text-transform: capitalize;
	position: absolute;
	top: -1.8em;
	padding: 0;
	margin: 0;
}
.mobile .frequently-used .group-title {
	left: var(--margin);
}

.frequently-used-border {
	border-bottom: solid var(--bordercolor) var(--border-size);
}

/* THEME OVERRIDES */
html.e621 main {
	overflow: hidden;
}

@media only screen and (max-width: 1200px) {
	.form {
		width: auto;
	}
	.frequently-used > div {
		flex-direction: column;
	}
	.frequently-used .group-title {
		left: var(--margin);
	}
}
</style>
