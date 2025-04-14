// I hate this and it should be handled by the tsconfig, but it's not during build for some reason.
/// <reference lib="webworker" />
export type { }; // necessary to update self typedef
declare var self: ServiceWorkerGlobalScope;

// for future reference
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/serviceWorker
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register

console.debug("[service worker]: registered");

self.addEventListener("install", (event: ExtendableEvent) =>
	console.debug("[service worker] installed:", event)
);

self.addEventListener("activate", (event: ExtendableEvent) => {
	event.waitUntil(self.clients.claim());
	console.debug("[service worker] activated:", event);
});

self.addEventListener("push", (e: PushEvent) => {
	console.debug("[service worker] received push:", e, "data:", e.data?.text());
	if (!e.data) return;

	self.clients.matchAll({ type: "window" }).then((c: readonly WindowClient[]) =>
		c.forEach((client: WindowClient, i: number) =>
			client.postMessage({
				primary: i === c.length - 1,
				payload: e.data?.json(),
			})
		)
	);
});
