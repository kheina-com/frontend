<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<Error v-model:dump='errorDump' v-model:message='errorMessage'>
			<button class='interactable edit-button' @click='editToggle' v-if='editable'>
				<i class='material-icons'>{{editing ? 'edit_off' : 'edit'}}</i>
			</button>
			<Loading v-if='editing' :lazy='false' :isLoading='pendingUpdate'>
				<div class='tag'>
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
				<MarkdownEditor class='markdown-editor' v-model:value='updateBody.description'/>
			</Loading>
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
					<Profile :isLoading='isLoading' v-if='tagData?.owner' v-bind='tagData.owner'/>
					<b v-else>None</b>
				</div>
			</div>
			<Markdown :content='tagData?.description' class='markdown' v-if='!editing'/>
			<Button @click='updateTag' green v-if='editing' class='update-button'><i class='material-icons-round'>check</i>Update</Button>
			<DropDown class='sort-dropdown' v-model:value='sort' :options="[
				{ name: 'Newest', value: 'new' },
				{ name: 'Oldest', value: 'old' },
				{ name: 'Top', value: 'top' },
				{ name: 'Hot', value: 'hot' },
				{ name: 'Best', value: 'best' },
				{ name: 'Controversial', value: 'controversial' },
			]">
				<span class='sort-by'>
					<i class='material-icons-round'>sort</i>
					sort by
				</span>
			</DropDown>
			<ol class='results'>
				<p v-if='posts?.length === 0' style='text-align: center'>No posts found for <em>{{tag}}</em></p>
				<li v-for='post in posts || 3' v-else>
					<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
				</li>
			</ol>
			<div class='page-links' v-if='page !== 1 || posts?.length >= count'>
				<button @click='setPage(page - 1)' v-if='page > 1'>
					◄
				</button>
				<button @click='setPage(toPage)' v-for='toPage in pagesBeforeCurrent'>
					{{toPage}}
				</button>
				<b>
					{{page}}
				</b>
				<button @click='setPage(toPage)' v-for='toPage in pagesAfterCurrent'>
					{{toPage}}
				</button>
				<button @click='setPage(page + 1)' v-if='posts?.length >= count'>
					►
				</button>
			</div>
		</Error>
		<ThemeMenu />
	</main>
</template>

<script>
import { khatch, isMobile, setTitle } from '@/utilities';
import { apiErrorMessage, postsHost, tagsHost } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Loading from '@/components/Loading.vue';
import Error from '@/components/Error.vue';
import Post from '@/components/Post.vue';
import Profile from '@/components/Profile.vue';
import Button from '@/components/Button.vue';
import Markdown from '@/components/Markdown.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import DropDown from '@/components/DropDown.vue';


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
		DropDown,
	},
	data() {
		return {
			colorMap: {
				artist: '--pink',
				sponsor: '--green',
				subject: '--violet',
				species: '--orange',
				gender: '--blue',
				misc: '--subtle',
			},
			tagData: null,
			posts: null,
			errorDump: null,
			errorMessage: null,
			editing: null,
			updateBody: { },
			pendingUpdate: false,
			sort: null,
			page: null,
		}
	},
	created() {
		this.fetchPosts();

		khatch(`${tagsHost}/v1/tag/${this.tag}`)
			.then(response => {
				response.json().then(r => {
					if (response.status < 300)
					{
						this.tagData = r;
						setTitle(`${r.tag}, ${r.class} tag | kheina.com`);
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

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
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
		pagesBeforeCurrent() {
			if (this.posts === null)
			{ return null; }

			if (this.page - 2 > 0)
			{ return [this.page - 2, this.page - 1]; }

			if (this.page - 1 > 0)
			{ return [this.page - 1]; }

			return [];
		},
		pagesAfterCurrent() {
			if (this.posts === null)
			{ return null; }

			if (this.posts.length >= this.count)
			{ return [this.page + 1, this.page + 2]; }
		},
	},
	methods: {
		fetchPosts() {
			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;
			this.sort = this.$route.query?.sort || 'hot';

			this.posts = null;

			khatch(`${postsHost}/v1/fetch_posts`, {
					method: 'POST',
					body: {
						sort: this.sort,
						tags: [this.tag],
						page: this.page,
						count: this.count,
					},
				})
				.then(response => {
					response.json().then(r => {
						if (response.status < 300)
						{
							if (this.$store.state.scroll)
							{ setTimeout(() => { console.log(this.$store.state.scroll); window.scrollTo(0, this.$store.state.scroll); this.$store.state.scroll = null; }, 0); }
							this.posts = r;
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
		},
		editToggle() {
			this.editing = !this.editing;
			this.updateBody.name = this.tag;
			this.updateBody.tag_class = this.tagData.class;
			this.updateBody.description = this.tagData.description;
			this.updateBody.owner = this.tagData.owner?.handle;
		},
		updateTag() {
			this.pendingUpdate = true;

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
					{
						this.pendingUpdate = this.editing = false;
						this.tagData = Object.assign(this.tagData, this.updateBody);
					}
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
		pageLink(page) {
			let query = [];

			if (page !== 1)
			{ query.push(`page=${page}`); }

			if (this.count !== 64)
			{ query.push(`count=${this.count}`); }

			return '/t/' + this.tag + '?' + query.join('&');
		},
		setPage(page) {
			this.page = page;
			this.$router.push(this.pageLink(page));
		},
	},
	watch: {
		sort() {
			if (this.$route.name !== 'tag')
			{ return; }
			this.$router.push(this.pageLink(this.page));
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
.profile {
	padding: 0.25em;
	margin: -0.25em;
	margin-top: 0;
	border-radius: var(--border-radius);
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

.page-links {
	text-align: center;
	margin-top: 25px;
}
.page-links button, .page-links b {
	padding: 0.25em 0.5em;
}
.page-links b {
	color: var(--subtle);
}

.sort-dropdown {
	left: 50px;
}
.sort-dropdown button {
	display: inline-block;
}
.sort-by {
	display: flex;
	align-items: center;
	color: var(--subtle);
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
.sort-by i {
	margin-right: 0.25em;
}
.sort-by:hover {
	color: var(--icolor);
}

/* theme overrides */
.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 25px;
}
</style>