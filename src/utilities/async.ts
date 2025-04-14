import { RefId } from '.';

interface CriticalPoint {
	time: number,
	refId: number,
	onRelease: Promise<void>,
	_release: { (): void; },
}

export class Lock {
	private _cp: CriticalPoint | null;
	private _interval: number;

	constructor(interval: number = 1000) {
		this._cp = null;
		this._interval = interval;
	}

	async Acquire(): Promise<number> {
		let cpRefId: number | null = null;
		let sleep: number = 5;
		const refId = RefId();
		do {
			const cp = this._cp;
			// cp === null: the critical point is up for grabs
			// cp.refId === this.refId: we have the critical point, so we should update the checkin time
			// cp.refId !== this.refId: we do not have the critical point
			// 	cp.refId !== this.refId && cp.time > now: another tab is running the consumer and is active
			// 	cp.refId !== this.refId && cp.time <= now: another tab is running the consumer and is inactive
			if (!cp || cp.refId === refId || cp.time <= new Date().valueOf()) {
				// @ts-ignore
				let r: { (): void; } = null;
				// try to access the critical point
				this._cp = { refId, time: new Date().valueOf() + this._interval * 1.5, onRelease: new Promise(_r => r = _r), _release: r };
				await new Promise(_r => setTimeout(_r, 1)); // wait a second to make sure any other sets have resolved
				cpRefId = this._cp?.refId;
			} else {
				// sleep for a little bit to let the other tab(s) release the critical point
				await new Promise(r => setTimeout(r, sleep));
				sleep = Math.min(sleep ** 2, this._interval);
			}
		} while (cpRefId !== refId);
		return refId;
	}

	async Release(refId: number): Promise<void> {
		const cp = this._cp;
		if (cp?.refId === refId && cp.time > new Date().valueOf()) {
			// critical point belongs to us, so we can safely release it
			this._cp = null;
			cp._release();
		}
	}

	Free(): Promise<void> {
		const cp = this._cp;
		if (!cp) return new Promise(r => r());
		return cp.onRelease;
	}
}
