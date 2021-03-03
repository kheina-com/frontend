<template>
	<router-link :to='`/${handle}`' class='profile' v-if='link && !isLoading'>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'><img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'></Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</router-link>
	<div class='profile' v-else>
		<div class='inner'>
			<Loading :isLoading='isLoading' class='image'><img :src='getMediaThumbnailUrl("nNSsjrxI", 400)'></Loading>
			<div class='user'>
				<Loading :isLoading='isLoading' span class='name'><p>{{username}}</p></Loading>
				<Loading :isLoading='isLoading' span class='handle'><p>@{{handle}}</p></Loading>
			</div>
		</div>
	</div>
</template>

<script>
import { getMediaThumbnailUrl } from '../utilities';
import Loading from './Loading.vue'

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
		}
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
	display: inline-block;
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
	width: 3em;
	height: 3em;
}
.profile .user {
	display: inline-block;
	margin: 0 0 0 0.5em;
	display: flex;
	flex-direction: column;
	align-items: start;
}
.profile .name {
	font-size: 1.3em;
	margin: 0 0 0.1em;
}
.profile .handle {
	color: var(--subtlecolor);
}
</style>
