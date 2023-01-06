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
					<input class='interactable text' v-model='updateBody.tag_class'>
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
			<router-link style='position: relative; right: 25px; font-size: 0.9em; text-decoration: none; display: block; text-align: right' to='/md'>markdown guide</router-link>
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
		<Button @click='updateTag' green v-if='editing' class='update-button'><i class='material-icons-round'>check</i>Update</Button>
		<div class='markdown-block' v-else>
			<Markdown :content='showingMore ? tagData.description : tagDescription'/>
			<button v-show='showMore && !showingMore' class='show-more' @click='showingMore=true'>show more</button>
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
				<PostTile :postId='post?.post_id' :nested='true' v-bind='post' link/>
			</li>
			<li v-for='post in posts || 3' v-else>
				<Post :postId='post?.post_id' :nested='true' v-bind='post' labels/>
			</li>
		</ol>
		<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length >= count ? 10000 : 0' v-if='posts'/>
		<ThemeMenu/>
	</main>
</template>

<script>
import { ref } from 'vue';
import { khatch, saveToHistory, setTitle } from '@/utilities';
import { apiErrorMessage, postsHost, tagsHost, usersHost } from '@/config/constants';
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


export default {
	name: 'Tag',
	props: {
		tag: String,
	},
	components: {
		ThemeMenu,
		Loading,
		Post,
		Profile,
		Button,
		Markdown,
		MarkdownEditor,
		DropDown,
		ResultsNavigation,
		CheckBox,
		PostTile,
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
			editing: null,
			updateBody: { },
			pendingUpdate: false,
			sort: null,
			page: null,
			count: null,
			tiles: this.$store.state.searchResultsTiles,
			showMore: false,
			showingMore: false,
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
						setTitle(`${r.tag}, ${r.group} tag | fuzz.ly`);
					}
					else if (response.status === 400)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 401)
					{ this.$store.commit('error', r.error); }
					else if (response.status === 404)
					{ this.$store.commit('error', r.error); }
					else
					{ this.$store.commit('error', apiErrorMessage, r); }

				});
			})
			.catch(error => {
				this.$store.commit('error', apiErrorMessage, error);
				console.error(error);
			});

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
	},
	computed: {
		isLoading()
		{ return this.tagData === null; },
		tagDescription() {
			if (this.tagData === null || !this.tagData.description)
			{ return null; }

			const newline = this.tagData.description.indexOf('\n');
			if (newline >= 0)
			{
				this.showMore = true;
				return this.tagData.description.substring(0, newline);
			}

			return this.tagData.description;
		},
		editable() {
			return (this.$store.state.user && this.tagData?.owner?.handle === this.$store.state.user?.handle) || Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
		isAdmin() {
			return Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
	},
	methods: {
		fetchPosts() {
			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;
			this.sort = this.$route.query?.sort || 'hot';

			if (window.history.state.posts)
			{
				this.posts = window.history.state.posts;
				return;
			}

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
							saveToHistory({ posts: r })
							this.posts = r;
						}
						else if (response.status === 400)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 401)
						{ this.$store.commit('error', r.error); }
						else if (response.status === 404)
						{ this.$store.commit('error', r.error); }
						else
						{ this.$store.commit('error', apiErrorMessage, r); }

					});
				})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
		},
		editToggle() {
			this.editing = !this.editing;
			if (this.editing)
			{
				this.updateBody.name = this.tag;
				this.updateBody.tag_class = this.tagData.group;
				this.updateBody.description = this.tagData.description;
				this.updateBody.owner = this.tagData.owner?.handle;
			}
		},
		removeInheritance(tag_to_remove) {
			khatch(`${tagsHost}/v1/remove_inheritance`, {
				method: 'POST',
				errorMessage: 'Could not remove inherited tag.',
				body: {
					parent_tag: this.tag,
					child_tag: tag_to_remove,
				},
			})
			.then(response => {
				this.tagData.inherited_tags.splice(this.tagData.inherited_tags.indexOf(tag_to_remove), 1);
			})
			.catch(() => { });
		},
		updateTag() {
			this.pendingUpdate = true;

			let body = { tag: this.tag };

			if (this.updateBody?.name && this.updateBody.name !== this.tag)
			{ body.name = this.updateBody.name; }

			if (this.updateBody?.tag_class && this.updateBody.tag_class !== this.tagData?.group)
			{ body.tag_class = this.updateBody.tag_class; }

			if (this.updateBody?.owner && this.updateBody.owner !== this.tagData?.owner?.handle)
			{ body.owner = this.updateBody.owner; }

			if (this.updateBody?.description && this.updateBody.description !== this.tagData?.description)
			{ body.description = this.updateBody.description; }

			khatch(`${tagsHost}/v1/update_tag`, {
					method: 'POST',
					body,
				})
				.then(response => {
					if (response.status < 400)
					{
						if (body.name)
						{
							this.$router.push('/t/' + body.name);
							return;
						}
						this.tagData.group = body?.tag_class ?? this.tagData?.group;
						this.tagData.description = body?.description ?? this.tagData?.description;

						if (body.hasOwnProperty('owner'))
						{
							if (!body.owner)
							{ this.tagData.owner = null; }
							else
							{
								khatch(`${usersHost}/v1/fetch_user/${body.owner}`, {
									errorMessage: 'Failed to retrieve new tag owner.',
								}).then(response => {
									response.json().then(r => {
										this.tagData.owner = {
											handle: r.handle,
											name: r.name,
											icon: r.icon,
										};
									});
								}).catch(() => { });
							}
						}

						this.pendingUpdate = false;
						this.editing = false;
					}
					else 
					{
						response.json().then(r => {
							if (response.status === 400)
							{ this.$store.commit('error', r.error); }
							else if (response.status === 401)
							{ this.$store.commit('error', r.error); }
							else if (response.status === 404)
							{ this.$store.commit('error', r.error); }
							else
							{ this.$store.commit('error', apiErrorMessage, r); }
						});
					}
				})
				.catch(error => {
					this.$store.commit('error', apiErrorMessage, error);
					console.error(error);
				});
		},
		pageLink(page) {
			let query = [];

			if (page !== 1)
			{ query.push(`page=${page}`); }

			if (this.count !== 64)
			{ query.push(`count=${this.count}`); }

			if (this.sort !== 'hot')
			{ query.push(`sort=${this.sort}`); }

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
		tiles(value) {
			this.$store.commit('searchResultsTiles', value);
		},
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: 25px;
	display: block;
}
h2 {
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
	padding-left: 25px;
}
.tag {
	width: 70vw;
	margin: 0 auto 25px;
	display: flex;
	justify-content: space-between;
}
.markdown-block {
	width: 70vw;
	margin: 0 auto 25px;
}
.markdown-editor {
	background: var(--bg2color);
	margin-bottom: 25px;
}
.mobile .markdown-block, .mobile .tag {
	width: auto;
}
.show-more {
	margin-top: 1em;
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

.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: -12.5px;
}
.tiles ol li {
	margin: 12.5px;
}

.page-links {
	margin-top: 25px;
}

.buttons {
	margin: 0 25px;
	display: flex;
	justify-content: space-between;
}
.buttons button {
	color: var(--subtle);
	margin-right: 25px;
}
.buttons button:hover {
	color: var(--icolor);
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
	color: var(--icolor);
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
	margin-left: 25px;
}

.mobile .tag .interactable.text {
	width: 100%;
}

@media only screen and (max-width: 1000px) {
	.tag {
		margin: 0 0 25px;
		width: auto;
	}
}

/* theme overrides */
html.midnight main {
	/* --bg2color: var(--bg1color); */
	--bg1color: var(--bg0color);
	background: #0000;
	padding: 0 25px;
}

html.e621 .subject {
	color: var(--green);
}

html.e621 .sponsor {
	color: var(--violet);
}
</style>
