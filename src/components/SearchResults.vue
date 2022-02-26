<template>
	<main>
		<Title>Results</Title>
		<Subtitle>searched {{commafy(stats.images)}} images from {{commafy(stats.artists)}} artists in {{prettyTime(elapsedtime)}}</Subtitle>
		<div class='top'>
			<TopResult v-bind='topResult' :maxRating='maxRating()'/>
			<span class='divider'>
				Less relevant results
				<i class="material-icons">expand_more</i>
			</span>
		</div>
	</main>
	<MoreResults :results='results' :maxRating='maxRating()'/>
</template>

<script>
import TopResult from '@/components/TopResult.vue';
import MoreResults from '@/components/MoreResults.vue';
import Subtitle from '@/components/Subtitle.vue';
import Title from '@/components/Title.vue';

export default {
	name: 'SearchResults',
	components: {
		TopResult,
		MoreResults,
		Subtitle,
		Title,
	},
	props: {
		results: Array,
		elapsedtime: Number,
		stats: Object,
	},
	data() {
		return {
			topResult: null,
		}
	},
	methods: {
		maxRating() {
			let maxrating = null;
			let searchParams = new URLSearchParams(window.location.search.toLowerCase());
			if (searchParams.has('maxrating'))
			{ maxrating = searchParams.get('maxrating'); }
			else
			{ maxrating = this.getCookie('maxrating'); }

			switch(maxrating.toLowerCase())
			{
				case '1':
					return 1;
				case 'mature':
					return 1;
				case '2':
					return 2;
				case 'explicit':
					return 2;
				default:
					return 0;
			}
		},
		getCookie(cookieName) {
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
			return '';
		},
		commafy(x)
		{ // from https://stackoverflow.com/a/2901298
			let parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		},
		prettyTime(time, fixed=2)
		{
			let conversion = 1;
			let units = 'seconds';
			if (time > 31556952)
			{
				conversion = 1 / 31556952;
				units = 'years';
			}
			else if (time > 2592000)
			{
				conversion = 1 / 2592000;
				units = 'months';
			}
			else if (time > 86400) // 24 hours in seconds
			{
				conversion = 1 / 86400;
				units = 'days';
			}
			else if (time > 5400) // 90 minutes in seconds
			{
				conversion = 1 / 3600;
				units = 'hours';
			}
			else if (time > 60)
			{
				conversion = 1 / 60;
				units = 'minutes';
			}
			else if (time < 0.000001)
			{
				conversion = 1000000000;
				units = 'nanoseconds';
			}
			else if (time < 0.001)
			{
				conversion = 1000000;
				units = 'microseconds';
			}
			else if (time < 1)
			{
				conversion = 1000;
				units = 'milliseconds';
			}
			return (time * conversion).toFixed(fixed) + ' ' + units;
		},
	},
	created() {
		this.topResult = this.results.shift();
	},
}
</script>

<style scoped>
i
{
	top: -0.1em;
	position: absolute;
	right: -25px;
}
span
{
	position: relative;
	margin: 0 0 8px;
	display: inline-block;
}

.top
{
	width: 800px;
	max-width: calc(100% - 50px);
	margin: 0 auto;
	position: relative;
	padding: 0;
}

</style>
