<template>
	<div class='search-bar'>
		<div class='search-input'>
			<input v-model='value' @input='$emit(`update:value`, $event.target.value)' placeholder='Search' class='interactable text' @keydown.enter='func'>
			<div class='cover'/>
			<button @click='func'><i class='material-icons-round'>search</i></button>
		</div>
		<div class='search-help'>
			<router-link to='/search-help' class='icon'>
				<i class='material-icons-round' title='Search help'>help_outline</i>
			</router-link>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SearchBar',
	props: {
		func: Function,
		value: String,
	},
	emits: [
		'update:value',
	],
}
</script>

<style scoped>
.search-bar {
	display: flex;
	align-items: center;
	justify-content: center;
}
.search-bar input {
	min-width: 350px;
	width: 30vw;
}
.mobile .search-bar input:focus {
	width: 80vw;
	width: calc(100vw - 16rem);
	position: relative;
	z-index: 1000;
}
.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2.5rem;
	height: 2.5rem;
}
i {
	font-size: 1.2em;
	display: block;
}
.search-bar button {
	font-size: 1.2em;
	position: absolute;
	right: 0;
	top: 0;
	padding: 0.25em;
	height: 100%;
	border: none;
	background: none;
	color: var(--textcolor);
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
	cursor: pointer;
}
button:hover /*, button:active, button:focus */
{ color: var(--icolor); }
.search-input {
	position: relative;
}
.search-help {
	width: 0;
	z-index: 1;
}

.mobile .search-bar {
	font-size: 1.5em;
}

.search-bar .cover {
	position: absolute;
	background: linear-gradient(to right, #0000 0, var(--bg2color) 50%);
	padding-left: 1.5em;
	height: 1em;
	right: 0.5em;
	top: 0.5em;
}
</style>
