<template>
	<div class='radio-buttons'>
		<span v-for='i in data'>
			<input
				type='radio'
				:name='name'
				:value='getValue(i)'
				:id='name+getValue(i)'
				@click='emitValue(getValue(i))'
				:checked='getValue(i) === value'
			>
			<label :for='name+getValue(i)' >
				<div class='radio'>
					<div></div>
				</div>
				{{i.content}}
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
		data: Array,
	},
	emits: {
		'update:value': null,
		change: null,
	},
	methods: {
		getValue(index) {
			return String(index.value !== undefined ? index.value : index.content);
		},
		emitValue(index) {
			this.$emit(`update:value`, index);
			this.$emit(`change`, index);
		},
	},
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
	margin: 0;
	border: var(--border-size) solid var(--bordercolor);
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	border-radius: var(--border-radius);
	white-space: nowrap;
	display: flex;
	align-items: center;
	text-transform: capitalize;
}
span {
	margin: 0.375em 12.5px;
}
.radio-buttons {
	display: flex;
	flex-flow: wrap;
	margin: -0.375em -12.5px;
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
	display: block;
	left: 0;
	padding: 0;
	margin: 0 0.5em 0 -0.3em;
	height: 1.2em;
	width: 1.2em;
	border-radius: var(--border-radius);
	background: var(--bg1color);
	pointer-events: none;
}
label div.checkmark div, label div.radio div
{
	border: solid 0 #0000;
	border-width: 0;
	position: absolute;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
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
