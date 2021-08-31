<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<Error v-model:dump='errorDump' v-model:message='errorMessage'>
		<main>
			<Title static='center'>New Post</Title>
			<Subtitle static='center'>Your post {{privacy == 'unpublished' ? 'will be' : 'is'}} live at <Loading :isLoading='!postId' span><router-link :to='`/p/${postId}`'>{{environment === 'prod' ? `kheina.com/p/${postId}` : `dev.kheina.com/p/${postId}`}}</router-link></Loading></Subtitle>
			<div class='form'>
				<Loading :lazy='false' :isLoading='isUploading' v-if='!uploadUnavailable'>
					<div class='field'>
						<div>
							<span>File</span>
							<FileField v-model:file='file' :showSlot='uploadDone && file === null'>
								<Media :mime='mime' :src='mediaUrl' :link='false' loadingStyle='width: 100%; height: 30vh' />
							</FileField>
							<div class='field actions' v-if='file !== null'>
								<Button @click='uploadFile' green><i class='material-icons'>upload</i>Upload</Button>
							</div>
						</div>
					</div>
					<template v-slot:onLoad>
						<ProgressBar :fill='uploadProgress'/>
					</template>
				</Loading>
				<Media :mime='mime' :src='mediaUrl' loadingStyle='width: 100%; height: 30vh; margin-top: 25px' style='width: 100%; margin-top: 25px' v-else />

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
							<Markdown :content='update.description || "**Your description is empty.**"' />
						</div>
					</div>
				</div>
				<div class='field'>
					<div>
						<span>Tags</span>
						<div ref='tagDiv' class='tag-field interactable text' contenteditable='true'>
							{{tagsField}}
						</div>
						<ol>
							<p v-if='tagSuggestions === null'></p>
							<li v-for='tag in tagSuggestions'>
								<Button class='interactable' @click='addTag(tag)'>
									{{tag}}
								</Button>
							</li>
						</ol>
					</div>
				</div>
				<div class='field popup-info'>
					<div>
						<span>Privacy</span>
						<RadioButtons
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
						<p v-if='update.privacy === "public"'>Anyone can see, and appears in searches</p>
						<p v-if='update.privacy === "unlisted"'>Hidden from searches, but anyone with a link can view</p>
						<!-- <p v-if='update.privacy === "private"'>Only people you explicitly invite can view</p> -->
						<p v-if='update.privacy === "private"'>Only you can view</p>
					</div>
				</div>
				<div class='field popup-info'>
					<div>
						<span>Rating</span>
						<RadioButtons
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
				<div class='field popup-info' v-show='false'>
					<div>
						<span>Flags</span>
						<CheckBoxes
							name='flags'
							v-model:value='update.flags'
							:data="[
								'auction',
								'emoji',
								'user-icon',
							]"
						/>
					</div>
					<ul class='selection-info'>
						<li v-if='update.flags && update.flags.includes("auction")'>Include bidding functions on your post</li>
						<li v-if='update.flags && update.flags.includes("emoji")'>Create an emoji from your post, to be used across the site</li>
						<li v-if='update.flags && update.flags.includes("user-icon")'>Make this post your current icon</li>
					</ul>
				</div>
				<div class='field' v-if='update.flags && update.flags.includes("auction")'>
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
					<b style='text-align: center; display: block'>Note: kheina.com will not charge your clients for you. You must invoice your clients yourself or use a third party payment processor.</b>
				</div>
				<div class='field popup-info' v-if='update.flags && update.flags.includes("emoji")'>
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
					<Button @click='publishPost' green><i class='material-icons'>publish</i>Publish</Button>
					<Button @click='savePost'><i class='material-icons'>save</i>Save</Button>
				</div>
			</div>
			<ThemeMenu />
		</main>
	</Error>
</template>

<script>
import { ref } from 'vue';
import { createToast, khatch, tagSplit, getCookie, getMediaUrl, isMobile } from '@/utilities';
import { apiErrorMessage, uploadHost, tagGroups, postsHost, tagsHost, environment } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Button from '@/components/Button.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import FileField from '@/components/FileField.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Markdown from '@/components/Markdown.vue';
import CopyText from '@/components/CopyText.vue';
import CheckBoxes from '@/components/CheckBoxes.vue';

export default {
	name: 'Upload',
	components: {
		ThemeMenu,
		Loading,
		Subtitle,
		Title,
		Error,
		Media,
		ProgressBar,
		FileField,
		RadioButtons,
		Markdown,
		Button,
		CopyText,
		MarkdownEditor,
		CheckBoxes,
	},
	setup() {
		const tagRecommendations = ref(null);
		const tagDiv = ref(null);
		return {
			tagRecommendations,
			tagDiv,
		};
	},
	data() {
		return {
			environment,
			tagGroups,
			errorDump: null,
			errorMessage: null,
			serverTags: null,
			savedTags: [],
			tagSuggestions: null,

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
		};
	},
	mounted() {
		if (this.$route.query?.post)
		{ this.postId = this.$route.query.post; }
		else
		{
			khatch(`${uploadHost}/v1/create_post`, {
				method: 'POST',
				errorMessage: 'Unable To Create New Post Draft!',
				body: { },
			}).then(response => {
				response.json().then(r => {
					// this.$router.push(this.$route.path + '?post=' + r.post_id);
					this.postId = r.post_id;
				});
			});
		}
	},
	computed: {
		isMobile,
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
		addTag(tag) {
			this.$refs.tagDiv.textContent += ' ' + tag;
		},
		showData() {
			console.log({
				errorMessage: this.errorMessage,
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
			if (this.isUploading || this.uploadUnavailable || !this.file)
			{ return; }

			this.isUploading = true;

			this.mediaUrl = getMediaUrl(this.postId, encodeURIComponent(this.file.name));

			let formdata = new FormData();
			formdata.append('file', this.file);
			formdata.append('post_id', this.postId);

			const ajax = new XMLHttpRequest();

			ajax.upload.addEventListener('progress', (event) => this.uploadProgress = (event.loaded / event.total) * 100, false);
			ajax.addEventListener('load', (event) => {
				this.mime = this.file.type;
				this.uploadDone = true;
				this.isUploading = false;
				this.file = null;
				console.log(JSON.parse(event.target.responseText));
			}, false);
			ajax.addEventListener('error', (event) => {
				console.error(event);
				this.errorDump = event.target.responseText ? event.target.responseText : event;
				this.errorMessage = 'An error occurred during image upload. (check the javascript console for error details)';
			}, false);

			const auth = getCookie('kh-auth');
			ajax.open('POST', `${uploadHost}/v1/upload_image`);
			ajax.setRequestHeader('authorization', auth);

			ajax.send(formdata);
		},
		savePost() {
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
					})
					.then(() => {
						successes++
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
						}
					})
					.catch(() => { });
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
					})
					.then(() => {
						successes++
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
						}
					})
					.catch(() => { });
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
							tags: activeTags,
						},
					})
					.then(response => {
						response.json().then(r => {
							console.log(r);
							this.tagsField = Object.values(activeTags).flat().join(' ');
						});
						successes++
						if (requiredSuccesses > 0 && successes >= requiredSuccesses)
						{
							createToast({
								icon: 'done',
								title: 'Post Updated!',
								color: 'green',
								time: 5,
							});
						}
					})
					.catch(() => { });
			}

			console.log(JSON.parse(JSON.stringify({
				activeTags,
				newTags,
				removedTags,
				savedTags: this.savedTags,
			})));

			this.savedTags = activeTags;
		},
		publishPost() {
			this.uploadFile();
			this.savePost();

			this.privacy = this.update.privacy;

			khatch(`${uploadHost}/v1/update_privacy`, {
				method: 'POST',
				body: {
					post_id: this.postId,
					privacy: this.privacy,
				},
			})
			.then(response => {
				if (response.status < 400)
				{ this.$router.push(`/p/${this.postId}`); }
			});
		},
	},
	watch: {
		postId(){
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
					// if (this.privacy != 'unpublished' && (Date.now() - new Date(r.created).getTime()) / 3600000 > 1)
					// { this.uploadUnavailable = true; }
				});
			});

			khatch(`${tagsHost}/v1/fetch_tags/${this.postId}`, {
				errorMessage: 'Unable To Retrieve Post Tags!',
			}).then(response => {
				response.json().then(r => {
					this.savedTags = Object.values(r).flat();
					this.tagsField = this.savedTags.join(' ');
				});
			}).catch(() => { });;

			khatch(`${tagsHost}/v1/get_user_tags/${this.$store.state.user?.handle}`, {
				errorMessage: 'Unable To Retrieve Your Recommended Tags!',
				errorHandlers: { 404: () => { } },
			}).then(response => {
				response.json().then(r => {
					this.tagSuggestions = [];
					r.forEach(tag => {
						this.tagSuggestions.push(tag.tag);
					});
				});
			}).catch(() => { });
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
.actions button {
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

p {
	padding: 0 0 2px 30px;
	margin: 0 -5px;
}
h4 {
	margin: 0;
}
ol {
	padding: 0;
	margin: 15px -12.5px -10px;
	list-style: none;
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
}
li {
	list-style: none;
	margin: 0 12.5px 10px;
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

@media only screen and (max-width: 1000px) {
	.form {
		width: auto;
	}
	/* .description {
		width: auto;
	}
	.user-info {
		width: auto;
	} */
}
</style>
