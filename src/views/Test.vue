<template>
	<main>
		<Countdown :endtime='date'/>
		<div><Timestamp :datetime='datetime' live/></div>
		<div><Timestamp :datetime='epoch' live/></div>
		<div>
			<Button @click='audio.play()'>
				play me
			</Button>
		</div>
		<div>
			<Button @click="$store.commit('createToast', {
				title: 'An error occurred during an API call',
				description: 'If you submit a bug report, please include the data below.',
				dump: {
					error: 'Internal Server Error',
					refid: '87e1b61cceeb495b9583afefd785e4a6',
					status: 500,
				},
			})">
				toast
			</Button>
		</div>
		<div class='token'>
			<textarea class='interactable text' v-model='content'/>
			<div>
				<Markdown :content='cookie'/>
				<p>note: signature is not checked</p>
			</div>
		</div>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';
import Countdown from '@/components/Countdown.vue';
import Timestamp from '@/components/Timestamp.vue';
import Button from '@/components/Button.vue';
import notify from '$/sounds/notify.ogg';
import { authCookie } from '@/utilities';
import epoch from '@/config/constants';
import Markdown from '@/components/Markdown.vue';


export default {
	name: 'Test',
	components: {
		ThemeMenu,
		Countdown,
		Timestamp,
		Button,
		Markdown,
	},
	data() {
		return {
			epoch: new Date(epoch).toString()	,
			date: new Date(Date.now() + 500000000).toString(),
			datetime: new Date(Date.now()).toString(),
			audio: new Audio(notify),
			content: authCookie()?.token,
		}
	},
	computed: {
		cookie() {
			try
			{
				const c = authCookie(this.content);
				if (c)
				{ delete c.token; }
				return '```json\n' + JSON.stringify(c, null, 4) + '\n```';
			}
			catch (e)
			{
				console.error(e);
				return 'could not decode token';
			}
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
main > div {
	margin: 0.5em 0;
}
main > :first-child {
	margin-top: 0;
}
main > :last-child {
	margin-bottom: 0;
}
ol {
	list-style-type: none;
	margin: 0;
	padding: 0;
}
ol li {
	margin: 0 0 25px;
}
ol li a {
	display: block;
}
ol li div {
	display: flex;
}
ol li div div {
	flex-direction: column;
}

ol > :last-child {
	margin-bottom: 0;
}

.user-field {
	display: flex;
	align-items: center;
	color: var(--textcolor);
}
.user-field span button {
	color: var(--textcolor);
}
.user-field span button:hover {
	color: var(--icolor);
}
i {
	margin: 0 0.25em 0 0;
	font-size: 1.2em;
}

.token {
	display: grid;
	grid-template-columns: [editor-start] 1fr [editor-end] 25px [preview-start] 1fr [preview-end];
	margin: 0 auto;
	min-width: 1000px;
	position: relative;
}
.token textarea {
	grid-area: editor;
	resize: vertical;
	line-height: 1.5;
}
.token div {
	grid-area: preview;
}
</style>