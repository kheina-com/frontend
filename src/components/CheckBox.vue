<template>
	<!-- eslint-disable vue/require-v-for-key -->
	<div>
		<input
			type='checkbox'
			:name='name'
			:value='checked'
			:id='id'
			@click='emitValue'
			:checked='checked'
			v-if='!skipInput'
		>
		<label ref='label' :for='id' >
			<div class='checkmark'>
				<div/>
			</div>
			<slot/>
		</label>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'CheckBox',
	props: {
		name: String,
		checked: Boolean,
		id: String,
		skipInput: {
			type: Boolean,
			default: null,
		},
		border: {
			type: Boolean,
			default: true,
		},
		nested: {
			type: Boolean,
			default: false,
		}
	},
	emits: [
		'update:checked',
	],
	setup() {
		const label = ref(null);

		return {
			label,
		};
	},
	created() {
		this.$emit('update:checked', this.checked);
	},
	mounted() {
		if (this.checked)
		{ this.$refs.label.classList.add('checked'); }
		else
		{ this.$refs.label.classList.remove('checked'); }
		if (this.border)
		{ this.$refs.label.classList.add('border'); }
		if (this.nested)
		{ this.$refs.label.classList.add('nested'); }
	},
	methods: {
		getName(index) {
			return index.split(/[\-\_]/).join(' ');
		},
		emitValue(event) {
			this.$emit('update:checked', event.target.checked);
		}
	},
	watch: {
		checked(value) {
			if (value)
			{ this.$refs.label.classList.add('checked'); }
			else
			{ this.$refs.label.classList.remove('checked'); }
		},
	},
}
</script>

<style scoped>
input {
	position: absolute;
	display: none;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
label {
	cursor: pointer;
	margin: 0;
	display: inline-flex;
	white-space: nowrap;
	align-items: center;
	padding-left: 0.25em;
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
label:hover, label:active, label:focus {
	color: var(--icolor);
}

label.border {
	display: inline-flex;
	padding: 0.5em 1em;
	border: var(--border-size) solid var(--bordercolor);
	background: var(--bg2color);
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
	border-radius: var(--border-radius);
}
label.border:hover, label.border:active, label.border:focus {
	border-color: var(--borderhover);
	box-shadow: 0 0 10px 3px var(--activeshadowcolor);
}
label div.checkmark {
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
.nested label div.checkmark {
	background: var(--bg2color);
}
label div.checkmark div {
	border: solid 0 #0000;
	border-width: 0;
	position: absolute;
	-webkit-transition: var(--transition) var(--fadetime);
	-moz-transition: var(--transition) var(--fadetime);
	-o-transition: var(--transition) var(--fadetime);
	transition: var(--transition) var(--fadetime);
}
label div.checkmark div {
	left: 0.35em;
	top: 0.15em;
	width: 0.3em;
	height: 0.55em;
}

input:checked + label div.checkmark div, label.checked div.checkmark div {
	border-color: var(--icolor);
	border-width: 0 0.1875em 0.1875em 0;
	-webkit-transform: rotate(45deg);
	-ms-transform: rotate(45deg);
	transform: rotate(45deg);
}

/* THEME OVERRIDES */
html.light .checkmark, html.midnight .checkmark, html.terminal .checkmark, html.wikipedia .checkmark, html.high-contrast-dark .checkmark {
	border: solid var(--border-size) var(--bordercolor);
}
</style>
