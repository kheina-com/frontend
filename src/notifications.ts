import type { Notification } from '@/types/notifications';
import { createToast, khatch, registerServiceWorker, uuid4 } from '@/utilities';
import { AddNotification } from '@/utilities/notifications';
import { serviceWorkerFile as sw } from 'virtual:vite-plugin-service-worker';
import { host } from '@/config/constants';
import notify from '$/sounds/notify.ogg';


// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
export default function start(): Promise<void> {
	let reg: ServiceWorkerRegistration | null = null;
	const trace = uuid4();
	const registerUrl = `${host}/v1/notifications/register`;
	return registerServiceWorker(sw).then((r: ServiceWorkerRegistration) =>
		reg = r
	).then(() => {
		if (!reg) throw "service worker registration failed";
		return reg.pushManager.getSubscription();
	}).then((sub: PushSubscription | null) => {
		if (!sub) return;
		return sub.unsubscribe();
	}).then(() =>
		khatch(registerUrl, { trace }),
	).then((r: Response) =>
		r.json()
	).then((r: { application_server_key: string; }) => {
		if (!reg) throw "service worker registration unavailable";
		return reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: r.application_server_key,
		});
	}).then((sub: PushSubscription) =>
		khatch(registerUrl, {
			method: "PUT",
			body: sub,
			trace,
		}),
	).then(
		_listen,
	).catch(
		_error,
	);
}

export const conf = "notifications";
export const logstr = "[notifications]";

const _listen = () => {
	const m = "message";
	navigator.serviceWorker.removeEventListener(m, listener);
	navigator.serviceWorker.addEventListener(m, listener);
	console.debug(logstr, "added listener:", listener);
};

const _error = (err: any) => {
	if (err?.status) return;
	const e = "failed to subscribe to push manager";
	console.error(logstr, e, err);
	createToast({
		title: e,
		description: err?.toString(),
	});
	throw err;
};

export const bindListener = () => {
	return new Promise<boolean>(r =>
		registerServiceWorker(sw).then(reg =>
			reg.pushManager.getSubscription()
		).then((sub: PushSubscription | null) => {
			console.debug(logstr, "active sub:", sub);
			if (sub) _listen();
			else throw "";
		}).then(
			() => r(true),
		).catch(
			() => r(false),
		)
	);
};

interface Message {
	primary: boolean,
	payload: Notification,
}

const nLogStr = "[notification]";
const listener = async (e: MessageEvent<Message>) => {
	e.stopImmediatePropagation();  // just in case multiple listeners were added
	if (e?.data?.primary) new Audio(notify).play();

	switch (e?.data?.payload?.type) {
	case "interact":
		console.debug(nLogStr, `interact ${e.data.payload.event}:`, e.data.payload.post);
		break;

	case "post":
		console.debug(nLogStr, `post ${e.data.payload.event}:`, e.data.payload.post);
		break;

	case "user":
		console.debug(nLogStr, `user ${e.data.payload.event}:`, e.data.payload.user);
		break;

	default:
		console.warn(nLogStr, "unknown message type:", e?.data?.payload ?? e);
		return;
	}

	e.data.payload.created = new Date(e.data.payload.created);
	await AddNotification(e.data.payload);
};
