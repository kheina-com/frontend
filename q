[33mcommit 8e9f9c3f6a0c810df41bc661ec46fe5bd9555e00[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m)[m
Author: kheina <vixen@kheina.com>
Date:   Sat Apr 17 10:18:22 2021 -0400

    fix post tags

[1mdiff --git a/src/components/Post.vue b/src/components/Post.vue[m
[1mindex dda1303..269c39e 100644[m
[1m--- a/src/components/Post.vue[m
[1m+++ b/src/components/Post.vue[m
[36m@@ -23,7 +23,7 @@[m
 			</div>[m
 		</div>[m
 		<Markdown v-else-if='description' :content='description' :concise='concise' />[m
[31m-		<Thumbnail :post='postId' :size='1200' style='margin-bottom: 25px' v-if='!isText'/>[m
[32m+[m		[32m<Thumbnail :post='postId' :size='1200' style='margin-bottom: 25px' v-if='hasMedia'/>[m
 		<Loading :isLoading='isLoading' class='date' v-if='created || isLoading'>[m
 			<Subtitle static='left' v-if='isUpdated'>posted <Timestamp :datetime='created'/> (edited <Timestamp :datetime='updated'/>)</Subtitle>[m
 			<Subtitle static='left' v-else>posted <Timestamp :datetime='created' /></Subtitle>[m
[36m@@ -130,8 +130,8 @@[m [mexport default {[m
 		{ return this.errorDump !== null || this.errorMessage !== null; },[m
 		mediaUrl()[m
 		{ return this.post !== null ? getMediaUrl(this.postId, this.post.filename) : ''; },[m
[31m-		isText()[m
[31m-		{ return this.tags !== null ? this.tags.includes('text') : true; },[m
[32m+[m		[32mhasMedia()[m
[32m+[m		[32m{ return this.tags !== null ? !this.tags.includes('text') : true; },[m
 		isLoading()[m
 		{ return this.postId === null; },[m
 		divClass()[m
[1mdiff --git a/src/views/Post.vue b/src/views/Post.vue[m
[1mindex d6c7c4a..36e3dc3 100644[m
[1m--- a/src/views/Post.vue[m
[1m+++ b/src/views/Post.vue[m
[36m@@ -3,7 +3,7 @@[m
 	<!-- eslint-disable vue/no-v-model-argument -->[m
 	<Error :dump='errorDump' :message='errorMessage'>[m
 		<div class='container' v-if='!isMobile'>[m
[31m-			<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>[m
[32m+[m			[32m<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>[m
 			<div class='content'>[m
 				<Media v-if='isLoading || post.media_type' :mime='post?.media_type?.mime_type' :src='mediaUrl' :load='onResize' />[m
 				<main>[m
[36m@@ -48,7 +48,7 @@[m
 		<div class='content' v-else>[m
 			<Media :mime='post?.media_type.mime_type' :src='mediaUrl' :load='onResize' />[m
 			<div class='container'>[m
[31m-				<Sidebar :tags='post?.tags' class='sidebar' :style='sidebarStyle'/>[m
[32m+[m				[32m<Sidebar :tags='tags' class='sidebar' :style='sidebarStyle'/>[m
 				<main>[m
 					<div class='post-header'>[m
 						<Score :score='post?.score' :postId='postId' />[m
[36m@@ -93,7 +93,7 @@[m
 [m
 <script>[m
 import { khatch, getMediaUrl, isMobile, setTitle } from '@/utilities';[m
[31m-import { apiErrorMessage, postsHost, uploadHost } from '@/config/constants';[m
[32m+[m[32mimport { apiErrorMessage, postsHost, tagsHost, uploadHost } from '@/config/constants';[m
 import Report from '@/components/Report.vue';[m
 import Button from '@/components/Button.vue';[m
 import Loading from '@/components/Loading.vue';[m
[36m@@ -139,6 +139,7 @@[m [mexport default {[m
 		return {[m
 			editing: false,[m
 			post: null,[m
[32m+[m			[32mtags: null,[m
 			errorDump: null,[m
 			errorMessage: null,[m
 			sidebarStyle: null,[m
[36m@@ -219,6 +220,31 @@[m [mexport default {[m
 				console.error(error);[m
 			});[m
 [m
[32m+[m		[32mkhatch(`${tagsHost}/v1/fetch_tags/${this.postId}`)[m
[32m+[m			[32m.then(response => {[m
[32m+[m				[32mresponse.json().then(r => {[m
[32m+[m					[32mconsole.log(r);[m
[32m+[m					[32mif (response.status < 300)[m
[32m+[m					[32m{[m
[32m+[m						[32mthis.tags = r;[m
[32m+[m					[32m}[m
[32m+[m					[32melse if (response.status === 401)[m
[32m+[m					[32m{ this.errorMessage = r.error; }[m
[32m+[m					[32melse if (response.status === 404)[m
[32m+[m					[32m{ this.errorMessage = r.error; }[m
[32m+[m					[32melse[m
[32m+[m					[32m{[m
[32m+[m						[32mthis.errorMessage = apiErrorMessage;[m
[32m+[m						[32mthis.errorDump = r;[m
[32m+[m					[32m}[m
[32m+[m				[32m});[m
[32m+[m			[32m})[m
[32m+[m			[32m.catch(error => {[m
[32m+[m				[32mthis.errorMessage = apiErrorMessage;[m
[32m+[m				[32mthis.error = error;[m
[32m+[m				[32mconsole.error(error);[m
[32m+[m			[32m});[m
[32m+[m
 		window.addEventListener('resize', this.onResize);[m
 	},[m
 	unmounted() {[m
[36m@@ -228,8 +254,6 @@[m [mexport default {[m
 		isMobile,[m
 		isLoading()[m
 		{ return this.post === null; },[m
[31m-		isError()[m
[31m-		{ return this.errorMessage !== null; },[m
 		isUpdated()[m
 		{ return this.post !== null ? this.post.created !== this.post.updated : false; },[m
 		mediaUrl()[m
[1mdiff --git a/src/views/User.vue b/src/views/User.vue[m
[1mindex 5f80efe..8d6473a 100644[m
[1m--- a/src/views/User.vue[m
[1m+++ b/src/views/User.vue[m
[36m@@ -97,7 +97,8 @@[m [mexport default {[m
 					if (response.status < 300)[m
 					{[m
 						this.user = r;[m
[31m-						setTitle(this.user?.name || this.user?.handle);[m
[32m+[m						[32msetTitle(this.user?.name || this.user.handle);[m
[32m+[m						[32mthis.$router.replace(this.user.handle);[m
 					}[m
 					else if (response.status === 401)[m
 					{ this.errorMessage = r.error; }[m
