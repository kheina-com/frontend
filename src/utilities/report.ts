export type ReportType = "other" | "copyright" | "improper_rating" | "misinformation" | "impersonation" | "harassment" | "violence";

export type ActionType = "force_update" | "remove_post" | "ban" | "ip_ban";

export type HistoryMask = "post" | "message" | "url";

export interface ReportDataHistory {
	mask?:   HistoryMask[],
	post:    string | null,
	message: string | null,
	url:     string | null,
	prev?:   ReportDataHistory | null,
}

export interface ReportData {
	mask?:   undefined,
	post:    string | null,
	message: string,
	url:     string,
	prev?:   ReportDataHistory | null,
}

export interface Report {	
	report_id:   number,
	report_type: ReportType,
	created:     string,
	reporter:    User | null,
	assignee:    User | null,
	data:        ReportData,
	response:    string | null,
}

export interface ModQueueEntry {
	queue_id: number,
	assignee: User | null,
	report:   Report,
}

export interface RemovePostAction {
	post: string,
}

export interface FieldUpdates {
	rating:      "general" | "mature" | "explicit" | null,
	title:       string | null,
	description: string | null,
	privacy:     "public" | "unlisted" | "private" | "unpublished" | "draft" | null,
	tags:        string | null,
}

export interface ForceUpdateAction {
	post:          string,
	field_updates: FieldUpdates,
}

export interface BanAction {
	user:     User,
	duration: number,
}

export interface ModAction {
	report_id:   number
	assignee:    User | null,
	created:     Date,
	completed:   Date | null,
	reason:      string,
	action_type: ActionType,
	action:      RemovePostAction | ForceUpdateAction | BanAction,
}

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
