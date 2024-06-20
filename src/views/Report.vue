<template>
	<!-- eslint-disable vue/no-v-model-argument -->
	<main>
		<Title>Report Content</Title>
		<Post :postId='post?.post_id' :nested='true' v-bind='post' labels v-if='post'/>
		<div class='container'>
			<span>Select a report type below or enter your own</span>
		</div>
		<div class='type-select'>
			<RadioButtons
				name='report-type'
				v-model:value='reportType'
				:data="[
					{ content: 'DMCA / Copyright', value: 'copyright' },
					{ content: 'Improper Rating', value: 'rating' },
					{ content: 'Misinformation', value: 'misinformation' },
					{ content: 'Impersonation', value: 'impersonation' },
					{ content: 'Harassment / Intimidation', value: 'intimidation' },
					{ content: 'Call to Violence', value: 'violence' },

					// please always put other last
					{ content: 'Other', value: 'other' },
				]"
			/>
		</div>
		<div class='container' v-show='reportType === "copyright"'>
			<span>For legal reasons, additional fields will need to be added for DMCA</span>
			<textarea class='interactable text'></textarea>
		</div>
		<div class='container'>
			<span>Data included in this report</span>
			<pre>{{JSON.stringify(data, null, 4)}}</pre>
		</div>
		<div class='container'>
			<span>Please describe the reason for your report below, including any offending usernames and post ids</span>
			<MarkdownEditor v-model:value='message'/>
			<div class='buttons'>
				<button class='interactable' @click='sendReport'>Submit »</button>
			</div>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import { createToast, khatch } from '@/utilities';
import { host } from '@/config/constants';
import ThemeMenu from '@/components/ThemeMenu.vue';
import Title from '@/components/Title.vue';
import RadioButtons from '@/components/RadioButtons.vue';
import Post from '@/components/Post.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';


export default {
	name: 'Report',
	components: {
		ThemeMenu,
		Title,
		RadioButtons,
		Post,
		MarkdownEditor,
	},
	data() {
		return {
			data: this.$route.query,
			reportType: null,
			post: null,
			message: null,
		};
	},
	created() {
		const postId = this.$route.query?.post;
		if (postId) {
			this.post = { postId: null };
			khatch(`${host}/v1/posts/${postId}`, {
				handleError: true
			}).then(r => r.json())
			.then(r => {
				r.favorites = 0;
				r.reposts = 0;
				this.post = r;
			});
		}
	},
	methods: {
		sendReport() {
			createToast({
				title: "This feature doesn't exist yet, sorry!",
				description: "yes, I know this is a very important feature. it's currently being worked on",
				dump: {
					...this.data,
					report_type: this.reportType,
					message: this.message,
				},
			});
		},
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
.container {
	position: relative;
	width: 50vw;
	min-width: 600px;
	margin: var(--margin) auto 0;
}
.mobile .container {
	width: 100%;
}
textarea {
	width: 100%;
	resize: vertical;
	height: 10em;
}
span {
	position: relative;
	left: var(--margin);
}
pre {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.5em;
	white-space: pre-wrap;
	word-break: break-word;
	margin: auto;
}
pre code {
	padding: 0;
}
.type-select {
	margin-bottom: var(--margin);
}
.radio-buttons {
	justify-content: center;
}
.buttons {
	margin-top: var(--margin);
	text-align: right;
}

span {
	padding-bottom: 0.1em;
}

.post {
	margin-top: var(--margin);
}

.md-link {
	position: absolute;
	right: var(--margin);
	font-size: 0.9em;
	color: var(--subtle);
}
</style>
