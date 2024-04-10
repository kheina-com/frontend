<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button @click='toggleDrafts' class='drafts-button'><i class='material-icons'>{{showDrafts ? 'chevron_left' : 'chevron_right'}}</i>Drafts</button>
		<div ref='draftsPanel' class='drafts-panel'>
			<button @click='fetchDrafts' class='refresh-drafts' title='refresh drafts'><i class='material-icons'>refresh</i></button>
			<div class='menu-border'/>
			<ol class='results'>
				<p v-show='drafts?.length === 0' style='text-align: center'>No drafts found</p>
				<li v-for='post in drafts || 3' @click='closeDrafts'>
					<Post :postId='post?.post_id' :to='`/create?post=${post.post_id}`' v-bind='post' hideButtons/>
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
						<FileField v-model:file='file' :showSlot='uploadDone && file === null' v-model:width='width' v-model:height='height'>
							<Media :key='postId' :mime='mime' :src='mediaUrl' :link='false' v-model:width='width' v-model:height='height'/>
						</FileField>
						<div class='field flex' v-if='file !== null'>
							<div>
								width: {{width ? commafy(width) : '...'}}px height: {{height ? commafy(height) : '...'}}px
								<br>
								size: {{abbreviate(file.size)}}
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
						<div v-show='resized'>
							width: {{resized ? commafy(resized?.width) : '...'}}px height: {{resized ? commafy(resized?.height) : '...'}}px
							<br>
							size: {{resized.scale.toFixed(2)}}%
						</div>
					</div>
				</div>
				<template v-slot:onLoad>
					<ProgressBar :fill='uploadProgress'/>
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
				<div>
					<span>Tags</span>
					<div ref='tagDiv' class='tag-field interactable text' contenteditable='true' @input='tagTracker'></div>
					<div class='frequently-used' v-if='tagSuggestions'>
						<span style='margin-top: var(--margin)'><button @click='showSuggestions = !showSuggestions'>Frequently Used Tags <i class='material-icons'>{{showSuggestions ? 'expand_less' : 'expand_more'}}</i></button></span>
						<div class='frequently-used-border'/>
						<div v-show='showSuggestions'>
							<ol :class='group' v-for='(tags, group) in sortTagGroups(tagSuggestions)'>
								<p class='group-title'>{{group}}</p>
								<li v-for='tag in tags'>
									<button class='interactable' @click='addTag(tag)' :id='tag'>
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
				<Button @click='showData' v-if='environment !== `prod`'><i class='material-icons'>science</i><span>test</span></Button>
				<Button @click='markDraft' :isLoading='saving' v-show='privacy === "unpublished"'><i class='material-icons'>note_add</i><span>Mark Draft</span></Button>
				<Button @click='savePost' :isLoading='saving'><i class='material-icons'>save</i><span>Save</span></Button>
				<Button @click='publishPost' :isLoading='saving' green><i class='material-icons'>publish</i><span>Publish</span></Button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { ref } from 'vue';
import { commafy, createToast, khatch, tab, tagSplit, getMediaUrl, sortTagGroups } from '@/utilities';
import { cdnHost, uploadHost, tagGroups, postsHost, tagsHost, environment, isMobile } from '@/config/constants';
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

const PublishedPrivacies = new Set(['public', 'unlisted', 'private']);

const path = '/create';
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
			PublishedPrivacies,
			serverTags: null,
			savedTags: new Set(),
			activeTags: new Set(),
			tagSuggestions: null,
			showSuggestions: true,
			postIdRegex: /^[a-zA-Z0-9_-]{8}$/,

			showUpload: false,
			showResize: false,
			resized: null,
			isUploading: false,
			uploadProgress: 0,
			// uploadUnavailable: false,
			uploadDone: false,
			mime: null,
			filename: null,
			file: null,
			width: null,
			height: null,
			update: { },
			mediaUrl: null,

			saving: false,

			// request fields
			postId: null,
			description: null,
			title: null,
			privacy: null,
			rating: null,
			parent: null,

			// drafts
			drafts: null,
			showDrafts: false,

			// parent post
			parentPost: { },
			validParent: null,

			// active tag tracking
			tagTrackerTimeout: null,
		};
	},
	mounted() {
		this.postWatcher(this.$route.query?.post);
		document.addEventListener("router-event", this.queryListener);

		this.$watch(
			() => this.$route.query?.post,
			this.postWatcher,
		);

		this.$watch(
			() => this.update?.webResize,
			this.calcResize,
		);

		this.$watch(
			() => this.width * this.height,
			this.calcResize,
		);

		this.$watch(
			() => this.update.parent,
			this.fetchParent,
		);
	},
	unmounted() {
		document.removeEventListener("router-event", this.queryListener);
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
		commafy,
		tab,
		sortTagGroups,
		fetchParent(postId) {
			if (this.postIdRegex.exec(postId)) {
				this.validParent = true;
				if (this.$store.state.postCache?.post_id === postId) {
					this.parentPost = this.$store.state.postCache;
				}
				else {
					khatch(`${postsHost}/v1/post/${postId}`, {
						errorMessage: 'Unable To Retrieve Post Data!',
					}).then(r => r.json())
					.then(r => this.parentPost = r);
				}
			}
			else {
				this.validParent = false;
				this.parentPost = { };
			}
		},
		calcResize() {
			if (!this.update.webResize)
			{ this.resized = null; }

			if (this.width > this.height) {
				const size = Math.min(parseInt(this.update.webResize), this.width);
				this.resized = {
					width: size,
					height: Math.round((this.height / this.width) * size),
					scale: size / this.width * 100,
				};
			}
			else {
				const size = Math.min(parseInt(this.update.webResize), this.height);
				this.resized = {
					height: size,
					width: Math.round((this.width / this.height) * size),
					scale: size / this.height * 100,
				};
			}
		},
		abbreviate(bytes) {
			const units = ['B', 'KB', 'MB', 'GB', 'TB'];
			let count = 0;
			while (bytes > 1024) {
				bytes /= 1024;
				count += 1;
			}
			if (bytes < 100)
			{ return `${Math.round(bytes * 100) / 100}${units[count]}`; }
			return `${Math.round(bytes * 10) / 10}${units[count]}`;
		},
		toggleDrafts() {
			this.showDrafts = !this.showDrafts;
			if (this.showDrafts)
			{ this.$refs.draftsPanel.classList.add('open'); }
			else
			{ this.$refs.draftsPanel.classList.remove('open'); }

			if (this.drafts === null) {
				this.fetchDrafts();
			}
		},
		fetchDrafts() {
			this.drafts = null;
			khatch(`${postsHost}/v1/fetch_drafts`, {
				handleError: true,
			}).then(r => r.json())
			.then(r => this.drafts = r.toSorted((a, b) => new Date(b.updated) - new Date(a.updated)));
		},
		closeDrafts() {
			this.showDrafts = false;
			this.$refs.draftsPanel.classList.remove('open');
		},
		markDraft() {
			this.saving = true;
			this.uploadFile()
			.then(this.saveData)
			.then(() => khatch(`${uploadHost}/v1/update_privacy`, {
				handleError: true,
				method: 'POST',
				body: {
					post_id: this.postId,
					privacy: 'draft',
				},
			})).then(() => {
				this.privacy = 'draft';
				createToast({
					icon: 'done',
					title: 'Saved as Draft!',
					color: 'green',
					time: 5,
				});
			}).finally(() => this.saving = false);
		},
		savePost() {
			this.saving = true;
			this.uploadFile()
			.then(this.saveData)
			.finally(() => this.saving = false);
		},
		publishPost() {
			if (!PublishedPrivacies.has(this.update.privacy)) {
				createToast({
					title: 'Privacy Not Set!',
					time: 5,
				});
				return;
			}
			this.saving = true;
			this.uploadFile()
			.then(this.saveData)
			.then(() => khatch(`${uploadHost}/v1/update_privacy`, {
				handleError: true,
				method: 'POST',
				body: {
					post_id: this.postId,
					privacy: this.update.privacy,
				},
			})).then(() => {
				this.privacy = this.update.privacy;
				this.$router.push(`/p/${this.postId}`);
			}).catch(() => this.saving = false);
		},
		addTag(tag) {
			if (this.activeTags.has(tag)) {
				this.activeTags.delete(tag);
				this.$refs.tagDiv.innerText = Array.from(this.activeTags).join(" ");
				document.getElementById(tag).style.borderColor = null;
			} else {
				this.activeTags.add(tag);
				this.$refs.tagDiv.innerText = Array.from(this.activeTags).join(" ");
				document.getElementById(tag).style.borderColor = "var(--interact)";
			}
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
				activeTags: this.activeTags,
				savedTags: this.savedTags,
				tagSuggestions: this.tagSuggestions,
				meta: {
					filename: this.filename,
					showUpload: this.showUpload,
					isUploading: this.isUploading,
					uploadProgress: this.uploadProgress,
					// uploadUnavailable: this.uploadUnavailable,
					uploadDone: this.uploadDone,
				},
			});
		},
		uploadFile(finish=false) {
			this.saving = true;
			return new Promise((resolve, reject) => {
				if (this.isUploading || !this.file) // || this.uploadUnavailable
				{ return resolve(); }

				this.isUploading = true;

				let formdata = new FormData();
				formdata.append('file', this.file);
				formdata.append('post_id', this.postId);

				if (this.update.webResize)
				{ formdata.append('web_resize', parseInt(this.update.webResize.trim())); }

				const complete = () => {
					this.showResize = false;
					this.uploadDone = true;
					this.isUploading = false;
					this.uploadProgress = 0;
					if (finish)
					{ this.saving = false; }
				};

				const errorHandler = (event) => {
					createToast({
						title: 'Something broke during upload',
						description: 'If you submit a bug report, please include the data below.',
						dump: event?.target?.responseText ?? event,
					});
					console.error('error:', event);
					complete();
				};

				const ajax = new XMLHttpRequest();

				ajax.upload.addEventListener('progress', event => this.uploadProgress = (event.loaded / event.total), false);
				ajax.addEventListener('load', (event) => {
					if (event.target.status >= 400)
					{ return reject(errorHandler(event)); }
					const response = JSON.parse(event.target.responseText);
					this.mediaUrl = `${cdnHost}/${encodeURIComponent(response.url)}`;
					this.mime = this.file.type;
					this.file = null;
					complete();
					resolve();
				}, false);
				ajax.addEventListener('error', e => reject(errorHandler(e)), false);

				const auth = this.$store.state.auth?.token;
				ajax.open('POST', `${uploadHost}/v1/upload_image`);
				ajax.setRequestHeader('authorization', 'bearer ' + auth);

				ajax.send(formdata);
			});
		},
		saveData() {
			return new Promise((resolve, reject) => {
				let sendUpdate = false;
				let requiredSuccesses = 0;
				let successes = 0;

				if (this.title !== this.update.title) {
					sendUpdate = true;
					this.title = this.update.title = this.update.title.trim();
				}

				if (this.description !== this.update.description) {
					sendUpdate = true;
					this.description = this.update.description;
				}

				if (this.rating !== this.update.rating) {
					sendUpdate = true;
					this.rating = this.update.rating;
				}

				if (this.parent !== this.update.parent) {
					sendUpdate = true;
					this.parent = this.update.parent;
				}

				const success = () => {
					successes++;
					if (successes >= requiredSuccesses) {
						createToast({
							icon: 'done',
							title: 'Post Updated!',
							color: 'green',
							time: 5,
						});
						resolve();
					}
				};

				if (sendUpdate) {
					requiredSuccesses++;
					khatch(`${uploadHost}/v1/update_post`, {
						method: 'POST',
						errorMessage: 'failed to update post!',
						body: {
							post_id: this.postId,
							title: this.title,
							description: this.description,
							rating: this.rating,
							parent: this.parent,
						},
					}).then(success)
					.catch(reject);
				}

				const activeTags = new Set(this.activeTags);

				let removedTags = [];
				this.savedTags.forEach(tag => {
					if (!activeTags.has(tag))
					{ removedTags.push(tag); }
				});

				if (removedTags.length > 0) {
					requiredSuccesses++;
					khatch(`${tagsHost}/v1/remove_tags`, {
						errorMessage: 'failed to remove tags!',
						method: 'POST',
						body: {
							post_id: this.postId,
							tags: removedTags,
						},
					}).then(success)
					.catch(reject);
				}

				let newTags = [];
				activeTags.forEach(tag => {
					if (!this.savedTags.has(tag))
					{ newTags.push(tag); }
				});

				if (newTags.length > 0) {
					requiredSuccesses++;
					khatch(`${tagsHost}/v1/add_tags`, {
						errorMessage: 'failed to add tags!',
						method: 'POST',
						body: {
							post_id: this.postId,
							tags: newTags,
						},
					}).then(success)
					.catch(reject);
				}

				if (requiredSuccesses === 0)
				{ resolve(); }

				console.debug(JSON.parse(JSON.stringify({
					activeTags,
					newTags,
					removedTags,
					savedTags: this.savedTags,
				})));

				this.savedTags = activeTags;
			});
		},
		queryListener(event) {
			const query = event?.detail?.query;
			if (this.postId === query?.post) {
				return;
			}
			let path = this.$route.path;
			if (query) {
				path += "?" + Object.entries(query).map(e => e[0] + "=" + encodeURIComponent(e[1])).join("&");
			}
			history.replaceState(null, "", path);
			return this.postWatcher(query?.post);
		},
		postWatcher(value) {
			if (this.$route.path !== path || this.postId === value)
			{ return; }
			console.debug("postWatcher:", value);

			this.postId = value;
			const unset = () => {
				this.uploadDone = false;
				this.filename = null;
				this.mediaUrl = null;
				this.isUploading = false;
				this.uploadProgress = 0;
			};

			if (this.postId?.length === 8) {
				if (this.$store.state.postCache?.post_id === this.postId) {
					const r = this.$store.state.postCache;
					this.description = this.update.description = r.description;
					this.title = this.update.title = r.title;
					this.privacy = this.update.privacy = r.privacy;
					this.rating = this.update.rating = r.rating;
					this.parent = this.update.parent = r.parent;
					this.mime = r.media_type?.mime_type;

					if (r.filename) {
						this.uploadDone = true;
						this.filename = r.filename;
						this.mediaUrl = getMediaUrl(this.postId, this.filename);
						this.width = r?.size?.width;
						this.height = r?.size?.height;
					}
					else {
						unset();
					}
					this.$store.state.postCache = null;
				}
				else {
					khatch(`${postsHost}/v1/post/${this.postId}`, {
						errorMessage: 'Unable To Retrieve Post Data!',
					}).then(r => r.json())
					.then(r => {
						this.description = this.update.description = r.description ?? "";
						this.title = this.update.title = r.title ?? "";
						this.privacy = this.update.privacy = r.privacy;
						this.rating = this.update.rating = r.rating;
						this.parent = this.update.parent = r.parent ?? "";
						this.mime = r.media_type?.mime_type;
						if (r.filename) {
							this.uploadDone = true;	
							this.filename = r.filename;
							this.mediaUrl = getMediaUrl(this.postId, this.filename);
							this.width = r?.size?.width;
							this.height = r?.size?.height;
						}
						else {
							unset();
						}
						// if (this.privacy !== 'unpublished' && (Date.now() - new Date(r.created).getTime()) / 3600000 > 1)
						// { this.uploadUnavailable = true; }
					});
				}

				khatch(`${tagsHost}/v1/tags/${this.postId}`, {
					errorMessage: 'Unable To Retrieve Post Tags!',
				}).then(r => r.json())
				.then(r => {
					this.savedTags = new Set(Object.values(r).flat());
					this.colorizeTags(this.savedTags);
					this.$refs.tagDiv.innerText = Array.from(this.savedTags).join(' ');
				});

				khatch(`${tagsHost}/v1/frequently_used`, {
					errorMessage: 'Unable To Retrieve Your Recommended Tags!',
					errorHandlers: { 404: () => { } },
				}).then(r => r.json())
				.then(r => {
					this.tagSuggestions = r;
					setTimeout(this.colorizeTags);
				});
			}
			else {
				unset();
				khatch(`${uploadHost}/v1/create_post`, {
					method: 'POST',
					errorMessage: 'Unable To Create New Post Draft!',
					body: { },
				}).then(r => r.json())
				.then(r => document.dispatchEvent(new CustomEvent("router-event", { detail: { query: { post: r.post_id } } })));
			}
		},
		tagTracker() {
			if (this.tagTrackerTimeout) {
				clearTimeout(this.tagTrackerTimeout);
			}
			this.tagTrackerTimeout = setTimeout(() => {
				this.colorizeTags();
				this.tagTrackerTimeout = null;
			}, 300);
		},
		colorizeTags(tags) {
			tags = tags || new Set(tagSplit(this.$refs.tagDiv.innerText));
			tags.forEach(e => {
				const b = document.getElementById(e);
				if (b && !b.style.borderColor) {
					// for every new tag, set border color
					b.style.borderColor = "var(--interact)";
				}
			});
			this.activeTags.forEach(e => {
				if (!tags.has(e)) {
					// for every old tag, unset border color
					const b = document.getElementById(e);
					if (b) {
						b.style.borderColor = null;
					}
				}
			});
			this.activeTags = new Set(tags);
		},
	},
	// watch: {
	// 	activeTags(value) {
	// 		const tags = new Set(tagSplit(this.$refs.tagDiv.innerText));
	// 	},
	// },
}
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
	max-width: var(--margin);
	width: var(--margin);
}
.mobile .drafts-button i {
	width: auto;
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
