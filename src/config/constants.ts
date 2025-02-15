export default 1576242000 * 1000;

let env = null;

switch (window.location.hostname.toLowerCase()) {
case "kheina.com":
case "fuzz.ly":
	env = "prod";
	break;

case "dev.kheina.com":
case "dev.fuzz.ly":
	env = "dev";
	break;

case "localhost":
case "127.0.0.1":
	env = "local";
	break;
}

export const environment = env;


let apiHost;
let cdn;
switch (environment) {
case "prod":
	apiHost = "https://api.fuzz.ly";
	cdn = "https://cdn.fuzz.ly";
	break;

case "dev":
	apiHost = "https://api-dev.fuzz.ly";
	cdn = "https://cdn.fuzz.ly";
	break;

default:
	apiHost = "http://localhost:8000";
	cdn = "http://localhost:9000/kheina-content";
	break;
}
export const host = apiHost;
export const cdnHost = cdn;

export const authRegex = /^(?:http:\/\/localhost(?:\:\d{2,5})?\/|https:\/\/(?:[a-z0-9-_]+\.)?fuzz\.ly\/)/i;

export const cdnRegex = /^(?:https:\/\/(?:[a-z0-9-_]+\.)?fuzz\.ly\/)/i;

export const isMobile = navigator.userAgent.toLowerCase().includes("mobile");

export const apiErrorMessage = "An error occurred in your browser during an API call.";

export const apiErrorMessageToast = "An error occurred during an API call";

export const apiErrorDescriptionToast = "If you submit a bug report, please include the data below.";

export const tagGroups: ("artist" | "subject" | "species" | "gender" | "misc" | "system" | "rating")[] = ["artist", "subject", "species", "gender", "misc", "system", "rating"];

export const routerMetaTag = "data-v-router";

export const tabs: Set<string | void> = new Set(["posts", "sets", "tags", "favs", "uploads"]);

export const iconShortcode = "icon";

export const ratingMap: { [k: string]: number; } = {
	"general": 0,
	"mature": 1,
	"explicit": 2,
};
