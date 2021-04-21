<template>
	<a :href='`/${handle}`' class='profile' v-if='link && !isLoading' @click.stop='navigateToUser'>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'>
				<Thumbnail :post='icon || "_V-EGBtH"' :size='400'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><i :class='iconClass' v-if='verified' :title='`This user is ${verifiedDescription}`'>{{iconName}}</i><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</a>
	<div class='profile' v-else>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'>
				<Thumbnail :post='icon || "_V-EGBtH"' :size='400'/>
			</Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><i :class='iconClass' v-if='verified' :title='`This user is ${verifiedDescription}`'>{{iconName}}</i><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</div>
</template>

<script>
import Loading from '@/components/Loading.vue'
import Thumbnail from '@/components/Thumbnail.vue';

export default {
	name: 'Post',
	components: {
		Loading,
		Thumbnail,
	},
	props: {
		username: {
			type: String,
			default: 'user name',
		},
		handle: {
			type: String,
			default: 'handle',
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
	computed: {
		iconClass() {
			return this.verified === 'admin' ? 'kheina-icons' : 'material-icons';
		},
		iconName() {
			switch (this.verified) {
				case 'mod' :
					return 'verified_user';
				case 'admin' :
					return 'sword';
				default :
					return 'verified';
			}
		},
		verifiedDescription() {
			switch (this.verified) {
				case 'mod' :
					return 'a moderator';
				case 'admin' :
					return 'an admin';
				default :
					return 'a verified artist';
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

<style scoped>
.profile {
	display: block;
	margin-right: auto;
}
.profile .inner {
	display: flex;
	align-items: center;
}
.profile .image, img {
	border-radius: 3px;
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
	font-size: 1.3em;
	margin: 0 0 0.1em;
	display: flex;
	align-items: center;
}
.profile .handle {
	color: var(--subtlecolor);
}
i {
	display: inline-block;
	font-size: 1em;
	margin-right: 0.25em;
}
</style>
