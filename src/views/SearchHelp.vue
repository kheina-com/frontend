<template>
	<main>
		<div>
			<h2>
				Tag Search
			</h2>
			<p>
				Search for a tag by typing a tag into the search bar and hitting enter. Searching for a single tag will perform an approximate search and return all tags containing the search parameter, if an exact match doesn't exist. (not yet implemented)
			</p>
			<p>
				You can search for multiple tags by entering multiple tags into the search bar, separated by spaces
			</p>
			<h2>
				User Search
			</h2>
			<p>
				Search for a user by searching for their handle in the format <code>@handle</code>
			</p>
			<p>
				User searches can be combined with tags, for example <code>@handle solo</code> will return posts made by @handle with the solo tag 
			</p>
			<h2>
				Sorting
			</h2>
			<p>
				You can sort tags by using the sort dropdown menu on the search results page or by including <code>sort:method</code> in your search
			</p>
			<h3>
				sort methods
			</h3>
			<ul>
				<li>
					new
				</li>
				<li>
					old
				</li>
				<li>
					hot
				</li>
				<li>
					top
				</li>
				<li>
					best
				</li>
				<li>
					controversial
				</li>
			</ul>
			<h2>
				Excluding Parameters
			</h2>
			<p>
				Prepending a dash (<code>-</code>) in front of your search term will exclude any results that include that parameter
			</p>
			<p>
				For example, <code>solo -@dani</code> will return all results for the <code>solo</code> tag, except those posted by @dani
			</p>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'SearchHelp',
	components: {
		ThemeMenu,
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: 25px;
}
div {
	width: 70vw;
	margin: 0 auto;
}
h2 {
	margin: 25px -5px 10px;
	padding: 0 5px 5px 30px;
	border-bottom: var(--border-size) solid var(--bordercolor);
}
h3 {
	margin: 10px 0 5px 25px;
}
div > :first-child {
	margin-top: 0;
}
ul {
	list-style: none;
	padding: 0;
	margin: 0 0 0 50px;
}
.mobile p {
	width: auto;
}
code {
	background: var(--bg2color);
	border-radius: var(--border-radius);
	padding: 0.1em 0.25em;
}
</style>