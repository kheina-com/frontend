<template>
	<router-link :to='`/${handle}`' class='profile' v-if='link && !isLoading'>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'><img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'></Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><i :class='iconClass' v-if='verified' :title='`This user is ${verifiedDescription}`'>{{iconName}}</i><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</router-link>
	<div class='profile' v-else>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'><img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'></Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><i :class='iconClass' v-if='verified' :title='`This user is ${verifiedDescription}`'>{{iconName}}</i><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</div>
</template>

<script>
import { getMediaThumbnailUrl } from '@/utilities';
import Loading from '@/components/Loading.vue'

export default {
	name: 'Post',
	props: {
		username: {
			type: String,
			default: 'user name',
		},
		handle: {
			type: String,
			default: 'handle',
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
	components: {
		Loading,
	},
	methods: {
		getMediaThumbnailUrl,
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
