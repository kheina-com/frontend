export default 0;

let constant = null;

switch (window.location.hostname.toLowerCase())
{
	case 'kheina.com' :
		constant = 'prod';
		break;

	case 'dev.kheina.com' :
		constant = 'dev';
		break;

	case 'localhost' :
		constant = 'local';
		break;

	case '127.0.0.1' :
		constant = 'local';
		break;
}

export const environment = constant;


let pHost = null;
let tHost = null;
let aHost = null;
let uHost = null;

switch (environment)
{
	case 'prod' :
		pHost = 'https://posts.kheina.com';
		tHost = 'https://tags.kheina.com';
		aHost = 'https://posts.kheina.com';
		uHost = 'https://posts.kheina.com';
		break;

	case 'dev' :
		pHost = 'https://dev.kheina.com/posts';
		tHost = 'https://dev.kheina.com/tags';
		aHost = 'https://dev.kheina.com/account';
		uHost = 'https://dev.kheina.com/upload';
		break;

	case 'local' :
		pHost = 'https://dev.kheina.com/posts';
		tHost = 'https://dev.kheina.com/tags';
		aHost = 'https://dev.kheina.com/account';
		uHost = 'https://dev.kheina.com/upload';
		break;
}

export const postsHost = pHost;
export const tagsHost = tHost;
export const accountHost = aHost;
export const uploadHost = uHost;

export const apiErrorMessage = 'An error occurred in your browser during an API call.';
