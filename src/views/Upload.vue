<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button @click='toggleDrafts' class='drafts-button'><i class='material-icons'>{{showDrafts ? 'chevron_left' : 'chevron_right'}}</i>Drafts</button>
		<div ref='draftsPanel' class='drafts-panel'>
			<div class='menu-border'/>
			<ol class='results'>
				<p v-show='drafts?.length === 0' style='text-align: center'>No drafts found</p>
				<li v-for='post in drafts || 3'>
					<Post :postId='post?.post_id' :to='`/create?post=${post.post_id}`' v-bind='post' hideButtons/>
				</li>
			</ol>
		</div>
		<Title static='center'>New Post</Title>
		<Subtitle static='center'>Your post {{privacy === 'unpublished' ? 'will be' : 'is'}} live at <Loading :isLoading='!postId' span><router-link :to='`/p/${postId}`'>{{environment === 'prod' ? `fuzz.ly/p/${postId}` : `dev.fuzz.ly/p/${postId}`}}</router-link></Loading></Subtitle>
		<div class='form'>
			<Loading :lazy='false' :isLoading='isUploading' v-if='!uploadUnavailable'>
				<div class='field'>
					<div>
						<span>File</span>
						<FileField v-model:file='file' :showSlot='uploadDone && file === null'>
							<Media :mime='mime' :src='mediaUrl' :link='false' loadingStyle='width: 100%; height: 30vh'/>
						</FileField>
						<div class='field' v-if='file !== null'>
							<div class='actions' v-if='file !== null'>
								<CheckBox
									class='checkbox'
									id='resize-for-web'
									name='resize-for-web'
									v-model:checked='update.webResize'
								>Resize For Web</CheckBox>
								<Button @click='uploadFile' green><i class='material-icons'>upload</i>Upload</Button>
							</div>
							<ul style='padding: 0; text-align: right'>
								<li v-if='update?.webResize'>Resize your post to 1500px on its longest side</li>
							</ul>
						</div>
					</div>
				</div>
				<template v-slot:onLoad>
					<ProgressBar :fill='uploadProgress'/>
				</template>
			</Loading>
			<Media :mime='mime' :src='mediaUrl' loadingStyle='width: 100%; height: 30vh; margin-top: 25px' style='width: 100%; margin-top: 25px' v-else/>
			<div class='field'>
				<div>
					<span>Title</span>
					<input class='interactable text' style='display: block; width: 100%' v-model='update.title'>
					<Markdown class='title-render' :content='update.title' inline/>
				</div>
			</div>
			<div class='field'>
				<div>
					<span>Description</span>
					<router-link style='position: absolute; right: 25px; font-size: 0.9em' to='/md'>markdown guide</router-link>
					<MarkdownEditor v-model:value='update.description' style='min-width: 100%; display: inline-block; transform: translateX(-50%); left: 50%;' v-if='isMobile'/>
					<div class='markdown-editor' v-else>
						<textarea v-model='update.description' class='interactable text'/>
						<Markdown :content='update.description || "**Your description is empty.**"'/>
					</div>
				</div>
			</div>
			<div class='field'>
				<div>
					<span>Tags</span>
					<div ref='tagDiv' class='tag-field interactable text' contenteditable='true'>
						{{tagsField}}
					</div>
					<div class='frequently-used' v-if='tagSuggestions'>
						<span style='margin-top: 25px'><button @click='showSuggestions = !showSuggestions'>Frequently Used Tags <i class='material-icons'>{{showSuggestions ? 'expand_less' : 'expand_more'}}</i></button></span>
						<div class='frequently-used-border'/>
						<div v-show='showSuggestions'>
							<ol :class='group' v-for='(tags, group) in sortTagGroups(tagSuggestions)'>
								<p class='group-title'>{{group}}</p>
								<li v-for='tag in tags'>
									<button class='interactable' @click='addTag(tag)'>
										{{tag.replace(new RegExp(`_\\(${group}\\)$`), '').replace(/_/g, ' ')}}
									</button>
								</li>
							</ol>
						</div>
					</div>
				</div>
			</div>
			<div class='field popup-info'>
				<div>
					<span>Privacy</span>
					<RadioButtons
						class='radio-buttons'
						name='privacy'
						v-model:value='update.privacy'
						:data="[
							{ content: 'public' },
							{ content: 'unlisted' },
							{ content: 'private' },
						]"
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
						:data="[
							{ content: 'general' },
							{ content: 'mature' },
							{ content: 'explicit' },
						]"
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
				<Button @click='showData' v-if='environment !== `prod`'><i class='material-icons'>science</i>test</Button>
				<Button @click='markDraft' v-show='privacy === "unpublished"'><i class='material-icons'>note_add</i>Mark Draft</Button>
				<Button @click='savePost'><i class='material-icons'>save</i>Save</Button>
				<Button @click='publishPost' green><i class='material-icons'>publish</i>Publish</Button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { ref } from 'vue';
import { createToast, khatch, tagSplit, getCookie, getMediaUrl, isMobile, sortTagGroups } from '@/utilities';
import { cdnHost, uploadHost, tagGroups, postsHost, tagsHost, environment } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Button from '@/components/Button.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import FileField from '@/components/FileField.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import CopyText from '@/components/CopyText.vue';
import CheckBox from '@/components/CheckBox.vue';
import Post from '@/components/Post.vue';

export default {
	name: 'Upload',
	components: {
		ThemeMenu,
		Loading,
		Subtitle,
		Title,
		Media,
		ProgressBar,
		FileField,
		RadioButtons,
		Markdown,
		Button,
		CopyText,
		MarkdownEditor,
		CheckBox,
		Post,
	},
	setup() {
		const tagRecommendations = ref(null);
		const tagDiv = ref(null);
		const draftsPanel = ref(null);

		return {
			tagRecommendations,
			tagDiv,
			draftsPanel,
		};
	},
	data() {
		return {
			isMobile,
			environment,
			tagGroups,
			serverTags: null,
			savedTags: [],
			tagSuggestions: null,
			showSuggestions: true,

			showUpload: false,
			isUploading: false,
			uploadProgress: 0,
			uploadUnavailable: false,
			uploadDone: false,
			mime: null,
			filename: null,
			file: null,
			update: { },
			mediaUrl: null,

			// request fields
			postId: null,
			description: null,
			title: null,
			tagsField: null,
			privacy: null,
			rating: null,

			// drafts
			drafts: null,
			showDrafts: false,
		};
	},
	mounted() {
		this.postWatcher(this.$route.query?.post);

		this.$watch(
			() => this.$route.query?.post,
			this.postWatcher,
		);
	},
	computed: {
		emojiPlaceholder() {

			return ':' +
				(this.update.title || this.title || this.postId)
					.toLowerCase()
					.split(/\s+/)
					.filter(x => x)
					.join('-')
					.replaceAll(/[^a-z-]/gi, '') +
				'-' +
				this.$store.state.user.handle +
				':';
		},
	},
	methods: {
		sortTagGroups,
		toggleDrafts() {
			this.showDrafts = !this.showDrafts;
			if (this.showDrafts)
			{ this.$refs.draftsPanel.classList.add('open'); }
			else
			{ this.$refs.draftsPanel.classList.remove('open'); }

			console.log(this.drafts);

			if (this.drafts === null)
			{
				khatch(`${postsHost}/v1/fetch_drafts`, {
					handleError: true,
				}).then(response => {
					response.json().then(r => {
						this.drafts = r;
					});
				});
			}
		},
		markDraft() {
			this.uploadFile()
			.then(this.savePost)
			.then(() => {
				khatch(`${uploadHost}/v1/update_privacy`, {
					handleError: true,
					method: 'POST',
					body: {
						post_id: this.postId,
						privacy: 'draft',
					},
				}).then(response => {
					this.privacy = 'draft';
					createToast({
						icon: 'done',
						title: 'Saved as Draft!',
						color: 'green',
						time: 5,
					});
				});
			});
		},
		addTag(tag) {
			this.$refs.tagDiv.textContent += ' ' + tag;
		},
		showData() {
			console.log({
				errorDump: this.errorDump,
				file: this.file,
				update: JSON.parse(JSON.stringify(this.update)),
				title: this.title,
				description: this.description,
				privacy: this.privacy,
				rating: this.rating,
				activeTags: tagSplit(this.$refs.tagDiv.textContent),
				savedTags: this.savedTags,
				tagSuggestions: this.tagSuggestions,
				meta: {
					filename: this.filename,
					showUpload: this.showUpload,
					isUploading: this.isUploading,
					uploadProgress: this.uploadProgress,
					uploadUnavailable: this.uploadUnavailable,
					uploadDone: this.uploadDone,
				},
			});
		},
		uploadFile() {
			return new Promise((resolve, reject) => {
				if (this.isUploading || this.uploadUnavailable || !this.file)
				{ return resolve(); }

				this.isUploading = true;

				let formdata = new FormData();
				formdata.append('file', this.file);
				formdata.append('post_id', this.postId);

				if (this.update.webResize)
				{ formdata.append('web_resize', this.update.webResize); }

				const errorHandler = (event) => {
					this.$store.commit('createToast', {
						title: 'Something broke during upload',
						description: 'If you submit a bug report, please include the data below.',
						dump: event?.target?.responseText ?? event,
					});
					console.error('error:', event);
				};

				const ajax = new XMLHttpRequest();

				ajax.upload.addEventListener('progress', event => this.uploadProgress = (event.loaded / event.total) * 100, false);
				ajax.addEventListener('load', (event) => {
					if (event.target.status >= 400)
					{ return reject(errorHandler(event)); }
					const response = JSON.parse(event.target.responseText);
					this.mediaUrl = `${cdnHost}/${encodeURIComponent(response.url)}`;
					this.mime = this.file.type;
					this.uploadDone = true;
					this.isUploading = false;
					this.file = null;
					this.uploadProgress = 0;
					resolve();
				}, false);
				ajax.addEventListener('error', e => reject(errorHandler(e)), false);

				const auth = getCookie('kh-auth');
				ajax.open('POST', `${uploadHost}/v1/upload_image`);
				ajax.setRequestHeader('authorization', auth);

				ajax.send(formdata);
			});
		},
		savePost() {
			return new Promise((resolve, reject) => {
				this.showData();

				let sendUpdate = false;
				let requiredSuccesses = 0;
				let successes = 0;

				if (this.title !== this.update.title)
				{
					sendUpdate = true;
					this.title = this.update.title;
				}

				if (this.description !== this.update.description)
				{
					sendUpdate = true;
					this.description = this.update.description;
				}

				if (this.rating !== this.update.rating)
				{
					sendUpdate = true;
					this.rating = this.update.rating;
				}

				if (sendUpdate)
				{
					requiredSuccesses++;
					khatch(`${uploadHost}/v1/update_post`, {
						method: 'POST',
						errorMessage: 'failed to update post!',
						body: {
							post_id: this.postId,
							title: this.title ? this.title.trim() : null,
							description: this.description ?? null,
							rating: this.rating,
						},
					}).then(() => {
						successes++;
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
							resolve();
						}
					});
				}

				let activeTags = tagSplit(this.$refs.tagDiv.textContent);

				let removedTags = [];
				this.savedTags.forEach(tag => {
					if (!activeTags.includes(tag))
					{ removedTags.push(tag); }
				});

				if (removedTags.length > 0)
				{
					requiredSuccesses++;
					khatch(`${tagsHost}/v1/remove_tags`, {
						errorMessage: 'failed to remove tags!',
						method: 'POST',
						body: {
							post_id: this.postId,
							tags: removedTags,
						},
					}).then(() => {
						successes++;
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
							resolve();
						}
					});
				}

				let newTags = [];
				activeTags.forEach(tag => {
					if (!this.savedTags.includes(tag))
					{ newTags.push(tag); }
				});

				if (newTags.length > 0)
				{
					requiredSuccesses++;
					khatch(`${tagsHost}/v1/add_tags`, {
						errorMessage: 'failed to add tags!',
						method: 'POST',
						body: {
							post_id: this.postId,
							tags: newTags,
						},
					}).then(response => {
						response.json().then(r => {
							console.log(r);
							this.tagsField = Object.values(activeTags).flat().join(' ');
						});
						successes++;
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
							resolve();
						}
					});
				}

				if (requiredSuccesses === 0)
				{ resolve(); }

				console.log(JSON.parse(JSON.stringify({
					activeTags,
					newTags,
					removedTags,
					savedTags: this.savedTags,
				})));

				this.savedTags = activeTags;
			});
		},
		publishPost() {
			this.uploadFile()
			.then(this.savePost)
			.then(() => {
				this.privacy = this.update.privacy;

				khatch(`${uploadHost}/v1/update_privacy`, {
					handleError: true,
					method: 'POST',
					body: {
						post_id: this.postId,
						privacy: this.privacy,
					},
				}).then(response => {
					this.$router.push(`/p/${this.postId}`);
				});
			});
		},
		postWatcher(value) {
			this.postId = value;

			if (this.postId)
			{
				if (this.$store.state.postCache?.post_id === this.postId)
				{
					const r = this.$store.state.postCache;
					this.description = this.update.description = r.description;
					this.title = this.update.title = r.title;
					this.privacy = this.update.privacy = r.privacy;
					this.rating = this.update.rating = r.rating;
					this.mime = r.media_type?.mime_type;
					if (r.filename) {
						this.uploadDone = true;	
						this.filename = r.filename;
						this.mediaUrl = getMediaUrl(this.postId, this.filename);
					}
				}
				else
				{
					khatch(`${postsHost}/v1/post/${this.postId}`, {
						errorMessage: 'Unable To Retrieve Post Data!',
					}).then(response => {
						response.json().then(r => {
							this.description = this.update.description = r.description;
							this.title = this.update.title = r.title;
							this.privacy = this.update.privacy = r.privacy;
							this.rating = this.update.rating = r.rating;
							this.mime = r.media_type?.mime_type;
							if (r.filename) {
								this.uploadDone = true;	
								this.filename = r.filename;
								this.mediaUrl = getMediaUrl(this.postId, this.filename);
							}
							// if (this.privacy !== 'unpublished' && (Date.now() - new Date(r.created).getTime()) / 3600000 > 1)
							// { this.uploadUnavailable = true; }
						});
					});
				}

				khatch(`${tagsHost}/v1/fetch_tags/${this.postId}`, {
					errorMessage: 'Unable To Retrieve Post Tags!',
				}).then(response => {
					response.json().then(r => {
						this.savedTags = Object.values(r).flat();
						this.tagsField = this.savedTags.join(' ');
					});
				});

				khatch(`${tagsHost}/v1/frequently_used`, {
					errorMessage: 'Unable To Retrieve Your Recommended Tags!',
					errorHandlers: { 404: () => { } },
				}).then(response => {
					response.json().then(r => {
						this.tagSuggestions = r;
					});
				});
			}
			else
			{
				khatch(`${uploadHost}/v1/create_post`, {
					method: 'POST',
					errorMessage: 'Unable To Create New Post Draft!',
					body: { },
				}).then(response => {
					response.json().then(r => {
						history.replaceState(null, "", this.$route.path + '?post=' + r.post_id);
						this.postWatcher(r.post_id); // why is this needed?
					});
				});
			}
		},
	},
}
</script>

<style scoped>
main {
	background: var(--bg1color);
	position: relative;
	padding: 25px;
}
.form {
	margin: 0 auto;
	width: 60vw;
	position: relative;
}
.form .field {
	margin: 25px 0;
}
.form .multi-field {
	display: flex;
	align-items: center;
	flex-flow: wrap;
	margin: 0 25px;
}
.form .multi-field div {
	margin-right: 25px;
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
	margin-right: 25px;
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
.form span {
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
.tag-field {
	display: block;
	height: 10em;
	resize: vertical;
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

.drafts-button {
	z-index: 2;
	top: 25px;
	left: 0;
	position: absolute;
	display: flex;
	align-items: center;
	padding-right: 0.25em;
}
.drafts-button i {
	width: 25px;
}

.menu-border {
	border-bottom: var(--border-size) solid var(--bordercolor);
	padding: 3.0625em 25px 0;
	padding: calc(1.5em + 25px) 25px 0;
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
.drafts-panel.open {
	left: 0;
}

.drafts-panel ol {
	list-style-type: none;
	margin: 0;
	padding: 0.5em 25px 0;
	overflow: scroll;
	max-height: calc(100% - 25px - 2em);
}
.drafts-panel ol li {
	margin: 0 0 25px;
}

h4 {
	margin: 0;
}

li {
	list-style: none;
}

.media {
	display: flex;
	justify-content: center;
}

.markdown-editor {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] 25px [preview-start] 1fr [preview-end];
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
	margin-right: 25px;
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
	margin: 0 12.5px 10px;
}

.frequently-used > div {
	display: flex;
	width: calc(100vw - 50px);
	left: calc(50% - 50vw + 25px);
	position: relative;
}
.mobile .frequently-used > div {
	flex-direction: column;
}

.frequently-used button {
	display: inline-flex;
	align-items: center;
}

.frequently-used .group-title {
	text-transform: capitalize;
	position: absolute;
	top: -1.8em;
	padding: 0;
	margin: 0;
}
.mobile .frequently-used .group-title {
	left: 25px;
}

.frequently-used-border {
	border-bottom: solid var(--bordercolor) var(--border-size);
}

@media only screen and (max-width: 1000px) {
	.form {
		width: auto;
	}
	.frequently-used > div {
		flex-direction: column;
	}
	.frequently-used .group-title {
		left: 25px;
	}
}
</style>
