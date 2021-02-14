<template>
	<div :class='name'>
		<span v-for='i in data'>
			<input type='radio' :name='name' :value='i.val' :id='name+i.val' @click='onClick(name, i.val)' :checked='i.val === data[0].val ? true : false'>
			<label :for='name+i.val' >
				<div class='radio'>
					<div></div>
				</div>{{i.content}}
			</label>
		</span>
	</div>
</template>

<script>
export default {
	name: 'RadioButtons',
	props: {
		name: String,
		value: String,
		id: String,
		checked: Boolean,
		onClick: {
			type: Function,
			default() { },
		},
		onStart: {
			type: Function,
			default() { },
		},
		data: Array,
	},
	mounted()
	{ return this.onStart(name); },
}
</script>

<style scoped>
input
{
	position: absolute;
	display: none;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
label
{
	cursor: pointer;
	padding: 0.5em 1em;
	margin: 0 25px 0 0;
	border: 1px solid var(--bordercolor);
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	border-radius: 3px;
	white-space: nowrap;
}
.maxrating label:hover, .maxrating label:active, .maxrating label:focus,
label:hover, label:active, label:focus
{
	border-color: var(--borderhover);
	color: var(--icolor);
}
label:hover
{ box-shadow: 0 0 10px 3px var(--activeshadowcolor); }
label div.checkmark, label div.radio
{
	position: relative;
	display: inline-block;
	left: 0;
	padding: 0;
	margin: 0 0.5em 0 -0.3em;
	height: 1.2em;
	width: 1.2em;
	top: 0.25em;
	border-radius: 3px;
	background: var(--bg1color);
	pointer-events: none;
}
label div.checkmark div, label div.radio div
{
	border: solid 0 #0000;
	border-width: 0;
	position: absolute;
	-webkit-transition: ease var(--fadetime);
	-moz-transition: ease var(--fadetime);
	-o-transition: ease var(--fadetime);
	transition: ease var(--fadetime);
}
label div.checkmark div
{
	left: 0.35em;
	top: 0.15em;
	width: 0.3em;
	height: 0.55em;
}
label div.radio div
{
	width: 150%;
	height: 150%;
	left: 50%;
	top: 50%;
	border-width: 0;
	border-radius: 50%;
	transform: translate(-50%, -50%);
}
input:checked + label div.radio div
{
	border-color: var(--icolor);
	border-width: 0.3em;
	width: 0;
	height: 0;
}
label div.radio
{
	border-radius: 50%;
	/* padding: 0.1em; */
}

</style>
