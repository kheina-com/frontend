<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='page-links'>
		<b v-if='activePage === 1'>
			<i class='material-icons'>navigate_before</i>
		</b>
		<button @click='navigate(activePage - 1)' v-else>
			<i class='material-icons'>navigate_before</i>
		</button>
		<button @click='navigate(toPage)' v-for='toPage in pagesBeforeCurrent'>
			{{toPage}}
		</button>
		<b>
			{{activePage}}
		</b>
		<button @click='navigate(toPage)' v-for='toPage in pagesAfterCurrent'>
			{{toPage}}
		</button>
		<button @click='navigate(activePage + 1)' v-if='pagesAfterCurrent.length'>
			<i class='material-icons'>navigate_next</i>
		</button>
		<b v-else>
			<i class='material-icons'>navigate_next</i>
		</b>
	</div>
</template>

<script>
export default {
	name: 'ResultsNavigation',
	props: {
		navigate: Function,
		activePage: Number,
		totalPages: Number,
		pagesToShow: {
			type: Number,
			default: 3,
		},
	},
	computed: {
		pagesBeforeCurrent() {
			const pages = [];
			const min = Math.max(this.activePage - this.pagesToShow, 1);
			for (let i = min; i < this.activePage; i++) {
				pages.push(i);
			}
			return pages;
		},
		pagesAfterCurrent() {
			const pages = [];
			const max = Math.min(this.activePage + this.pagesToShow, this.totalPages);
			for (let i = this.activePage + 1; i <= max; i++) {
				pages.push(i);
			}
			return pages;
		},
	},
}
</script>

<style scoped>
.page-links {
	display: flex;
	align-content: center;
	justify-content: center;
	align-items: center;
}
.mobile .page-links {
	justify-content: space-between;
}
.page-links button, .page-links b {
	padding: 0.25em 0.5em;
}
.mobile .page-links button, .mobile .page-links b {
	padding: 0.5em 1em;
}
.page-links b {
	color: var(--subtle);
}
.page-links i {
	display: block;
}
</style>