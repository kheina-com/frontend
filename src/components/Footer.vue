<template>
	<footer class='footer'>
		<ProgressBar :fill='funding' :target='target' fillColor='var(--funding)' link='https://www.patreon.com/kheina' newTab>funding</ProgressBar>
		<ThemeButton/>
		<div class='anchor'>
			<a href='https://www.patreon.com/kheina' target='_blank' class='left'>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='7.846 7.798 47.363 47.34' class='external-logo patreon'>
					<path d='M7.846 30.818c0-11.027 8.96-21.366 20.775-22.843 8.468-.985 14.868 2.265 19.298 6.498 4.135 3.938 6.598 8.96 7.188 14.868.492 5.907-.787 11.027-4.233 15.852-3.446 4.727-10.24 9.945-18.708 9.945h-11.52V32.394c.099-5.022 1.772-9.354 7.877-11.422 5.317-1.575 11.52 1.378 13.391 6.991 1.969 6.006-.887 10.043-4.234 12.505s-8.566 2.462-12.012.099v7.778c2.265 1.083 5.12 1.378 7.188 1.28 7.482-1.084 13.292-5.317 15.754-11.717 2.561-6.794.787-14.671-4.529-19.594-6.4-5.219-13.391-6.499-20.874-2.855-5.218 2.659-8.861 8.074-9.748 13.981v25.699H7.945l-.099-24.321z'/>
				</svg> support the project
			</a>
			<a href='https://github.com/kheina-com' target='_blank' class='right'>
				view source code <svg viewBox='0 0 16 16' class='external-logo github'>
					<path fill-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'/>
				</svg>
			</a>
		</div>
		<p>Found a bug? <router-link :to='`/bug?url=${encodeURIComponent($route.fullPath)}`'>Report it here</router-link>.</p>
	</footer>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import ThemeButton from '@/components/ThemeButton.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { host } from '@/config/constants';
import { khatch } from '@/utilities';

const funding: Ref<number> = ref(0);
const target: Ref<string> = ref("Loading...");

function updateLoop() {
	khatch(`${host}/v1/config/funding`, {
		errorMessage: "Error Occurred While Fetching Funding",
		errorHandlers: {
			404: () => target.value = "Unavailable",
		},
	}).then(r => r.json())
	.then(r => {
		funding.value = Math.min(r.funds / r.costs, 1);

		// if for some fucking reason, our costs/funds exceed 52 bits of float precision, we can uncomment this.
		// const funds = r.funds.toString();
		// const costs = r.costs.toString();
		// this.target = `$${funds.substr(0, funds.length-2)}.${funds.substr(-2)} / $${costs.substr(0, costs.length-2)}.${costs.substr(-2)}`;

		target.value = `$${(r.funds / 100).toFixed(2)} / $${(r.costs / 100).toFixed(2)}`;
	});
	setTimeout(updateLoop, 300000);
}

updateLoop();
</script>

<style scoped>
.footer span {
	cursor: pointer;
	pointer-events: all;
	text-decoration: none;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}

.footer {
	min-height: 1.5em;
	margin: 0.25rem 0 0;
	font-size: 0.9rem;
	white-space: nowrap;
	padding: 0 var(--margin) var(--margin);
	text-align: center;
}
.footer p {
	text-align: center;
	position: relative;
}
.footer .anchor {
	left: 50%;
	left: calc(50% - var(--border-size));
	position: relative;
	height: 1.2em;
	width: var(--border-size);
	background: var(--textcolor);
}
.footer .anchor img, .header img {
	height: 1em;
	margin-bottom: -0.2em;
}
.footer .anchor .left {
	position: absolute;
	right: 0.5rem;
}
.footer .anchor .right {
	position: absolute;
	left: 0.5rem;
}
.external-logo {
	display: inline-block;
	overflow: visible !important;
	fill: currentColor;
	height: 1.2em;
	vertical-align: bottom;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
.patreon {
	fill: #ff5900;
}
a:hover .external-logo {
	fill: var(--interact);
}

/* THEME OVERRIDES */
html.solarized-dark .patreon,
html.solarized-light .patreon {
	fill: var(--red);
}
</style>
