<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<Error :dump='errorDump' :message='errorMessage'>
		<main>
			<Title static='center'>New Post</Title>
			<Subtitle static='center'>Your post will be live at <Loading :isLoading='!postId' span><router-link :to='`/p/${postId}`'>{{environment === 'prod' ? `kheina.com/p/${postId}` : `dev.kheina.com/p/${postId}`}}</router-link></Loading></Subtitle>
			<div class='form'>
				<Loading :lazy='false' :isLoading='isUploading' v-if='!uploadDone'>
					<div class='field'>
						<div>
							<span>File</span>
							<FileField v-model:file='file'/>
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
						<input class='interactable text' style='display: block; width: 100%' v-model='title'>
					</div>
				</div>
				<div class='field'>
					<div>
						<span>Description</span>
						<router-link style='position: absolute; right: 25px; font-size: 0.9em' to='/md'>markdown guide</router-link>
						<MarkdownEditor v-model:value='description' style='min-width: 100%; display: inline-block; transform: translateX(-50%); left: 50%;'/>
					</div>
				</div>
				<div class='field'>
					<div>
						<span>Tags</span>
						<div ref='tagDiv' class='tag-field interactable text' contenteditable='true'>
							{{tags}}
						</div>
					</div>
				</div>
				<div class='field'>
					<div>
						<span>Privacy</span>
						<RadioButtons
							name='privacy'
							v-model:value='privacy'
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
							v-model:value='rating'
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
import { khatch, tagSplit, getCookie, getMediaUrl } from '@/utilities';
import { apiErrorMessage, uploadHost, tagGroups, postsHost, tagsHost, environment } from '@/config/constants';
import Loading from '@/components/Loading.vue';
import Button from '@/components/Button.vue';
import Title from '@/components/Title.vue';
import Subtitle from '@/components/Subtitle.vue';
import Error from '@/components/Error.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Media from '@/components/Media.vue';
import ProgressBar from '@/components/ProgressBar.vue'
import FileField from '@/components/FileField.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import CopyText from '@/components/CopyText.vue'

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
		MarkdownEditor,
		Button,
		CopyText,
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
			tags: new Set(),
			recommendations: null,

			showUpload: false,
			isUploading: false,
			uploadProgress: 0,
			uploadDone: false,
			mime: null,
			filename: null,
			file: null,

			// request fields
			postId: null,
			description: null,
			title: null,
			tags: null,
			privacy: null,
			rating: null,
		};
	},
	created() {
		khatch(`${tagsHost}/v1/lookup_tags`, {
			method: 'POST',
			body: {
				tag: '',
			},
		})
		.then(response => {
			response.json().then(r => {
				if (response.status < 300)
				{
					let serverTags = { };
					for (const [group, tags] of Object.entries(r)) {
						Object.keys(tags).forEach(k => tags[k]['group'] = group);
						serverTags = Object.assign(serverTags, tags);
					}
					this.serverTags = serverTags;
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
		if (this.$route.query?.post)
		{
			this.postId = this.$route.query.post;

			khatch(`${postsHost}/v1/post/${this.postId}`)
				.then(response => {
					response.json().then(r => {
						console.log(Object.assign(r, { response }));
						if (response.status < 300)
						{
							this.description = r.description;
							this.title = r.title;
							this.privacy = r.privacy;
							this.rating = r.rating;
							this.tags = Object.values(r.tags).flat().join(' ');
							this.mime = r.media_type?.mime_type;
							if (r.filename) {
								this.uploadDone = true;
								this.filename = r.filename;
							}
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
		mediaUrl()
		{ return this.mime ? getMediaUrl(this.postId, this.file?.name || this.filename) : null; },
	},
	methods: {
		getMediaUrl,
		showData() {
			console.log({
				errorMessage: this.errorMessage,
				errorDump: this.errorDump,
				file: this.file,
				title: this.title,
				description: this.description,
				privacy: this.privacy,
				rating: this.rating,
				tags: tagSplit(this.$refs.tagDiv.textContent),
				this_tags: this.tags,
			});
		},
		uploadFile() {
			if (this.isUploading || this.uploadDone || !this.file)
			{ return; }

			this.isUploading = true;

			let formdata = new FormData();
			formdata.append('file', this.file);
			formdata.append('post_id', this.postId);

			const ajax = new XMLHttpRequest();

			ajax.upload.addEventListener('progress', (event) => this.uploadProgress = (event.loaded / event.total) * 100, false);
			ajax.addEventListener('load', (event) => {
				this.uploadDone = true;
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
		filterTags(group) {
			return Array.from(this.tags).map(tag => {
				if (this.serverTags.hasOwnProperty(tag))
				{
					if (this.serverTags[tag].group === group)
					{ return tag; }
				}
				else if (group === 'misc')
				{ return tag; }
			}).filter(x => x);
		},
		savePost() {
			let tags = tagSplit(this.$refs.tagDiv.textContent);
			this.showData();

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

			let removedTags = [];
			tagSplit(this.tags).forEach(tag => {
				if (!tags.includes(tag))
				{ removedTags.push(tag); }
			});
			console.log(JSON.parse(JSON.stringify({tags, this_tags: this.tags, removedTags, tagSplit: tagSplit(this.tags)})));

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

			khatch(`${tagsHost}/v1/add_tags`, {
					method: 'POST',
					body: {
						post_id: this.postId,
						tags,
					},
				})
				.then(response => {
					response.json().then(r => {
						console.log(r);
						this.tags = Object.values(tags).flat().join(' ');
					});
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.errorDump = error;
					console.error(error);
				});
		},
		publishPost() {
			this.uploadFile();
			this.savePost();

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
	min-width: 800px;
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
.tags {
	display: flex;
	justify-content: center;
	align-items: flex-start;
	flex-flow: wrap;
}
.tags ul {
	padding: 0.5em;
	background: var(--bg2color);
	border: 1px solid var(--bordercolor);
	border-radius: 3px;
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
.tag-field ul {
	padding: 0.25em 1em 0.5em;
	margin: 0;
	position: absolute;
}
.tag-field li {
	margin: 0 0 0.5em;
}
.tag-field ul > :last-child {
	margin: 0;
}

textarea {
	width: 100%;
	height: 5em;
	margin: 0;
	resize: vertical;
}
p {
	padding: 0 0 2px 30px;
	margin: 0 -5px;
}
h4 {
	margin: 0;
}
ul {
	padding: 0;
	margin: 0 12.5px;
}
li {
	list-style: none;
}

.media {
	margin: 25px auto;
	display: flex;
	justify-content: center;
}
</style>
