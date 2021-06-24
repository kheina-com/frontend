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
				<div class='field'>
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
					<!-- <div>
						Public - Anyone can see, and appears in searches
						<br>
						Unlisted - Hidden from searches, but anyone with a link can view
						<br>
						Private - Only people you explicitly invite can view
					</div> -->
				</div>
				<div class='field'>
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
					<!-- <div>
						General - Appropriate for all audiences
						<br>
						Mature - Tasteful nudity
						<br>
						Explicit - Sex, porn, etc
					</div> -->
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
import { khatch, tagSplit, getCookie, getMediaUrl, isMobile } from '@/utilities';
import { apiErrorMessage, uploadHost, tagGroups, postsHost, tagsHost, environment } from '@/config/constants';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Title from '@/components/Title';
import Subtitle from '@/components/Subtitle';
import Error from '@/components/Error';
import ThemeMenu from '@/components/ThemeMenu';
import Media from '@/components/Media';
import ProgressBar from '@/components/ProgressBar';
import FileField from '@/components/FileField';
import RadioButtons from '@/components/RadioButtons';
import MarkdownEditor from '@/components/MarkdownEditor';
import Markdown from '@/components/Markdown';
import CopyText from '@/components/CopyText';

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
	created() {
		// khatch(`${tagsHost}/v1/lookup_tags`, {
		// 	method: 'POST',
		// 	body: {
		// 		tag: '',
		// 	},
		// })
		// .then(response => {
		// 	response.json().then(r => {
		// 		if (response.status < 300)
		// 		{
		// 			let serverTags = { };
		// 			for (const [group, tags] of Object.entries(r)) {
		// 				Object.keys(tags).forEach(k => tags[k]['group'] = group);
		// 				serverTags = Object.assign(serverTags, tags);
		// 			}
		// 			this.serverTags = serverTags;
		// 		}
		// 		else if (response.status === 401)
		// 		{ this.errorMessage = r.error; }
		// 		else if (response.status === 404)
		// 		{ this.errorMessage = r.error; }
		// 		else
		// 		{
		// 			this.errorMessage = apiErrorMessage;
		// 			this.errorDump = r;
		// 		}
		// 	});
		// })
		// .catch(error => {
		// 	this.errorMessage = apiErrorMessage;
		// 	this.errorDump = error;
		// 	console.error(error);
		// });

		if (this.$route.query?.post)
		{
			this.postId = this.$route.query.post;

			khatch(`${postsHost}/v1/post/${this.postId}`)
				.then(response => {
					response.json().then(r => {
						console.log(r);
						if (response.status < 300)
						{
							this.description = this.update.description = r.description;
							this.title = this.update.title = r.title;
							this.privacy = this.update.privacy = r.privacy;
							this.rating = this.update.rating = r.rating;
							this.mime = r.media_type?.mime_type;
							if (r.filename) {
								this.uploadDone = true;
								this.filename = r.filename;
								this.mediaUrl = this.getMediaUrl(this.postId, this.filename);
							}
							// if (this.privacy != 'unpublished' && (Date.now() - new Date(r.created).getTime()) / 3600000 > 1)
							// { this.uploadUnavailable = true; }
						}
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.errorMessage = r.error; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.errorDump = error;
					console.error(error);
				});

			khatch(`${tagsHost}/v1/fetch_tags/${this.postId}`)
				.then(response => {
					response.json().then(r => {
						console.log(r);
						if (response.status < 300)
						{
							this.savedTags = Object.values(r).flat();
							this.tagsField = this.savedTags.join(' ');
						}
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.errorMessage = r.error; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});

			khatch(`${tagsHost}/v1/get_user_tags/${this.$store.state.user?.handle}`)
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							this.tagSuggestions = [];
							r.forEach(tag => {
								this.tagSuggestions.push(tag.tag);
							});
						}
						else if (response.status === 401)
						{ this.errorMessage = r.error; }
						else if (response.status === 404)
						{ this.tagSuggestions = []; }
						else
						{
							this.errorMessage = apiErrorMessage;
							this.errorDump = r;
						}
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
					console.error(error);
				});
		}
		else
		{
			khatch(`${uploadHost}/v1/create_post`, {
				method: 'POST',
				body: { },
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.postId = r.post_id;
						this.$router.replace(this.$route.path + '?post=' + this.postId);
					}
					else if (response.status === 401)
					{ this.errorMessage = r.error; }
					else if (response.status === 404)
					{ this.errorMessage = r.error; }
					else
					{
						this.errorMessage = apiErrorMessage;
						this.errorDump = r;
					}
				});
			})
			.catch(error => {
				this.errorMessage = apiErrorMessage;
				this.error = error;
				console.error(error);
			});
		}
	},
	computed: {
		isMobile,
	},
	methods: {
		getMediaUrl,
		addTag(tag) {
			this.$refs.tagDiv.textContent += ' ' + tag;
		},
		showData() {
			console.log({
				errorMessage: this.errorMessage,
				errorDump: this.errorDump,
				file: this.file,
				update: this.update,
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

			this.mediaUrl = this.getMediaUrl(this.postId, encodeURIComponent(this.file.name));

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
				khatch(`${uploadHost}/v1/update_post`, {
						method: 'POST',
						body: {
							post_id: this.postId,
							title: this.title ? this.title.trim() : null,
							description: this.description ? this.description.trim() : null,
							rating: this.rating,
						},
					})
					.then(response => {
						response.json().then(r => {
							console.log(r);
						});
					})
					.catch(error => {
						this.errorMessage = apiErrorMessage;
						this.errorDump = error;
						console.error(error);
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
				khatch(`${tagsHost}/v1/remove_tags`, {
						method: 'POST',
						body: {
							post_id: this.postId,
							tags: removedTags,
						},
					})
					.then(response => {
						response.json().then(r => {
							console.log(r);
						});
					})
					.catch(error => {
						this.errorMessage = apiErrorMessage;
						this.errorDump = error;
						console.error(error);
					});
			}

			let newTags = [];
			activeTags.forEach(tag => {
				if (!this.savedTags.includes(tag))
				{ newTags.push(tag); }
			});

			if (newTags.length > 0)
			{
				khatch(`${tagsHost}/v1/add_tags`, {
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
					})
					.catch(error => {
						this.errorMessage = apiErrorMessage;
						this.errorDump = error;
						console.error(error);
					});
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
					response.json().then(r => {
						console.log(r);
						this.$router.push(`/p/${this.postId}`);
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.errorDump = error;
					console.error(error);
				});
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
