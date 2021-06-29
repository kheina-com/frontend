<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div class='check-boxes'>
		<span v-for='i in data'>
			<input
				type='checkbox'
				:name='name'
				:value='getName(i)'
				:id='i'
				@click='emitValue'
				:checked='i === value'
			>
			<label :for='i' >
				<div class='checkmark'>
					<div/>
				</div>
				{{getName(i)}}
			</label>
		</span>
	</div>
</template>

<script>
export default {
	name: 'CheckBoxes',
	props: {
		name: String,
		value: Array[String],
		data: Array[String],
	},
	data() {
		return {
			checked: [],
		};
	},
	emits: {
		'update:value': null,
		change: null,
	},
	created() {
		this.$emit(`update:value`, this.checked);
		this.$emit(`change`, this.checked);
	},
	methods: {
		getName(index) {
			return index.split(/[\-\_]/).join(' ');
		},
		emitValue(event) {
			if (event.target.checked)
			{ this.checked.push(event.target.id); }
			else
			{ delete this.checked[this.checked.indexOf(event.target.id)]; }

			this.$emit(`update:value`, this.checked);
			this.$emit(`change`, this.checked);
		}
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
	margin: 0 25px 0 0;
}
.check-boxes {
	display: flex;
}
.check-boxes > :last-child {
	margin-right: 0;
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
input:checked + label div.checkmark div
{
	border-color: var(--icolor);
	border-width: 0 3px 3px 0;
	-webkit-transform: rotate(45deg);
	-ms-transform: rotate(45deg);
	transform: rotate(45deg);
}
label div.radio
{
	border-radius: 50%;
	/* padding: 0.1em; */
}

</style>
