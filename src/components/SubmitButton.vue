<template>
	<input id='submit' :value='value' accesskey='s' @click='onClick'>
	<label for='submit' class='interactable submit'>
		<slot/>
	</label>
</template>

<script>
export default {
	name: 'RadioButton',
	props: {
		value: String,
		onClick: Function,
	}
}
</script>

<style scoped>
.submit
{
	position: absolute;
	right: 0;
}
input#submit
{
	position: absolute;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}

</style>
