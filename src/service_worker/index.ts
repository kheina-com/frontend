export type { }; // necessary to update self typedef
declare var self: ServiceWorkerGlobalScope;

// for future reference
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/serviceWorker
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register

console.log("[service worker]: registered");

self.addEventListener("install", (event: ExtendableEvent) => {
	console.debug("[service worker] installed:", event);
});

self.addEventListener("activate", (event: ExtendableEvent) => {
	event.waitUntil(self.clients.claim());
	console.debug("[service worker] activated:", event);
});

self.addEventListener("push", (e: PushEvent) => {
	console.log("[service worker] received push:", e);
	if (!e.data) return;
	console.log("                 ==> push data:", e.data.text());
	self.clients.matchAll({ type: "window" }).then(c =>
		c.forEach((client, i) =>
			client.postMessage({
				primary: i === c.length - 1,
				payload: e.data.json(),
			})
		)
	);
});
