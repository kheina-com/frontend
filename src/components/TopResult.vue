<template>
	<!-- eslint-disable vue/require-v-for-key-->
	<span class='divider'>Top result</span>
	<DivLink class='source' id='topresult' :link='sources.length === 1 ? sources[0].source : null'>
		<img :src='imageUrl()' class='thumbnail' v-if='maxRating >= rating'>
		<div class='image' v-else>
			<h2 :style='ratingColor(rating)'>
				{{getRatingFromId(rating)}}
			</h2>
		</div>
		<h2 id='title'>{{sources[0].title}}</h2>
		<span><span id='artist'>Artist{{sources.length !== 1 ? 's' : ''}}: {{sources.map(item => item.artist).join(', ')}}</span><br>
		<span id='rating'>Rating: {{getRatingFromId(rating)}}</span><br>
		<span id='similarity'>Similarity: {{similarity.toFixed(1)}}%</span></span>
		<div class='links' v-if='sources.length === 1'>
			<p>{{getWebsiteNameFromId(sources[0].websiteid)}}</p>
			<img :src='getWebsiteImageFromId(sources[0].websiteid)' :alt='getWebsiteNameFromId(sources[0].websiteid)'/>
		</div>
		<div class='links' v-else>
			<a v-for='source in sources' :href='source.source'>
				<p>{{getWebsiteNameFromId(source.websiteid)}}</p>
				<img :src='getWebsiteImageFromId(source.websiteid)' :alt='getWebsiteNameFromId(source.websiteid)'/>
			</a>
		</div>
		<h3 class='similarity' :style='similarityColor()'>{{similarity.toFixed(1)}}%</h3>
	</DivLink>
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
		similarity: Number,
		sources: Array,
		maxRating: Number,
	},
	components: {
		DivLink,
	},
	data() {
		return {
			rating: Math.max(...this.sources.map(item => item.rating)),
		}
	},
	methods: {
		imageUrl() {
			return 'https://cdn.kheina.com/file/kheinacom/' + this.sources[0].sha1 + '.jpg';
		},
		ratingColor(id) { // rating id
			return 'color: ' + (id <= 1 ? 'var(--mature)': 'var(--explicit)');
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
		similarityColor() {
			let matchcolor = 0x00ff00; // green
			let falsecolor = 0xff0000; // red
			return 'color: #' + this.lerpColor(falsecolor, matchcolor, this.similarity / 100).toString(16).slice(1);
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
}
</script>

<style scoped>
.similarity
{
	position: absolute;
	font-weight: bold;
	right: 8px;
	bottom: 8px;
	margin: 0;
	/* background: var(--bg2color); */
}

.top .source h2
{
	left: 8px;
	position: relative;
	white-space: nowrap;
	overflow: hidden;
}
.top .image h2
{
	top: 64px;
	left: 64px;
	display: inline-block;
	transform: translate(-50%,-50%);
}
.top .image
{
	float: left;
	width: 128px;
	height: 128px;
}
.top .source img.thumbnail
{
	max-width: 128px;
	max-height: 100%;
	top: 0;
	transform: none;
}
.top span.divider
{ display: inline-block; }
.top span
{ 
	position: relative;
	left: 25px;
	padding: 0 0 8px;
}
.top .source span
{ left: 8px; }
.top div.links
{
	top: 0;
	right: 0;
	margin: 0;
	max-height: 220px;
	overflow-y: scroll;
	text-align: right;
	position: absolute;
	padding: 8px 8px 16px 50px;
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50px, var(--bg2color) 100%);
}
.top .links a
{
	margin: 5px;
	display: block;
}
.top .links img
{
	height: 1em;
	margin: 0 0 -2px;	
}
.top .source
{
	display: block;
	margin: 0 0 25px;
	text-align: left;
	overflow: hidden;
}
.top p
{
	display: inline-block;
	padding: 0 8px 0 0;
}

</style>
