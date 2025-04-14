import type { HistoryMask, Report, ReportData, ReportDataHistory } from '@/types/report';

function historyMask(r: ReportData | ReportDataHistory, key: HistoryMask): boolean {
	if (!r?.mask) return true;
	return r.mask.includes(key);
}

export function reportHistory(report?: Report | null): ReportData[] {
	if (!report) return [];

	const h: ReportData[] = [];
	let cur: ReportData = report.data;
	let r: ReportData | ReportDataHistory | null | void = cur;
	while (r) {
		cur = {
			post:    historyMask(r, "post") ? r.post : cur.post,
			message: historyMask(r, "message") && r.message !== null ? r.message : cur.message,
			url:     historyMask(r, "url") && r.url !== null ? r.url : cur.url,
			prev:    null,
		};
		h.push(cur);
		r = r.prev;
	}
	return h;
}

export function reportRevisions(report?: Report | null): number {
	let revisions = 0;
	let r: ReportData | ReportDataHistory | null | void = report?.data;
	while (r) {
		revisions++;
		r = r.prev;
	}
	return revisions;
}
