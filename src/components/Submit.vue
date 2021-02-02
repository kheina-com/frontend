<template>
	<input id='submit' :value='value' accesskey='s' @click='onClick'>
	<label for='submit' class='interactable submit'>
		<slot/>
	</label>
</template>

<script>
export default {
	name: 'Submit',
	props: {
		value: String,
		onClick: {
			type: Function,
			default: () => { },
		},
	}
}
</script>

<style scoped>
.submit
{
	right: 0;
}
input#submit
{
	display: none;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}

</style>
