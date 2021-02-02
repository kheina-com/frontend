export default 0;

export function setCookie(name, value, maxage=86400)
{ document.cookie = `${name}=${escape(value)}; max-age=${maxage}; samesite=strict; path=/; secure`; };

export function getCookie(cookieName)
{
	let name = cookieName + '=';
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
		{ c = c.substring(1); }
		if (c.indexOf(name) == 0)
		{ return decodeURIComponent(c.substring(name.length, c.length)); }
	}
	return null;
};

export function commafy(x)
{ // from https://stackoverflow.com/a/2901298
	let parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
};

export function getMediaUrl(postId, filename)
{
	return `https://cdn.kheina.com/file/kheina-content/${postId}/${filename}`;
}

export function getMediaThumbnailUrl(postId, resolution=800)
{
	return `https://cdn.kheina.com/file/kheina-content/${postId}/thumbnails/${resolution}.jpg`;
}

export function round(num, precision)
{
	let multiplier = 10 ** precision;
	return Math.round(num * multiplier) / multiplier;
}

export function isMobile()
{
	return navigator.userAgent.toLowerCase().includes('mobile');
}

export function tagSplit(tags)
{
	return tags.split(',').map(x => x.trim());
}

export function sortTagGroups(tags)
{
	let sorted = { };
	['artist', 'sponsor', 'participant', 'species', 'gender', 'misc']
	.forEach(i => {
		if (tags.hasOwnProperty(i))
		{ sorted[i] = tags[i]; }
	});
	return sorted;
}