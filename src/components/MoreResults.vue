<template>
	<div class='more'>
		<DivLink class='source' v-for='result in results' :link='result.sources.length === 1 ? result.sources[0].source : null'>
			<div class='image'>
				<img :src='imageUrl(result)' class='thumbnail' v-if='maxRating >= getMaxRating(result)'>
				<h2 :style='ratingColor(getMaxRating(result))' class='centery' v-if='maxRating < getMaxRating(result)'>
					{{getRatingFromId(getMaxRating(result))}}
				</h2>
			</div>
			<div class='similarity right'>
				<span></span>
				<b :style='similarityColor(result)'>{{result.similarity.toFixed(1)}}%</b>
			</div>
			<p class='left' id='artist'>
				{{result.sources.map(item => item.artist).join(', ')}}
			</p>
			<div class='links'>
				<img :src='getWebsiteImageFromId(result.sources[0].websiteid)' :alt='getWebsiteNameFromId(result.sources[0].websiteid)' v-if='result.sources.length === 1' />
				<a v-for='source in result.sources' :href='source.source' v-else>
					<img :src='getWebsiteImageFromId(source.websiteid)' :alt='getWebsiteNameFromId(source.websiteid)'  />
				</a>
			</div>
		</DivLink>
	</div>
</template>

<script>
import DivLink from '@/components/DivLink.vue'

export default {
	name: 'TopResult',

	// sha1: String,
	// title: String,
	// artist: String,
	// rating: Number,
	// websiteid: Number,
	// source: String,
	props: {
		results: Array,
		maxRating: Number,
	},
	components: {
		DivLink,
	},
	methods: {
		imageUrl(result) {
			return 'https://cdn.kheina.com/file/kheinacom/' + result.sources[0].sha1 + '.jpg';
		},
		ratingColor(id) { // rating id
			return 'color: ' + (id <= 1 ? 'var(--mature)' : 'var(--explicit)');
		},
		getMaxRating(result) {
			return Math.max(...result.sources.map(item => item.rating));
		},
		getRatingFromId(id) {
			switch(id)
			{
				case 0:
					return 'General';
				case 1:
					return 'Mature';
				case 2:
					return 'Explicit';
			}
		},
		similarityColor(result) {
			let matchcolor = 0x00ff00; // green
			let falsecolor = 0xff0000; // red
			return 'color: #' + this.lerpColor(falsecolor, matchcolor, result.similarity / 100).toString(16).slice(1);
		},
		lerpColor(a, b, amount)
		{ // from https://gist.github.com/nikolas/b0cce2261f1382159b507dd492e1ceef
			amount = this.clamp(amount, 0, 1);
			const ar = a >> 16,
			ag = a >> 8 & 0xff,
			ab = a & 0xff,

			br = b >> 16,
			bg = b >> 8 & 0xff,
			bb = b & 0xff,

			rr = ar + amount * (br - ar),
			rg = ag + amount * (bg - ag),
			rb = ab + amount * (bb - ab);

			return (1 << 24) + (rr << 16) + (rg << 8) + (rb << 0);
		},
		clamp(x, lowerlimit, upperlimit)
		{
			if (x < lowerlimit)
			{ return lowerlimit; }
			if (x > upperlimit)
			{ return upperlimit; }
			return x;
		},
		getWebsiteNameFromId(id)
		{
			switch(id)
			{
				case 0:
					return 'Fur Affinity';
				case 1:
					return 'Ink Bunny';
				case 2:
					return 'Weasyl';
				case 3:
					return 'Furry Network';
			}
		},
		getWebsiteImageFromId(id)
		{
			switch(id)
			{
				case 0:
					return '/assets/furaffinity.png';
				case 1:
					return '/assets/inkbunny.png';
				case 2:
					return '/assets/weasyl.png';
				case 3:
					return '/assets/furrynetwork.png';
			}
		},
	},
	computed: {
		
	},
}
</script>

<style scoped>
.more
{
	text-align: center;
	margin: 0 12.5px -25px;
}
.more .source
{
	min-width: 128px;
	max-width: 256px;
	overflow: hidden;
	white-space: nowrap;
	margin: 0 12.5px 25px;
}
.more .source .thumbnail
{
	left: 50%;
	transform: translate(-50%, -50%);
}
.more .source .image
{ height: 128px; }
.more .source p.left
{
	text-align: left;
	max-width: 0;
	overflow: hidden;
	text-transform: capitalize;
	padding-right: 100%;
}
.more .source div.right
{
	position: absolute;
	right: 0;
}
.more .source div.right b
{
	background: var(--bg2color);
	position: relative;
	top: -0.2em;
	padding: 0 8px 0.1em 0;
}
.more .source div.right span
{
	background: linear-gradient(to right, #0000, var(--bg2color));
	height: 1.2em;
	width: 25px;	
	display: inline-block;
}
.more div.source div.links
{
	overflow-x: scroll;
	overflow-y: hidden;
	margin: 4px -8px -8px;
}
.more a.source div.links
{
	overflow: hidden;
	margin: 4px -8px 0;
}
.more .source div.links img
{
	height: 1em;
	position: relative;
}
.more .source div.links a
{ margin: 0 4px; }

</style>
