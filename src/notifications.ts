import type { Message } from '@/types/notifications';
import { createToast, khatch, registerServiceWorker } from '@/utilities';
import sw from '@/service_worker?url';
import { host } from '@/config/constants';
import notify from '$/sounds/notify.ogg';
import store from '@/globals';


// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
export default function start(): Promise<void> {
	let reg: ServiceWorkerRegistration | null = null;
	return registerServiceWorker(sw).then((r: ServiceWorkerRegistration) =>
		reg = r
	).then(() => {
		if (!reg) throw "service worker registration failed";
		return reg.pushManager.getSubscription();
	}).then((sub: PushSubscription | null) => {
		if (!sub) return;
		return sub.unsubscribe();
	}).then(() =>
		khatch(`${host}/v1/notifications/register`)
	).then((r: Response) =>
		r.json()
	).then((r: { application_server_key: string; }) => {
		if (!reg) throw "service worker registration unavailable";
		return reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: r.application_server_key,
		});
	}).then((sub: PushSubscription) => khatch(`${host}/v1/notifications/register`, {
		method: "PUT",
		body: sub,
	})).then(
		_listen
	).catch(
		_error
	);
}

const _listen = () => {
	const m = "message";
	navigator.serviceWorker.removeEventListener(m, listener);
	navigator.serviceWorker.addEventListener(m, listener);
	console.debug("[notifications] added listener:", listener);
};

const _error = (err: any) => {
	console.error("[notifications] failed to subscribe to push manager", err);
	createToast({
		title: "failed to subscribe to push manager",
		description: err.toString(),
	});
};

export const bindListener = () => {
	return new Promise<boolean>(r =>
		registerServiceWorker(sw).then(reg =>
			reg.pushManager.getSubscription()
		).then((sub: PushSubscription | null) => {
			console.debug("[notifications] active sub:", sub);
			if (sub) _listen();
			else throw "";
		}).then(
			() => r(true)
		).catch(
			() => r(false)
		)
	);
};

// const audio = new Audio(notify);
const listener = (e: MessageEvent<Message>) => {
	e.stopImmediatePropagation();  // just in case multiple listeners were added
	if (e?.data?.primary) new Audio(notify).play();
	const globals = store();
	switch (e?.data?.payload?.type) {
	case "interact":
		console.debug(`[notification] interact ${e.data.payload.event}:`, e.data.payload.post);
		globals.appendNotification(e.data.payload);
		break;

	case "post":
		console.debug(`[notification] post ${e.data.payload.event}:`, e.data.payload.post);
		globals.appendNotification(e.data.payload);
		break;

	case "user":
		console.debug(`[notification] user ${e.data.payload.event}:`, e.data.payload.user);
		globals.appendNotification(e.data.payload);
		break;

	default:
		console.warn("[notification] unknown message type:", e?.data?.payload ?? e);
	}
};
