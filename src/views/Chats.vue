<template>
	<main id='main' v-if='chatEnabled'>
		<div class='chat-list'>
			<div class='container text' v-if='!chats'>
				<span v-translate:loading>Loading...</span>
			</div>
			<div class='container text' v-else-if='chats.length === 0'>
				<span v-translate:no_chats>You have no chats yet!</span>
			</div>
			<div class='container' v-else>
				<button @click='() => activate(c.chat_id)' v-for='c in chats'>
					<div :id='setIcon(c)' class='icon'></div>
					<div class='description'>
						<p>{{ c.title }}</p>
						<span v-translate:members_lower='{ count: c.members }'>members: {{ c.members }}</span>
					</div>
				</button>
			</div>
		</div>
		<div class='active-chat' v-if='chat && log'>
			<div class='header'>
				<div class='title'>
					<p>{{ chat.title }}</p>
					<button @click='() => memberList = true' v-translate:members_lower='{ count: chat.members.length }'>members: {{ chat.members.length }}</button>
				</div>
				<div class='dead-space'/>
				<!-- <DropDown class='idk' :options='[
					{ html: "idk", action() {} }
				]'>
					<i class='material-icons'>more_vert</i>
				</DropDown> -->
				<button @click='closeChat'>
					<i class='material-icons'>close</i>
				</button>
			</div>
			<ol>
				<li v-for='m in log.messages'>
					<div class='sys-message' v-if='m.user.handle === "system"'>{{ m.content }}</div>
					<ChatMessage v-bind='m' :color='chatColor(m)' v-else/>
				</li>
			</ol>
			<div class='input'>
				<MarkdownEditor
					v-model:value='message'
					placeholder='Write a message...'
					height='1em'
					resize='none'
					:onEnter='onEnter'
					hidePreview
					hideGuide
				/>
				<button class='enter' @click='sendMessage'>
					<i class='material-icons'>send</i>
				</button>
			</div>
		</div>
		<div class='loading-chat' v-else-if='chat === null'>
			<Loading type='block'/>
		</div>
		<div class='no-chat' v-else>
		</div>
		<div class='member-list' v-if='chat && memberList' @click='closeMemberList'>
			<div @click.stop.prevent>
				<div class='new-member' v-if='newMember !== undefined'>
					<span>add new user to chat</span>
					<div>
						<input v-model='newMember' placeholder='@handle' class='interactable text'>
						<button class='interactable' @click='addMember'>
							<i class='material-icons'>add</i>
							<span>Add User</span>
						</button>
					</div>
				</div>
				<div class='members' v-else>
					<p v-translate:members_upper='{ count: chat.members.length }'>Members: {{ chat.members.length }}</p>
					<ul>
						<li class='profile' v-for='m in chat.members'>
							<Profile class='nested' v-bind='m'/>
						</li>
					</ul>
				</div>
				<div class='buttons'>
					<button @click='() => newMember = newMember === undefined ? "" : undefined'>
						<i class='material-icons-outline'>{{ newMember === undefined ? "person_add" : "person_add_disabled" }}</i>
					</button>
					<button @click='closeMemberList'>
						<i class='material-icons'>close</i>
					</button>
				</div>
			</div>
		</div>
		<ThemeMenu/>
	</main>
	<main id='main' class='disabled' v-else>
		<div>
			<p>
				The chat feature is not currently enabled. There is likely a technical issue that is being fixed.
			</p>
			<p v-if='globals.auth?.isMod'>
				<p>
					You are a mod, click here to test the feature anyway
				</p>
				<p>
					<button class='interactable' @click='chatEnabled = true'>enable feature</button>
				</p>
			</p>
		</div>
	</main>
</template>
<script setup lang='ts'>
import type { Chat, ChatLog, ChatPortable, Message } from '@/types/chat';
import type { NotificationEvent } from '@/types/notifications';
import { onMounted, onUnmounted, ref, toRef, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MdRefId } from '@/utilities/markdown';
import { buf2hex, FeatureEnabled, khatch, sha1, ToUuid, Utf8Encode } from '@/utilities';
import { host } from '@/config/constants';
import store from '@/globals';
import ChatMessage from '@/components/ChatMessage.vue';
import ThemeMenu from '@/components/ThemeMenu.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import Loading from '@/components/Loading.vue';
import Profile from '@/components/Profile.vue';

const logstr      = "[Chats]";
const path        = "/c";
const globals     = store();
const route       = useRoute();
const router      = useRouter();
const articles    = new Set(["A", "AN", "THE"]);
const chats:      Ref<ChatPortable[] | void> = ref();
const chat:       Ref<Chat | null | void>    = ref();  // chat === null means loading
const log:        Ref<ChatLog | void>        = ref();
const message:    Ref<string>                = ref("");
const memberList: Ref<boolean>               = ref(false);
const newMember:  Ref<string | void>         = ref();
const notification = "notification";

const chatEnabled: Ref<boolean> = ref(true);
FeatureEnabled("chat").then(c => chatEnabled.value = c);

const style = () => {
	const banner = document.getElementById("banner")?.clientHeight ?? 0;
	const footer = document.getElementById("footer")?.clientHeight ?? 0;
	const main = document.getElementById("main") as HTMLDivElement;
	main.style.maxHeight = `calc(100vh - ${banner}px - ${footer}px - var(--margin))`;
};
document.addEventListener("resize", style);

const eventListener = (_e: Event) => {
	const e = _e as CustomEvent<NotificationEvent>;
	if (!e.detail.notification || e.detail.notification.type !== "chat") return;
	if (e.detail.notification.message.chat_id !== chat.value?.chat_id) return;
	if (!log.value) return;
	log.value.messages.unshift(toMessage(e.detail.notification.message));
};
document.addEventListener(notification, eventListener);

onMounted(style);
onMounted(() => {
	const content = document.getElementById("content") as HTMLDivElement;
	content.style = "display: flex; flex-direction: column;";
});
onUnmounted(() => {
	document.removeEventListener("resize", style);
	document.addEventListener(notification, eventListener);
	const content = document.getElementById("content") as HTMLDivElement;
	content.style = "";
});

const addMember = () => {
	if (!chat.value || !newMember.value) return;
	khatch(`${host}/v1/chat/${chat.value.chat_id}/member`, {
		method: "PUT",
		handleError: true,
		body: {
			handle: newMember.value,
		},
	}).then(
		r => r.json()
	).then((r: Chat) =>
		chat.value = r
	).then(
		newMember.value = undefined
	);
};

const closeMemberList = () => {
	memberList.value = false;
	newMember.value = undefined;
};

const setIcon = (c: ChatPortable) => {
	const refid = MdRefId();
	setTimeout(() => {
		const title = c.title.toUpperCase();
		const filtered = title.split(/\s+/).filter((v: string) => !articles.has(v));
		const symbol = (filtered.length ? filtered[0] : title).substring(0, 2);

		const el = document.getElementById(refid) as HTMLDivElement;
		if (!el) return;
		el.textContent = symbol;
		el.style.background = "#" + c.chat_id.toString(16).substring(0, 6).padStart(6, "0");
	}, 0);
	return refid;
};

const activate = (chat_id: number) => {
	memberList.value = false;
	const path = route.path + "?chat_id=" + chat_id.toString();
	if (route.query.chat_id) router.replace(path);
	else router.push(path);
}

const loadChat = (chat_id: number) => {
	chat.value = null;
	loadMessages(chat_id);
	khatch(`${host}/v1/chat/${chat_id}`, {
		errorHandlers: {
			// uh oh.
			404: () => chat.value = undefined,
		},
	}).then(
		r => r.json()
	).then((r: Chat) =>
		chat.value = r
	);
};

const closeChat = () => {
	if (window.history.state.back === path) router.back();
	else router.replace(path);
}

const toMessage = (msg: Message): Message => ({
	...msg,
	message_id: ToUuid(msg.message_id),
	created: new Date(msg.created),
});

const loadMessages = (chat_id: number, before: Date | null = null) => {
	log.value = undefined;
	const date = before?.toISOString() ?? "9999-01-01T00:00:00.000Z";
	khatch(`${host}/v1/chat/log/${chat_id}?before=${date}`, {
		errorHandlers: {
			// uh oh.
			404: () => log.value = undefined,
		},
	}).then(
		r => r.json()
	).then((r: ChatLog) =>
		log.value = {
			...r,
			messages: r.messages.map(toMessage),
		}
	);
}

const onEnter = (e: KeyboardEvent) => {
	if (e.ctrlKey) return message.value += "\n";
	return sendMessage();
};

const sendMessage = () => {
	if (!chat.value || !message.value) return;
	khatch(`${host}/v1/chat/${chat.value.chat_id}`, {
		method: "PUT",
		errorHandlers: {
			// uh oh.
			404: () => chat.value = undefined,
		},
		body: {
			message: message.value,
		},
	}).then(
		r => r.json()
	).then((r: Message) => {
		if (!log.value) return;
		log.value.messages.unshift(toMessage(r));
	}).then(() =>
		message.value = ""
	);
};

const colorCache: { [k: string]: string } = { };
const chatColor = (m: Message): string => {
	if (colorCache.hasOwnProperty(m.user.handle)) return colorCache[m.user.handle];
	const color = colorCache[m.user.handle] = "#" + buf2hex(sha1(Utf8Encode(m.user.handle))).substring(0, 6);
	return color;
};

khatch(`${host}/v1/chats`, {
	errorHandlers: {
		404: () => chats.value = [],
	},
}).then(
	r => r.json()
).then((r: ChatPortable[]) =>
	chats.value = r
);

if (route.query.chat_id) loadChat(parseInt(route.query.chat_id.toString()));

watch(toRef(route, "query"), query => {
	if (query.chat_id) loadChat(parseInt(query.chat_id.toString()));
	else chat.value = log.value = undefined;
});
</script>
<style>
::placeholder {
	color: var(--subtle);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.bubble .markdown * {
	word-wrap: anywhere;
}
.active-chat {
	.input > div {
		flex: 1;
	}
	.input textarea {
		cursor: text;
		position: relative;
		padding: 1em;
		display: block;
		font-weight: normal;
		background: none;
		border: none;
		border-radius: none;
		box-shadow: none;
		height: 3.3em;
	}
	.input textarea:hover {
		color: var(--interact);
		box-shadow: none;
	}
	.input textarea:active, .input textarea:focus {
		color: var(--textcolor);
		box-shadow: none;
	}
	.input textarea::placeholder {
		color: var(--subtle);
		-webkit-transition: var(--transition) var(--fadetime);
		-moz-transition: var(--transition) var(--fadetime);
		-o-transition: var(--transition) var(--fadetime);
		transition: var(--transition) var(--fadetime);
	}
	.input textarea:focus::placeholder {
		opacity: 0.25;
	}
}
</style>
<style scoped>
main {
	position: relative;
	display: flex;
	height: 100vh;
	margin-top: var(--margin);
}

main.disabled {
	background: var(--main);
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
}
main.disabled div > p:nth-child(2) {
	margin-top: var(--margin);
}

.chat-list {
	background: var(--bg1color);
	min-width: 10em;
	max-width: 30em;
	width: 33vw;
	padding: 0;
	margin: 0;

	button {
		padding: 0.5em;
		display: flex;
		width: 100%;
	}
	button:hover {
		background: var(--bg3color);
	}
	.icon {
		height: 3em;
		width: 3em;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--textcolor);
	}
	.description {
		margin-left: 0.5em;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		span {
			color: var(--subtle);
			font-size: 0.8em;
		}
	}
}

.header {
	background: var(--bg1color);
	position: relative;
	width: 100%;
	display: flex;
	box-shadow: 0 0.25em 0.5em 0 var(--bg2color);
	align-items: center;
}
.dead-space {
	flex: 1;
}
.title {
	padding: 0 1em;

	p {
		font-size: 0.9em;
		margin-bottom: -0.3em;
	}
	button {
		color: var(--subtle);
		font-size: 0.8em;
	}
	button:hover {
		color: var(--interact);
	}
}
.active-chat, .loading-chat, .no-chat {
	background: var(--bg2color);
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 0;
	margin: 0;
}
.active-chat {
	border-left: var(--border-size) solid var(--bordercolor);
	overflow: hidden;
}
.active-chat ol {
	padding: 0.5em 0.25em;
	overflow: hidden scroll;
	display: flex;
	flex-direction: column-reverse;
	flex: 1;
}

.loading-chat {
	display: flex;
	align-items: center;
	justify-content: center;
}

li {
	margin-bottom: 0.25em;
}
.input {
	background: var(--bg3color);
	display: flex;
	box-shadow: 0 -0.25em 0.5em 0 var(--bg2color);
}
.active-chat i {
	display: flex;
	padding: 0.5em;
}

.member-list {
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--screen-cover);
}
.member-list > div {
	width: 30em;
	padding: 0;
	height: calc(100% - var(--margin) * 2);
	background: var(--bg1color);
	margin: var(--margin) auto;
	border-radius: var(--border-radius);
	position: relative;
}
.member-list .buttons {
	display: flex;
	position: absolute;
	top: 0;
	right: 0;

	button {
		display: flex;
		margin: var(--margin) var(--margin) 0 0;

	}
}
.mobile .member-list .buttons {
	padding: var(--margin);

	i {
		padding: 0;
	}
}

.member-list .members {
	position: relative;
	display: flex;
	flex-direction: column;
	max-height: 100%;
}
.member-list .members > p {
	margin: var(--margin) var(--margin) 0;
}
.member-list ul {
	padding: 0 var(--margin) 0.5em;
	display: flex;
	flex-direction: column;
	overflow: hidden scroll;
	flex: 1;
}
li.profile {
	display: flex;
	margin: 0.5em 0 0;
}
.add-member {
	display: flex;
	align-items: center;
	margin: 0 auto var(--margin) var(--margin);
	padding-right: 0.25em;
}

li:has(> .sys-message) {
	display: flex;
	justify-content: center;
}
.sys-message {
	background: var(--activeshadowcolor);
	padding: 0.75em 1em;
	border-radius: 2em;
	position: relative;
	font-size: 0.85em;
}

.new-member {
	display: flex;
	flex-direction: column;
	padding: 2.5em var(--margin) 0;

	& > span {
		margin-left: var(--margin);
	}
	& > div {
		display: flex;
		align-items: center;

		& > input {
			flex: 1;
			margin-right: var(--margin);
		}
		& > button {
			display: flex;
			align-items: center;

			& > i {
				margin: -0.25em 0.25em -0.25em 0;
			}
		}
	}
}

.mobile {
	.chat-list {
		max-width: 100%;
	}
	.active-chat {
		border: none;
	}
	main:has(.active-chat) > .chat-list, main:has(.loading-chat) > .chat-list, .no-chat {
		display: none;
	}
}
</style>
margin: 0.5em 0 0;
