<template>
	<!-- eslint-disable vue/valid-v-for -->
	<!-- eslint-disable vue/require-v-for-key -->
	<div :class='selfClass'>
		<Loading :isLoading='isBannerLoading' class='banner' v-if='user?.banner || !user'>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
			<router-link :to='`/p/${user?.banner}`' class='banner-link' v-else>
				<i class='material-icons-round' style='display: block'>open_in_new</i>
			</router-link>
			<img :src='banner' ref='bannerImg' @load='isBannerLoading = false'>
		</Loading>
		<div class='banner-missing' v-else>
			<a class='add-image-button' v-if='isEditing' @click='toggleBannerUpload'>
				<i class='material-icons-round'>add_a_photo</i>
			</a>
		</div>
		<main ref='main'>
			<div class='header-bar'>
				<div class='inner'>
					<Loading :isLoading='isIconLoading || !user' class='profile-image'>
						<button class='thumbnail' v-if='isEditing' @click='toggleIconUpload'>
							<div class='add-image-button'>
								<i class='material-icons-round'>add_a_photo</i>
							</div>
							<UserIcon :handle='user?.handle' :post='user?.icon' v-model:isLoading='isIconLoading'/>
						</button>
						<router-link :to='`/p/${user.icon}`' class='thumbnail' v-else-if='user?.icon'>
							<UserIcon :handle='user?.handle' :post='user.icon' v-model:isLoading='isIconLoading'/>
						</router-link>
						<div class='thumbnail' v-else>
							<UserIcon :handle='user?.handle' v-model:isLoading='isIconLoading'/>
						</div>
					</Loading>
					<div class='profile-buttons'>
						<div class='tabs' v-if='!isMobile'>
							<button @click='selectTab' id='posts'>
								Posts
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' id='sets'>
								Sets
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' id='tags'>
								Tags
								<div class='border'/>
							</button>
							<div class='separator'/>
							<button @click='selectTab' id='favs'>
								Favorites
								<div class='border'/>
							</button>
							<div class='separator upload-tab'/>
							<button @click='selectTab' id='uploads' title='this tab is only visible to you' class='upload-tab'>
								<i class='material-icons'>lock</i>
								Uploads
								<div class='border'/>
							</button>
						</div>
						<Button @click='follow' :red='user?.following' class='follow-button' :nested='isMobile'>
							<i class='material-icons'>{{user?.following ? 'person_off' : 'person_add_alt'}}</i>
							<span>{{user?.following ? 'Unfollow' : 'Follow'}}</span>
						</Button>
						<Button class='interactable edit-profile-button' title='Edit profile' @click='toggleEdit(!isEditing)' :nested='isMobile'>
							<i class='material-icons'>{{isEditing ? 'edit_off' : 'edit'}}</i>
							<span>{{isEditing ? 'Cancel' : 'Edit Profile'}}</span>
						</Button>
						<div class='badges'>
							<p class='verified' v-if='user?.verified'>
								<i class='kheina-icons' v-if='user.verified === "admin"' :title='`@${user?.handle} is an admin`'>sword</i>
								<i class='material-icons' v-else-if='user.verified === "mod"' :title='`@${user?.handle} is a moderator`'>verified_user</i>
								<i class='material-icons-round' v-else-if='user.verified === "artist"' :title='`@${user?.handle} is a verified artist`'>verified</i>
								{{user.verified}}	
							</p>
							<p v-for='(badge, i) in badges'>
								<span v-html='badge'></span>
								<button v-if='isEditing' @click='removeBadge(i)'>
									<i class='material-icons'>close</i>
								</button>
							</p>
							<DropDown v-if='isEditing' class='dropdown' :options='availableBadges?.map((badge: Badge): DropDownOption => {
								return { html: emoji(badge.emoji) + badge.label, value: `${badge.label}:${badge.emoji}`, action: () => addBadge(badge) };
							})'>
								<p>
									<i class='material-icons'>add</i>
									Add Badge
								</p>
							</DropDown>
						</div>
					</div>
				</div>
			</div>
			<div class='user-info' v-if='isMobile'>
				<div class='user-field' v-if='isEditing'>
					<i class='material-icons'>public</i>
					<input v-model='update.website' class='interactable text'>
				</div>
				<div class='mobile-fields' v-else>
					<p class='user-field'>
						<i class='material-icons'>schedule</i>
						<Loading :isLoading='!user' span>{{isMobile ? '' : 'Joined '}}<Timestamp :datetime='user?.created'/></Loading>
					</p>
					<p v-if='user?.website' class='user-field website'>
						<i class='material-icons'>public</i>
						<Markdown :content='user?.website' inline/>
					</p>
				</div>
				<div class='user-name'>
					<input v-model='update.name' class='interactable text' v-if='isEditing'>
					<h2 v-else>
						<Markdown :content='user?.name' inline v-if='user'/>
						<Loading span v-else>username</Loading>
						<i class='material-icons' v-if='user?.privacy === "private"' :title="`@${user?.handle}'s account is private`">lock</i>
					</h2>
					<p>
						<Loading :isLoading='!user' class='handle' span>
							<span>@{{user?.handle || 'handle'}}</span>
							<ShareLink :content='`/${user?.handle}`' v-if='user?.privacy !== "private"'/>
						</Loading>
					</p>
				</div>
			</div>
			<div class='user-info' v-else>
				<p class='user-field' v-if='!isEditing'>
					<i class='material-icons'>schedule</i>
					<Loading :isLoading='!user' span>{{isMobile ? '' : 'Joined '}}<Timestamp :datetime='user?.created'/></Loading>
				</p>
				<div class='user-field' v-if='isEditing'>
					<i class='material-icons'>public</i>
					<input v-model='update.website' class='interactable text'>
				</div>
				<p v-else-if='user?.website' class='user-field website'>
					<i class='material-icons'>public</i>
					<Markdown :content='user?.website' inline/>
				</p>
				<div class='user-name'>
					<input v-model='update.name' class='interactable text' v-if='isEditing'>
					<h2 v-else>
						<Markdown :content='user?.name' inline v-if='user'/>
						<Loading span v-else>username</Loading>
						<i class='material-icons' v-if='user?.privacy === "private"' :title="`@${user?.handle}'s account is private`">lock</i>
					</h2>
					<p>
						<Loading :isLoading='!user' class='handle' span>
							<span>@{{user?.handle || 'handle'}}</span>
							<ShareLink :content='`/${user?.handle}`' v-if='user?.privacy !== "private"'/>
						</Loading>
					</p>
				</div>
			</div>
			<MarkdownEditor v-model:value='update.description' class='description' resize='vertical' v-if='isEditing'/>
			<Markdown :content='user?.description' class='description' v-else/>
			<div class='edit-profile-button' v-show='isEditing'>
				<Button class='interactable' title='Edit profile' @click='updateProfile'>
					<i class='material-icons'>done</i>
					<span>Update Profile</span>
				</Button>
			</div>
			<div class='mobile-profile-buttons' v-if='isMobile'>
				<div class='tabs'>
					<button @click='selectTab' id='posts'>
						Posts
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' id='sets'>
						Sets
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' id='tags'>
						Tags
						<div class='border'/>
					</button>
					<div class='separator'/>
					<button @click='selectTab' id='favs'>
						Favs
						<div class='border'/>
					</button>
				</div>
				<div class='tabs upload-tab'>
					<button @click='selectTab' id='uploads' title='this tab is only visible to you'>
						<i class='material-icons'>lock</i>
						Uploads
						<div class='border'/>
					</button>
				</div>
			</div>
			<div class='active-tab'>
				<div v-show='tab === "posts" || tab === "uploads"'>
					<div class='result-buttons'>
						<div>
							<CheckBox
								:border='false'
								id='search-results-tiles'
								name='search-results-tiles'
								class='checkbox'
								v-model:checked='tiles'
								:nested='!isMobile'
							>Tiles</CheckBox>
						</div>
					</div>
					<ol class='results'>
						<p v-if='posts?.length === 0' style='text-align: center'>
							<Markdown :content='user?.name' inline v-if='user?.name'/>
							<span v-else>@{{handle}}</span>
							hasn't made any posts yet.
						</p>
						<li v-for='post in posts || 20' v-else-if='tiles'>
							<PostTile :key='post?.post_id' :postId='post?.post_id' :nested='!isMobile' v-bind='post' link/>
						</li>
						<li v-for='post in posts || 3' v-else>
							<Post :postId='post?.post_id' :nested='!isMobile' v-bind='post' labels/>
						</li>
					</ol>
					<ResultsNavigation :navigate='setPage' :activePage='page' :totalPages='posts?.length ? Math.ceil(total_results / count) : 0' v-if='posts'/>
				</div>
				<div v-show='tab === "sets"'>
					<div class='results'>
						<p v-if='sets === null' style='text-align: center'>loading sets...</p>
						<p v-else-if='sets.length === 0' style='text-align: center'>
								<Markdown :content='user?.name' inline v-if='user?.name'/>
							<span v-else>@{{handle}}</span>
							has no sets.
						</p>
						<Set v-else v-for='set in sets' :nested='isMobile' :setId='set.set_id' v-bind='set'/>
					</div>
				</div>
				<div v-show='tab === "tags"'>
					<div class='results'>
						<p v-if='!userTags' style='text-align: center'>loading tags...</p>
						<p v-else-if='userTags?.length === 0' style='text-align: center'>
							<Markdown :content='user?.name' inline v-if='user?.name'/>
							<span v-else>@{{handle}}</span>
							has no tags.
						</p>
						<ul class='tags' v-else>
							<li v-for='tag in userTags'>
								<Tag :inheritedTags='tag.inherited_tags' :nested='isMobile' v-bind='tag'/>
							</li>
						</ul>
					</div>
				</div>
				<div v-show='tab === "favs"'>
					<p style='text-align: center'>hey, this tab doesn't exist yet.</p>
				</div>
			</div>
			<ThemeMenu/>
		</main>
	</div>
	<div class='image-uploader' v-if='isUploadBanner || isUploadIcon' @mousedown='disableUploads'>
		<div class='cropper' @mousedown.stop v-if='uploadPostId'>
			<div class='image-uploader' v-if='uploadLoading'>
				<Loading type='block'/>
			</div>
			<Cropper
				ref='cropper'
				:src='cropperImage'
				:stencil-props='{
					aspectRatio: isUploadBanner ? 3 : 1,
				}'
			/>
			<div class='button-list'>
				<Button @click.prevent.stop='updateProfileImage'><i class='material-icons'>check</i><span>Set {{isUploadIcon ? 'Icon' : 'Banner'}}</span></Button>
				<Button @click.prevent.stop='disableUploads' red><i class='material-icons'>close</i><span>Cancel</span></Button>
				<Button @click.prevent.stop='showData'><i class='material-icons'>science</i><span>test</span></Button>
			</div>
		</div>
		<div class='upload-window' @mousedown.stop v-else>
			<div class='image-uploader' v-if='uploadLoading'>
				<Loading type='block'/>
			</div>
			<div v-if='!uploadablePosts' style='margin-top: var(--margin); text-align: center'>
				Select an existing post to set as your {{isUploadIcon ? 'profile picture' : 'banner image'}}.
			</div>
			<ol class='results' v-else>
				<li v-for='post in uploadablePosts'>
					<PostTile :postId='post.post_id' :nested='!isMobile' v-bind='post' labels @click='uploadPostId = post.post_id' unlink/>
				</li>
			</ol>
			<ResultsNavigation :navigate='runSearchQuery' :activePage='uploadablePage' :totalPages='uploadablePosts?.length ? Math.ceil(total_results / count) : 0' v-if='uploadablePosts'/>
			<SearchBar v-model:value='searchValue' :func='runSearchQuery'/>
			<a @click.prevent.stop='disableUploads' class='search-close'><i class='material-icons'>close</i></a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRaw, watch, type Ref } from 'vue';
import { useRoute, useRouter, type LocationQuery } from 'vue-router';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { getBannerUrl, getMediaUrl, khatch, saveToHistory, setTitle, tagSplit } from '@/utilities';
import { demarkdown, emoji } from '@/utilities/markdown';
import { isMobile, host, tabs } from '@/config/constants';
import store from '@/globals';
import Button from '@/components/Button.vue';
import Loading from '@/components/Loading.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import UserIcon from '@/components/UserIcon.vue';
import Markdown from '@/components/Markdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Post from '@/components/Post.vue';
import PostTile from '@/components/PostTile.vue';
import Tag from '@/components/Tag.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import SearchBar from '@/components/SearchBar.vue';
import ResultsNavigation from '@/components/ResultsNavigation.vue';
import DropDown, { type DropDownOption } from '@/components/DropDown.vue';
import CheckBox from '@/components/CheckBox.vue';
import ShareLink from '@/components/ShareLink.vue';
import Set from '@/components/Set.vue';

const globals = store();
const route = useRoute();
const router = useRouter();
const path = route.path;

const props = defineProps<{ handle: string }>();
const main = ref<HTMLDivElement | null>(null) as Ref<HTMLDivElement>;
const cropper = ref<typeof Cropper | null>(null) as Ref<typeof Cropper>;

const tiles: Ref<boolean> = ref(globals.tiles);
const user: Ref<FullUser | null> = ref(null);
const posts: Ref<any[] | null> = ref(null);
const sets: Ref<PostSet[] | null> = ref(null);
const userTags: Ref<Tag[] | null> = ref(null);

const isIconLoading: Ref<boolean> = ref(true);
const isBannerLoading: Ref<boolean> = ref(true);
const isEditing: Ref<boolean> = ref(false);
const isUploadIcon: Ref<boolean> = ref(false);
const isUploadBanner: Ref<boolean> = ref(false);
const uploadPostId: Ref<string | null> = ref(null);
const uploadablePosts: Ref<any[] | null> = ref(null);
const uploadablePage: Ref<number> = ref(1);
const searchValue: Ref<string | null> = ref(null);
const cropperImage: Ref<string | null> = ref(null);
const uploadLoading: Ref<boolean | null> = ref(null);
const tab: Ref<string | undefined> = ref(undefined);
const update: Ref<any | null> = ref(null);
const count: Ref<number> = ref(64);
const page: Ref<number> = ref(1);
const bannerWebpFailed: Ref<boolean | null> = ref(null);
const availableBadges: Ref<Badge[] | null> = ref(null);
const total_results: Ref<number> = ref(0);

const badges: Ref<string[]> = ref([]);

let tabElement: HTMLElement | null = null;

if (tabs.has(route.query?.tab?.toString())) {
	tab.value = route.query.tab?.toString();
}
else {
	router.replace(route.path + '?tab=posts');
}

const setUserTitle = (u?: User | null) => {
	if (u?.name) {
		demarkdown(u.name)
		.then(title => {
			setTitle(`${title} (@${u.handle}) | fuzz.ly`)
		});
	}
	else {
		setTitle(`@${props.handle} | fuzz.ly`);
	}
}

const setBadges = () => {
	if (!user.value) return badges.value = [];
	badges.value = user.value.badges.map(badge => emoji(badge.emoji) + badge.label);
}

if (window.history.state.user) {
	user.value = window.history.state.user as FullUser;
	setBadges();
	setUserTitle(user.value);
}
else {
	khatch(`${host}/v1/user/${props.handle}`, {
		handleError: true,
	}).then(r => r.json())
	.then(r => {
		user.value = r as FullUser;
		setBadges();
		setUserTitle(user.value);
		saveToHistory({ user: toRaw(user.value) });
		router.replace(route.fullPath.replace(props.handle, user.value.handle));
	})
	.catch(() => { });
}

onMounted(() => {
	if (route.query?.edit)
	{ toggleEdit(true); }

	fetchData();
	window.addEventListener("scroll", scrollBanner);
});

onUnmounted(() => {
	window.removeEventListener("scroll", scrollBanner);
});

const selfClass = computed(() => {
	return (globals.user && globals.user?.handle === user.value?.handle) ? 'self' : 'selfless';
});

const banner = computed(() => {
	if (!user.value?.banner) return undefined;

	if (bannerWebpFailed)
	{ return getBannerUrl(user.value.banner, user.value.handle, 'jpg'); }
	return getBannerUrl(user.value.banner, user.value.handle);
});

const bannerImg = ref<HTMLImageElement | null>(null);
function scrollBanner(): void {
	if (!bannerImg.value) return;
	bannerImg.value.style.top = (window.scrollY / 2) + "px";
}

function addBadge(badge: Badge) {
	console.log('adding', badge);
	khatch(`${host}/v1/user/badge`, {
		method: 'PUT',
		errorMessage: 'Failed to add badge.',
		body: badge,
	})
	.then(() => {
		if (!user.value) return;
		user.value.badges.push(badge);
		badges.value.push(emoji(badge.emoji) + badge.label);
		saveToHistory({ user: toRaw(user.value) });
	})
	.catch(() => { });
}

function removeBadge(badge: number) {
	if (!user.value) return;
	khatch(`${host}/v1/user/badge`, {
		method: 'DELETE',
		errorMessage: 'Failed to remove badge.',
		body: user.value.badges[badge],
	})
	.then(() => {
		if (!user.value) return;
		user.value.badges.splice(badge, 1);
		badges.value.splice(badge, 1);
		saveToHistory({ user: toRaw(user.value) });
	})
	.catch(() => { });
}

function selectTab(event: Event) {
	tab.value = (event.target as HTMLDivElement).id;
	router.push(pageLink(1));
}

function follow() {
	khatch(`${host}/v1/user/${user.value?.handle}/follow`, {
		method: user.value?.following ? 'DELETE' : 'PUT',
		errorMessage: `Failed to ${user.value?.following ? 'unfollow' : 'follow'} user`,
	})
	.then(() => {
		if (!user.value) return;
		user.value.following = !user.value?.following;
		saveToHistory({ user: toRaw(user.value) });
	}).catch(() => { });
}

function fetchData(query: LocationQuery | null = null) {
	if (route.path !== path) return;

	tab.value = query?.tab?.toString() || tab.value;
	if (!tab.value) return;

	if (tabElement) (tabElement.lastChild as HTMLDivElement).style.borderBottomWidth = '0';

	tabElement = document.getElementById(tab.value);
	((tabElement as HTMLElement).lastChild as HTMLDivElement).style.borderBottomWidth = '5px';

	switch (tab.value) {
	case 'posts' :
		total_results.value = 0;
		page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
		count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;

		if (window.history.state.posts) {
			posts.value = window.history.state.posts;
			total_results.value = window.history.state.total;
			return;
		}

		posts.value = null;

		khatch(`${host}/v1/posts`, {
			handleError: true,
			method: 'POST',
			body: {
				page: page.value,
				count: count.value,
				sort: 'new',
				tags: [`@${props.handle}`]
			},
		}).then(r => r.json())
		.then(r => {
			saveToHistory(r);
			total_results.value = r.total;
			posts.value = r.posts;
		})
		.catch(() => { });
		break;

	case 'sets' :
		if (sets.value) return;

		khatch(`${host}/v1/sets/user/${props.handle}`, {
			errorMessage: 'Failed to Retrieve User sets!',
			errorHandlers: { 404: () => sets.value = [] },
		}).then(r => r.json())
		.then(r => sets.value = r)
		.catch(() => { });
		break;

	case 'tags' :
		if (userTags.value) return;

		khatch(`${host}/v1/tags/user/${props.handle}`, {
			errorMessage: 'Failed to Retrieve User tags!',
			errorHandlers: { 404: () => userTags.value = [] },
		}).then(r => r.json())
		.then(r => userTags.value = r)
		.catch(() => { });
		break;

	case 'favs' :
		// nothing, yet
		break;

	case 'uploads' :
		page.value = route.query?.page ? parseInt(route.query.page.toString()) : page.value || 1;
		count.value = route.query?.count ? parseInt(route.query.count.toString()) : count.value || 64;

		if (window.history.state.uploads) {
			posts.value = window.history.state.uploads;
			return;
		}

		posts.value = null;

		khatch(`${host}/v1/posts/mine`, {
			handleError: true,
			method: 'POST',
			body: {
				sort: 'hot',
				page: page.value,
				count: count.value,
			},
		}).then(r => r.json())
		.then(r => {
			saveToHistory({ uploads: r });
			posts.value = r;
		});
		break;
	}
}

function toggleEdit(editing: boolean) {
	isEditing.value = editing;
	if (editing) {
		update.value = {
			name: user.value?.name,
			website: user.value?.website,
			description: user.value?.description,
		};

		if (!availableBadges.value) {
			khatch(`${host}/v1/users/badges`, {
				method: 'GET',
				errorMessage: 'Failed to fetch available badges',
			}).then(r => r.json())
			.then(response => availableBadges.value = response);
		}
	}
}

function updateProfile() {
	// name: str = None
	// privacy: UserPrivacy = None
	// icon: str = None
	// website: str = None
	// description: str = None

	khatch(`${host}/v1/user/self`, {
		method: 'PATCH',
		body: update.value,
		handleError: true,
	}).then(() => {
		user.value = Object.assign(user.value as object, update.value) as unknown as FullUser;
		isEditing.value = false;
		saveToHistory({ user: toRaw(user.value) });
	});
}

function toggleIconUpload() {
	isUploadIcon.value = true;
	runSearchQuery();
	document.body.style.overflow = 'hidden';
}

function toggleBannerUpload() {
	isUploadBanner.value = true;
	runSearchQuery();
	document.body.style.overflow = 'hidden';
}

function disableUploads() {
	isUploadBanner.value = isUploadIcon.value = false;
	uploadLoading.value = cropperImage.value = uploadablePosts.value = uploadPostId.value = null;
	document.body.style.overflow = "";
}

function showData() {
	const results = cropper.value.getResult();
	console.log({
		post_id: uploadPostId.value,
		coordinates: results.coordinates,
		transformation: results.imageTransforms,
	});
}

function updateProfileImage() {
	uploadLoading.value = true;
	let endpoint = null;

	if (isUploadIcon.value)
	{ endpoint = 'set_icon'; }

	else if (isUploadBanner.value)
	{ endpoint = 'set_banner'; }

	khatch(`${host}/v1/upload/${endpoint}`, {
		errorMessage: 'Failed to update user image!',
		method: 'POST',
		body: {
			post_id: uploadPostId.value,
			coordinates: cropper.value.getResult().coordinates,
		},
	}).then(() => {
		if (!user.value) return;

		if (isUploadIcon.value) {
			user.value.icon = uploadPostId.value;
			globals.user.icon = uploadPostId.value;
		}
		else if (isUploadBanner.value) {
			user.value.banner = uploadPostId.value;
		}
		saveToHistory({ user: toRaw(user.value) });
	}).finally(disableUploads);
}

function runSearchQuery(p: number | null = null) {
	// TODO: old line: uploadablePosts = 0;
	uploadablePosts.value = null;
	uploadLoading.value = true;
	uploadablePage.value = p || 1;
	if (searchValue.value) {
		khatch(`${host}/v1/posts`, {
			errorMessage: 'Failed to fetch posts for profile.',
			method: 'POST',
			body: {
				sort: 'new',
				tags: tagSplit(searchValue.value),
				page: uploadablePage.value,
				count: 64,
			},
		}).then(r => r.json())
		.then(r => {
			total_results.value = r.total;
			uploadablePosts.value = r.posts;
			uploadLoading.value = null;
		}).catch(disableUploads);
	}
	else {
		khatch(`${host}/v1/posts/user`, {
			errorMessage: 'Failed to fetch posts for profile.',
			method: 'POST',
			body: {
				handle: props.handle,
				page: uploadablePage.value,
				count: 64,
			},
		}).then(r => r.json())
		.then(r => {
			total_results.value = r.total;
			uploadablePosts.value = r.posts;
			uploadLoading.value = null;
		}).catch(disableUploads);
	}
}

function pageLink(p: number) {
	let query = [];

	if (tab.value)
	{ query.push(`tab=${tab.value}`); }

	if (p !== 1)
	{ query.push(`page=${p}`); }

	if (count.value !== 64)
	{ query.push(`count=${count.value}`); }

	return '/' + user.value?.handle + '?' + query.join('&');
}

function setPage(p: number) {
	page.value = p;
	router.push(pageLink(page.value));
}

watch(() => route.query, fetchData);
watch(tiles, globals.searchResultsTiles);
watch(uploadPostId, (value: string | null) => {
	if (!value) return;

	khatch(`${host}/v1/post/${value}`, {
		errorMessage: 'Failed to fetch post for profile.',
	}).then(r => r.json())
	.then(r => {
		cropperImage.value = getMediaUrl(r.post_id, r.filename);
	});
});
</script>

<style>
.user-name h2 .markdown.inline p {
	white-space: nowrap !important;
}
</style>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: 0 var(--margin) var(--margin);
	margin: 0 auto;
}

.user-name {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.user-name h2 {
	margin: 0;
	display: flex;
	align-items: center;
	text-align: right;
	position: absolute;
	top: -1.3em;
}
.user-name h2 i {
	font-size: 1em;
	margin-left: 0.25em;
}
.mobile .user-name h2 {
	position: initial;
}

.mobile-fields {
	display: flex;
	flex-direction: column-reverse;
	justify-content: space-around;
}

.user-field {
	display: flex;
	align-items: center;
}
.user-field span button {
	color: var(--textcolor);
}
.user-field span button:hover {
	color: var(--interact);
}
.user-field.website {
	word-break: break-all;
}

.profile-image {
	display: inline-block;
	position: absolute;
	border-radius: 5px;
	border: solid 3px var(--bordercolor);
	background: var(--bg2color);
	overflow: hidden;
	top: calc(-6.25em - 3px);
}
.mobile .profile-image {
	top: calc(-4em - 3px);
	/* margin-bottom: -3.875em;
	width: auto; */
}
.thumbnail {
	display: flex;
	position: relative;
}
.thumbnail, .thumbnail img, .thumbnail video {
	width: 12.5em;
	height: 12.5em;
}
.mobile .thumbnail, .mobile .thumbnail img, .mobile .thumbnail video {
	width: 8em;
	height: 8em;
}

.banner, .banner-missing {
	top: 0;
	position: relative;
}

.banner {
	height: 33.33333vw;
	height: calc(100vw / 3);
	max-height: 75vh;
	width: 100%;
	overflow: hidden;
	background-size: cover;
	background-position: center;
}
.banner img {
	object-fit: cover;
	min-width: 100%;
	min-height: 100%;
	width: 100%;
	position: relative;
}
.banner-link {
	position: absolute;
	right: 1em;
	bottom: 1em;
	border-radius: 50%;
	overflow: hidden;
	color: var(--notification-text);
}
.banner-link i {
	background: var(--screen-cover);
	padding: 0.5em;
}
.mobile .banner-link {
	right: 0;
	bottom: 0;
	padding: 1em;
	border-radius: initial;
}
.mobile .banner-link i {
	border-radius: 50%;
	font-size: 1.5em;
}

.banner-missing {
	height: calc(6.25em + 28px);
}
.mobile .banner-missing {
	height: calc(4em + 28px);
}


.handle {
	display: flex;
	align-items: center;
}

.handle span {
	margin-right: 0.25em;
}

.edit-profile-button {
	display: none;
}

.self .edit-profile-button {
	display: inherit;
}

.edit-profile-button div {
	text-align: center;
}
.edit-profile-button button {
	margin: 0 auto var(--margin);
}
.edit-profile-button p {
	text-align: center;
}
.edit-profile-button div button {
	display: flex inline;
	margin: var(--margin) var(--half-margin);
}
.user-field i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}
.results > * {
	margin: 0 0 var(--margin);
}
.results > :last-child {
	margin-bottom: 0;
}

ul, ol {
	list-style: none;
	margin: 0;
	padding: 0;
}

.tiles ol {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	margin: var(--neg-half-margin);
}
.tiles ol li {
	margin: var(--half-margin);
}
.tiles ol.results > :last-child {
	margin-bottom: var(--half-margin);
}

.checkbox {
	color: var(--subtle);
}

.page-links {
	margin-top: var(--margin);
}

.header-bar {
	position: relative;
	padding: 0 var(--margin);
	width: 100%;
	background: var(--bg2color);
	border-bottom: var(--border-size) solid var(--bordercolor);
	left: var(--neg-margin);
	right: var(--neg-margin);
	margin-bottom: 3em;
}
.mobile .header-bar {
	background: none;
	border-bottom: none;
	min-height: 1.75em;
	min-height: calc(1.5em + 3px);
	margin-bottom: 1em;
}

.header-bar .inner {
	width: 70vw;
	margin: auto;
}
.mobile .header-bar .inner {
	width: auto;
}

.profile-buttons {
	position: relative;
	display: flex;
	justify-content: space-between;
	width: calc(100% - 12.5em - 6px);
	align-items: center;
	left: calc(12.5em + 6px);
}
.mobile .profile-buttons {
	left: calc(8em + 6px);
	width: calc(100% - 8em - 6px);
	align-items: flex-start;
	padding-top: var(--margin);
}

.mobile .profile-buttons {
	flex-flow: row-reverse;
}

.mobile .badges {
	flex-flow: column;
}

.mobile .badges {
	position: relative;
}

.mobile .badges > p {
	margin-left: var(--margin);
}

.mobile .badges > p:first-child {
	margin-top: 0;
}

.self .follow-button {
	display: none;
}

.selfless .upload-tab {
	display: none;
}

.self .upload-tab {
	display: flex;
	justify-content: center;
}

.self .upload-tab i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
	pointer-events: none;
}


.mobile-profile-buttons {
	position: relative;
	margin: 0 var(--neg-margin) var(--margin);
	display: flex;
	flex-direction: column;
	align-items: center;
	background: var(--bg2color);
}

.mobile .active-tab {
	background: var(--bg2color);
	margin: var(--neg-margin);
	padding: var(--margin);
}


.tabs {
	display: flex;
}
.mobile .tabs {
	border-bottom: var(--border-size) solid var(--bordercolor);
	width: 100%;
	justify-content: center;
}
.tabs button {
	padding: 20px var(--margin);
	position: relative;
	flex: 1;
}
.mobile .tabs button {
	padding: 1em 0;
}
.tabs .separator {
	background: var(--bordercolor);
	width: var(--border-size);
}
.tabs .border {
	position: absolute;
	width: 100%;
	left: 0;
	bottom: 0;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	border-bottom: solid 0 var(--interact);
}

.user-info {
	width: 70vw;
	margin: 0 auto var(--margin);
	display: flex;
	justify-content: space-between;
	position: relative;
}
.mobile .user-info {
	width: auto;
}

.description {
	margin: 0 auto var(--margin);
	width: 70vw;
}
.mobile .description {
	width: auto;
}

@media only screen and (max-width: 1200px) {
	.user, .description, .user-info, .header-bar .inner {
		width: auto;
	}
}

ol li {
	margin: 0 0 var(--margin);
}
ol > :last-child {
	margin-bottom: 0;
}

.tags li {
	display: block;
	margin: 0 0 var(--margin);
}
.tags > :last-child {
	margin-bottom: 0;
}

/* ===== editing ===== */
.add-image-button {
	background: var(--screen-cover);
	width: 100%;
	height: 100%;
	position: absolute;
	display: flex;
	justify-content: center;
	align-items: center;
}
.add-image-button i {
	color: var(--bright);
	font-size: 70px;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.add-image-button:hover i {
	color: var(--interact);
}
.image-uploader {
	background: var(--screen-cover);
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	display: flex;
	justify-content: center;
	align-items: center;
}
.upload-window, .cropper {
	background: var(--bg1color);
	padding: var(--margin);
	border-radius: var(--border-radius);
	border: var(--border-size) solid var(--bordercolor);
}
.image-uploader .button-list {
	margin-top: 0.5em;
	display: flex;
	justify-content: center;
}
.image-uploader .button-list button {
	margin-right: var(--margin);
}
.image-uploader .button-list > :last-child {
	margin-right: 0;
}
.vue-advanced-cropper {
	height: 80vmin;
	width: 80vmin;
	height: calc(80vmin - 1.7em);
}
.upload-window {
	height: 80vmin;
	width: 80vmin;
	height: calc(100vh - 102px);
	width: calc(100vw - 102px);
	overflow: auto;
	position: relative;
}
.upload-window .results {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	padding-top: 2.5em;
}
.upload-window ol.results li {
	list-style: none;
	margin: 0 var(--half-margin) var(--margin);
}
.upload-window .page-links {
	margin-top: 0;
}
.search-close {
	position: fixed;
	top: var(--margin);
	right: var(--margin);
	margin: var(--margin);
}
.search-close:hover {
	color: var(--error) !important;
}
.mobile .search-close {
	margin: 0;
}
.mobile .search-close i {
	font-size: 1.5em;
	padding: var(--margin);
	background: var(--bg1color);
	border-radius: 50%;
}
.mobile .upload-window .results {
	padding-top: 4em;
}

.search-bar {
	position: fixed;
	width: calc(100% - 100px - var(--border-size) * 2);
	top: 50px;
	top: calc(40px + var(--border-size));
}

/* THEME OVERRIDES */
html.e621 .header-bar {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
	margin-top: 0.82em;
}

html.wikipedia .badges p, html.high-contrast-dark .badges p {
	border: solid var(--border-size) var(--bordercolor);
}

html.solarized-dark .badges img.emoji {
	filter: saturate(0.625);
}

html.solarized-light .badges img.emoji {
	filter: sepia(0.375);
}

/* ACCENT OVERRIDES */
html.desktop.aurora main, html.desktop.hex main, html.desktop.space main, html.desktop.stars main {
	background-position-y: calc(1em + 40px);
}

html.desktop.winter main {
	background-position-y: bottom, calc(1em + 40px);
}

html.desktop.spring main {
	background-position-y: bottom, bottom, calc(1em + 40px), calc(1em + 40px);
}

html.mobile.autumn .active-tab {
	background-image: url(/assets/themes/autumn.png);
	background-repeat: repeat-x;
	background-position: center bottom;
}

html.mobile.spring .active-tab {
	background-image: url(/assets/themes/spring/1.png), url(/assets/themes/spring/2.png);
	background-repeat: repeat-x, no-repeat, no-repeat, repeat-x;
	background-position: center bottom, right bottom;
}

html.mobile.winter .active-tab {
	background-image: url(/assets/themes/winter/1.png);
	background-repeat: repeat-x;
	background-position: center bottom;
}
</style>

<style>
.badges {
	position: absolute;
	top: 100%;
	display: flex;
	flex-flow: wrap;
}
.badges > p, .badges > button, .badges .dropdown button, .badges .dropdown {
	margin: 0.5em 0 0 0.5em;
}
.badges p, .badges button, .badges .dropdown button {
	padding: 0.25em 0.5em;
	background: var(--bg2color);
	border-radius: var(--border-radius);
}
.badges p, .badges p span, .badges button, .badges .dropdown button {
	display: flex;
	align-items: center;
}
.badges p i, .badges p img, .badges button img {
	margin-right: 0.35em;
}
.badges p img, .badges button img {
	max-height: 1em;
	border-radius: var(--border-radius);
	font-size: 1.1em;
}
.badges p i {
	font-size: 1.25em;
}
.badges button {
	margin: 0 0 0 0.35em;
}
.badges button i {
	margin: 0;
	display: block;
}
.badges p button:hover {
	color: var(--error);
}
.badges .dropdown-menu button, .badges .dropdown button p, .badges .dropdown-menu button p, .badges .dropdown button {
	margin: 0;
}
.badges .dropdown button p, .badges p button {
	padding: 0;
}

.result-buttons {
	display: flex;
	justify-content: end;
}
.result-buttons button {
	color: var(--subtle);
	margin-right: var(--margin);
}
.result-buttons button:hover {
	color: var(--interact);
}
</style>