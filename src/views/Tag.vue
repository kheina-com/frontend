<template>
	<main >
		<Error :dump='errorDump' :message='errorMessage'>
			<button class='interactable edit-button' @click='editToggle' v-if='editable'>
				<i class='material-icons'>{{editing ? 'edit_off' : 'edit'}}</i>
			</button>
			<div class='tag' v-if='editing'>
				<div>
					<h2>Tag</h2>
					<input class='interactable text' v-model='updateBody.name'>
				</div>
				<div>
					<h2>Class</h2>
					<input class='interactable text' v-model='updateBody.tag_class'>
				</div>
				<div>
					<h2>Owner</h2>
					<input class='interactable text' v-model='updateBody.owner'>
				</div>
			</div>
			<div class='tag' v-else>
				<div>
					<h2>Tag</h2>
					<Loading v-if='isLoading'>default</Loading>
					<p :style='`color: var(${colorMap[tagData?.class]})`' v-else>
						{{tagData?.tag.replace(/_/g, ' ')}}
					</p>
				</div>
				<div>
					<h2>Class</h2>
					<Loading v-if='isLoading'>default</Loading>
					<i e-else>{{tagData?.class}}</i>
				</div>
				<div>
					<h2>Inherited Tags</h2>
					<Loading v-if='isLoading'>default</Loading>
					<ul v-else-if='tagData.inherited_tags.length'>
						<li v-for='tag in tagData?.inherited_tags'>
							<router-link :to='`/t/${tag}`'>
								{{tag.replace(/_/g, ' ')}}
							</router-link>
						</li>
					</ul>
					<b v-else>None</b>
				</div>
				<div>
					<h2>Owner</h2>
					<Profile :isLoading='isLoading' :username='tagData?.owner?.name' :handle='tagData?.owner?.handle' :icon='tagData?.owner?.icon' v-if='tagData?.owner !== null'/>
					<b v-else>None</b>
				</div>
			</div>
			<MarkdownEditor class='markdown-editor' v-model:value='updateBody.description' v-if='editing'/>
			<Markdown :content='tagData?.description' class='markdown' v-else/>
			<Button @click='updateTag' green v-if='editing' class='update-button'><i class='material-icons-round'>check</i>Update</Button>
			<ol class='results'>
				<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{query}}</em></p>
				<li v-for='post in posts || 3' v-else>
					<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
				</li>
			</ol>
		</Error>
		<ThemeMenu />
	</main>
</template>

<script>
import { useRoute } from 'vue-router';
import { khatch, isMobile } from '@/utilities';
import { apiErrorMessage, postsHost, tagsHost } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Loading from '@/components/Loading.vue';
import Error from '@/components/Error.vue';
import Post from '@/components/Post.vue';
import Profile from '@/components/Profile.vue';
import Button from '@/components/Button.vue';
import Markdown from '@/components/Markdown.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';


export default {
	name: 'Tag',
	props: {
		tag: String,
	},
	components: {
		ThemeMenu,
		Loading,
		Error,
		Post,
		Profile,
		Button,
		Markdown,
		MarkdownEditor,
	},
	data() {
		return {
			colorMap: {
				artist: '--pink',
				sponsor: '--green',
				subject: '--violet',
				species: '--red',
				gender: '--blue',
				misc: '--subtlecolor',
			},
			tagData: null,
			posts: null,
			errorDump: null,
			errorMessage: null,
			editing: null,
			updateBody: { },
		}
	},
	mounted() {
		const route = useRoute();
		khatch(`${postsHost}/v1/fetch_posts`, {
				method: 'POST',
				body: {
					sort: route.query.sort ? route.query.sort : 'hot',
					tags: [this.tag],
				},
			})
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.posts = r.posts; }
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

		khatch(`${tagsHost}/v1/tag/${this.tag}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{ this.tagData = r; }
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
	},
	computed: {
		isMobile,
		isLoading()
		{ return this.tagData === null; },
		isError()
		{ return this.errorMessage !== null; },
		editable() {
			return (this.$store.state.user && this.tagData?.owner?.handle === this.$store.state.user?.handle) || Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
		isAdmin() {
			return Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
	},
	methods: {
		editToggle() {
			this.editing = !this.editing;
			this.updateBody.name = this.tag;
			this.updateBody.tag_class = this.tagData.class;
			this.updateBody.description = this.tagData.description;
			this.updateBody.owner = this.tagData.owner?.handle;
		},
		updateTag() {
			let body = { tag: this.tag };

			if (this.updateBody?.name && this.updateBody.name != this.tag)
			{ body.name = this.updateBody.name; }

			if (this.updateBody?.tag_class && this.updateBody.tag_class != this.tagData?.class)
			{ body.tag_class = this.updateBody.tag_class; }

			if (this.updateBody?.owner && this.updateBody.owner != this.tagData?.owner?.handle)
			{ body.owner = this.updateBody.owner; }

			if (this.updateBody?.description && this.updateBody.description != this.tagData?.description)
			{ body.description = this.updateBody.description; }

			khatch(`${tagsHost}/v1/update_tag`, {
					method: 'POST',
					body,
				})
				.then(response => {
					if (response.status < 300)
					{ this.editing = false; }
					else 
					{
						response.json().then(r => {
							if (response.status === 401)
							{ this.errorMessage = r.error; }
							else if (response.status === 404)
							{ this.errorMessage = r.error; }
							else
							{
								this.errorMessage = apiErrorMessage;
								this.errorDump = r;
							}
						});
					}
				})
				.catch(error => {
					this.errorMessage = apiErrorMessage;
					this.error = error;
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
	display: block;
}
h2 {
	margin: 0 0 10px;
}
.results {
	display: flex;
	flex-direction: column;
}
.profile {
	padding: 0.25em;
	margin: -0.25em;
	margin-top: 0;
	border-radius: 3px;
}
a.profile:hover {
	background: var(--bg2color);
}
ul {
	margin: 0;
	padding-left: 25px;
}
.tag {
	width: 70vw;
	margin: 0 auto 25px;
	display: flex;
	justify-content: space-between;
}
.markdown {
	width: 70vw;
	margin: 0 auto 25px;
}
.markdown-editor {
	background: var(--bg2color);
	margin-bottom: 25px;
}
.mobile .markdown, .mobile .tag {
	width: auto;
}

.edit-button {
	margin-left: 0.5em;
	padding: 0.25em;
	position: absolute;
	right: 25px;
}
.edit-button i {
	display: block;
}
.update-button {
	margin: 0 auto 25px;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol > :last-child {
	margin-bottom: 0;
}
</style>