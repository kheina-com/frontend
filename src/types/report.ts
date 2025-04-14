export type ReportType = "other" | "copyright" | "improper_rating" | "misinformation" | "impersonation" | "harassment" | "violence";

export type ActionType = "force_update" | "remove_post" | "ban" | "ip_ban";

export type BanType = "unknown" | "user" | "ip";

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
	reporter:    import("./user").User | null,
	assignee:    import("./user").User | null,
	data:        ReportData,
	response:    string | null,
}

export interface ModQueueEntry {
	queue_id: number,
	assignee: import("./user").User | null,
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
	user:     import("./user").User,
	duration: number,
}

export interface ModAction {
	report_id:   number
	assignee:    import("./user").User | null,
	created:     string | Date,
	completed:   string | Date | null,
	reason:      string,
	action_type: ActionType,
	action:      RemovePostAction | ForceUpdateAction | BanAction,
}

export interface Ban {
	ban_id:    number,
	ban_type:  BanType,
	user:      import("./user").User,
	created:   string | Date,
	completed: string | Date,
	reason:    string,
}
