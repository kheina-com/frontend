<template>
	<div class='toasts'>
		<div v-for='toast in $store.state.toasts' class='toast'>
			<div class='toast-body'>
				<button @click='close(toast.id)' class='close'><i class='material-icons-round'>close</i></button>
				<i class='material-icons-round icon'>{{toast.icon}}</i>
				<div>
					<p class='title'>{{toast.title}}</p>
					<p>
						{{toast.description}}
					</p>
				</div>
			</div>
			<CopyText :content='toast?.dump' class='copy-text'/>
		</div>
	</div>
</template>

<script>
import CopyText from '@/components/CopyText.vue'

export default {
	name: 'Toast',
	components: {
		CopyText,
	},
	methods: {
		close(toastId) {
			delete this.$store.state.toasts[toastId];
		},
	},
}
</script>

<style scoped>
.toasts {
	position: fixed;
	bottom: 0;
	pointer-events: none;
	width: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
}

.toast {
	position: relative;
	pointer-events: all;
	background: var(--bg2color);
	padding: 25px;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	margin-bottom: 25px;
	width: 20vw;
	min-width: 400px;
	box-shadow: 0 2px 3px 1px var(--shadowcolor);
}
.toast-body {
	display: flex;
}

.toast .icon {
	font-size: 3em;
	left: -10px;
	position: relative;
}

.copy-text {
	width: auto;
	margin: 10px 0 0;
}

.mobile .toasts div {
	width: 70vw;
}

.title {
	margin: 0 0 5px;
	padding: 0 0 5px;
	font-weight: bold;
	border-bottom: var(--border-size) solid var(--bordercolor);
}

p {

}

.close {
	position: absolute;
	top: 0;
	right: 0;
	padding: 10px;
}
.close:hover {
	color: var(--error);
}
</style>
