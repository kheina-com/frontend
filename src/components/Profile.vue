<template>
	<a :href='`/${handle}`' class='profile' :title='verifiedDescription' v-if='link && !isLoading' @click.stop.prevent='navigateToUser'>
		<div class='inner'>
			<Loading :isLoading='isLoading || iconLoading' class='image'>
				<UserIcon :handle='handle' :post='icon' v-model:isLoading='iconLoading' class='profile-user-icon'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'>
					<Markdown :content='name' inline lazy/>
				</Loading>
				<Loading :isLoading='isLoading' span class='handle'>
					<p>
						<i :class='iconClass' v-if='verified'>{{iconName}}</i>@{{handle || 'handle'}}
					</p>
				</Loading>
			</div>
		</div>
	</a>
	<div class='profile' :title='verifiedDescription' v-else>
		<div class='inner'>
			<Loading :isLoading='isLoading || iconLoading' class='image'>
				<UserIcon :handle='handle' :post='icon' v-model:isLoading='iconLoading' class='profile-user-icon'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'>
					<Markdown :content='name' inline lazy/>
				</Loading>
				<Loading :isLoading='isLoading' span class='handle'>
					<p>
						<i :class='iconClass' v-if='verified'>{{iconName}}</i>@{{handle || 'handle'}}
					</p>
				</Loading>
			</div>
		</div>
	</div>
</template>

<script>
import Loading from '@/components/Loading.vue';
import UserIcon from '@/components/UserIcon.vue';
import Markdown from '@/components/Markdown.vue';

export default {
	name: 'Post',
	components: {
		Loading,
		UserIcon,
		Markdown,
	},
	props: {
		name: {
			type: String,
			default: 'user name',
		},
		handle: {
			type: String,
			default: null,
		},
		icon: {
			type: String,
			default: null,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		link: {
			type: Boolean,
			default: true,
		},
		verified: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			iconLoading: true,
		};
	},
	computed: {
		iconClass() {
			switch (this.verified) {
				case 'mod' :
					return 'material-icons';
				case 'admin' :
					return 'kheina-icons';
				default :
					return 'material-icons-round';
			}
		},
		iconName() {
			switch (this.verified) {
				case 'mod' :
					return 'verified_user';
				case 'admin' :
					return 'sword';
				default :
					return 'brush';
			}
		},
		verifiedDescription() {
			switch (this.verified) {
				case 'verified' :
				case 'artist' :
					return `@${this.handle} is a verified artist`;
				case 'mod' :
					return `@${this.handle} is a moderator`;
				case 'admin' :
					return `@${this.handle} is an admin`;
				default :
					return `@${this.handle}`;
			}
		},
	},
	methods: {
		navigateToUser() {
			this.$router.push('/' + this.handle);
		},
	},
}
</script>

<style>
.profile-user-icon {
	width: 3em;
	height: 3em;
	border-radius: var(--border-radius);
}
</style>

<style scoped>
.profile {
	display: block;
	margin-right: auto;
	padding: 0.25em 0.5em 0.25em 0.25em;
	margin: -0.25em;
	border-radius: var(--border-radius);
	border-radius: calc(var(--border-radius) + 0.25em) var(--border-radius) var(--border-radius) calc(var(--border-radius) + 0.25em);
}
.profile .inner {
	display: flex;
	align-items: center;
}
.profile .image, img {
	border-radius: var(--border-radius);
}
.profile .image, .profile .image img {
	display: block;
	width: 3em;
	height: 3em;
}
.profile .user {
	display: inline-block;
	margin: 0 0 0 0.5em;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.profile .name {
	font-size: 1.2em;
	margin: 0 0 0.1em;
	display: flex;
	align-items: center;
}
.profile .handle p {
	color: var(--subtle);
	display: flex;
	align-items: center;
}
i {
	display: inline-block;
	font-size: 1em;
	margin-right: 0.25em;
	color: var(--textcolor);
}
i.kheina-icons {
	margin-right: 0.35em;
}
</style>
