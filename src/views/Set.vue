<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<main>
		<button class='interactable edit-button' @click='editToggle' v-if='editable'>
			<i class='material-icons'>{{editing ? 'edit_off' : 'edit'}}</i>
		</button>
		<Loading v-if='editing' class='editing' type='block' :isLoading='pendingUpdate'>
			<div>
				<h2>Title</h2>
				<input class='interactable text' v-model='updateBody.title'>
				<div class='title'>
					<Markdown :content='updateBody.title' inline v-show='updateBody.title'/>
				</div>
			</div>
			<div>
				<h2>Owner</h2>
				<input class='interactable text' v-model='updateBody.owner'>
			</div>
			<div>
				<h2>Privacy</h2>
				<select name='set-privacy' v-model='updateBody.privacy' placeholder='privacy' class='interactable'>
					<option value='public'>public</option>
					<option value='private'>private</option>
				</select>
			</div>
			<div>
				<h2>Description</h2>
				<MarkdownEditor class='markdown-editor' resize='vertical' v-model:value='updateBody.description'/>
			</div>
			<div class='update-button'>
				<Button @click='updateSet' green><i class='material-icons-round'>check</i>Update</Button>
				<Button @click='deleteSet' red><i class='material-icons-outline'>delete</i>Delete</Button>
			</div>
		</Loading>
		<div v-else>
			<Title>
				<Loading :isLoading='!setData' span>
					<Markdown :content='setData?.title || "this set does not exist"' inline lazy/>
				</Loading>
			</Title>
			<div class='set'>
				<div>
					<p class='set-field'>
						<i class='material-icons'>schedule</i>
						<Loading :isLoading='!setData' span>created: <Timestamp class='timestamp' :datetime='setData?.created'/></Loading>
					</p>
					<p class='set-field' v-show='setData?.created !== setData?.updated'>
						<span>(updated: <Timestamp class='timestamp' :datetime='setData?.updated'/>)</span>
					</p>
				</div>
				<div class='privacy' v-show='setData?.privacy !== "public"'>
					<p>{{ setData?.privacy }}</p>
				</div>
				<ShareLink :content='`/s/${setData?.set_id}`' v-show='setData?.privacy === "public"'/>
				<div>
					<Profile :isLoading='isLoading' v-bind='setData?.owner'/>
				</div>
			</div>
			<div class='markdown-block'>
				<Markdown :content='setData?.description'/>
			</div>
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
			<p v-if='posts?.length === 0' style='text-align: center'>No posts found in set <em>{{ setData?.title ?? setId }}</em></p>
			<li v-for='post in posts || sets?.count || 20' v-else-if='tiles'>
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

<script>
import { khatch, saveToHistory, setTitle, createToast } from '@/utilities';
import { postsHost, setsHost, usersHost } from '@/config/constants';
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
import Title from '@/components/Title.vue';
import Timestamp from '@/components/Timestamp.vue';
import ShareLink from '@/components/ShareLink.vue';


const path = '/s/';
export default {
	name: 'Set',
	props: {
		setId: String,
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
		Title,
		Timestamp,
		ShareLink,
	},
	data() {
		return {
			setData: null,
			posts: null,
			editing: null,
			updateBody: { },
			pendingUpdate: false,
			page: null,
			count: null,
			tiles: this.$store.state.searchResultsTiles,
			showMore: false,
			showingMore: false,
			total_results: 0,
		}
	},
	created() {
		this.fetchPosts();

		khatch(`${setsHost}/v1/set/${this.setId}`, {
			errorMessage: 'Could not retrieve set with id: ' + this.setId,
		}).then(response => {
			response.json().then(r => {
				this.setData = r;
				setTitle(`Set: ${r.title} | fuzz.ly`);
			});
		});

		this.$watch(
			() => this.$route.query,
			this.fetchPosts,
		);
	},
	computed: {
		isLoading()
		{ return this.setData === null; },
		tagDescription() {
			if (this.setData === null || !this.setData.description)
			{ return null; }

			const newline = this.setData.description.indexOf('\n', 2);
			if (newline >= 0)
			{
				this.showMore = true;
				return this.setData.description.substring(0, newline);
			}

			return this.setData.description;
		},
		editable() {
			return (this.$store.state.user && this.setData?.owner?.handle === this.$store.state.user?.handle) || Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
		isAdmin() {
			return Boolean(this.$store.state.auth?.scope?.includes('admin'));
		},
	},
	methods: {
		fetchPosts() {
			if (!this.$route.path.startsWith(path))
			{ return; }

			this.page = parseInt(this.$route.query?.page) || 1;
			this.count = parseInt(this.$route.query?.count) || 64;
			this.sort = this.$route.query?.sort || 'old';

			if (window.history.state.posts)
			{
				this.posts = window.history.state.posts;
				this.total_results = window.history.state.total;
				return;
			}

			this.posts = null;

			khatch(`${postsHost}/v1/posts`, {
				errorMessage: 'Could not retrieve posts from set!', 
				method: 'POST',
				body: {
					sort: this.sort,
					tags: ['set:' + this.setId],
					page: this.page,
					count: this.count,
				},
			}).then(response => {
				response.json().then(r => {
					saveToHistory(r)
					this.posts = r.posts;
					this.total_results = r.total;
				});
			});
		},
		editToggle() {
			this.editing = !this.editing;
			if (this.editing)
			{
				this.updateBody.title = this.setData.title;
				this.updateBody.description = this.setData.description;
				this.updateBody.owner = this.setData.owner.handle;
				this.updateBody.privacy = this.setData.privacy
			}
		},
		updateSet() {
			this.pendingUpdate = true;

			const body = { mask: [] };

			if (this.updateBody?.title && this.updateBody.title !== this.setData?.title) {
				body.title = this.updateBody.title;
				body.mask.push('title');
			}

			if (this.updateBody?.owner && this.updateBody.owner !== this.setData?.owner?.handle) {
				body.owner = this.updateBody.owner;
				body.mask.push('owner');
			}

			if (this.updateBody?.description && this.updateBody.description !== this.setData?.description) {
				body.description = this.updateBody.description;
				body.mask.push('description');
			}

			if (this.updateBody?.privacy && this.updateBody.privacy !== this.setData?.privacy) {
				body.privacy = this.updateBody.privacy;
				body.mask.push('privacy');
			}

			if (body.mask.length === 0) {
				this.pendingUpdate = false;
				this.editing = false;
				createToast({
					title: 'Could not update set!',
					description: 'nothing to update.',
				});
				return;
			}

			khatch(`${setsHost}/v1/set/${this.setId}`, {
				errorMessage: 'Could not update set!',
				method: 'PATCH',
				body,
			}).then(() => {
				if (body.hasOwnProperty('owner'))
				{
					khatch(`${usersHost}/v1/user/${body.owner}`, {
						errorMessage: 'Failed to retrieve new set owner.',
					}).then(response => {
						response.json().then(r => {
							this.setData.owner = {
								handle: r.handle,
								name: r.name,
								icon: r.icon,
							};
						});
					});
				}

				this.setData = {
					...this.setData,
					...body,
				};

				if (body.title)
				{ setTitle(`Set: ${body.title} | fuzz.ly`); }
			}).finally(() => {
				this.pendingUpdate = false;
				this.editing = false;
			});
		},
		deleteSet() {
			this.pendingUpdate = true;
			khatch(`${setsHost}/v1/set/${this.setId}`, {
				errorMessage: 'Could not delete set!',
				method: 'DELETE',
			}).then(() => {
				this.setData = { };
			}).finally(() => {
				this.pendingUpdate = false;
				this.editing = false;
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

			return path + this.setId + '?' + query.join('&');
		},
		setPage(page) {
			this.page = page;
			this.$router.push(this.pageLink(page));
		},
	},
	watch: {
		sort() {
			if (this.$route.name !== 'set')
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
.set {
	width: 70vw;
	margin: 0 auto 25px;
	display: flex;
	justify-content: space-between;
}
.set h2, .editing h2 {
	margin: 0;
}
.set-field {
	display: flex;
	align-items: center;
}
.set-field i {
	margin: 0 0.25em 0 0;
}
.timestamp {
	color: var(--textcolor);
}
.markdown-block {
	width: 70vw;
	margin: 0 auto 25px;
}
.markdown-editor {
	background: var(--bg2color);
}
.mobile .markdown-block, .mobile .set {
	width: auto;
}

.editing .title {
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
	display: flex;
	justify-content: center;
}
.update-button > * {
	margin-right: 25px;
}
.update-button > :last-child {
	margin: 0;
}
.update-button button i {
	margin-right: 0.2em;
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

.privacy, .checkbox {
	color: var(--subtle);
}

ul {
	margin: 0 0 0 1em;
	padding: 0;
}

.editing {
	width: 70vw;
	margin: 0 auto 25px;
	display: flex;
	flex-direction: column;
}
.editing h2 {
	margin-left: 25px;
}
.editing > * {
	margin-bottom: 25px;
}
.editing > :last-child {
	margin-bottom: 0;
}

.interactable.text {
	width: 100%;
}

@media only screen and (max-width: 1200px) {
	.set, .editing, .markdown-block {
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
