<template>
	<!-- eslint-disable vue/no-multiple-template-root -->
	<form>
		<input ref='file' @input='fileAdded' :id='id' type='file' size='50' autocomplete='off'>
		<label @drop.prevent='onDrop' @dragenter.prevent @dragover.prevent :for='id' class='interactable upload'>
			<Media v-if='hasFile' :mime='file.type' :src='src' :link='false' :lazy='false' style='border-radius: 3px'/>
			<div v-else>
				<i class='material-icons'>upload_file</i>Drag or Click to Upload File
			</div>
		</label>
	</form>
</template>

<script>
import { ref } from 'vue';
import Media from '@/components/Media.vue';

export default {
	name: 'FileField',
	props: {
		file: File,
		id: {
			type: String,
			default: 'file',
		},
	},
	components: {
		Media,
	},
	data() {
		return {
			hasFile: false,
			src: null,
		};
	},
	setup() {
		const file = ref(null);
		return {
			file,
		};
	},
	methods: {
		readerOnLoad(reader) {
			this.src = reader.result;
			this.hasFile = true;
		},
		addFile(file) {
			this.$emit('update:file', file);
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.addEventListener('load', () => this.readerOnLoad(reader), false);
  		},
		fileAdded(event) {
			this.addFile(event.target.files[0]);
		},
		onDrop(event) {
			this.addFile(event.dataTransfer.files[0]);
		},
	},
	mounted() {
		// this.$refs.file.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
		// 	e.preventDefault();
		// 	e.stopPropagation();
		// });
		// this.$refs.file.on('dragover dragenter', function() {
		// 	$form.addClass('is-dragover');
		// });
		// this.$refs.file.on('dragleave dragend drop', function() {
		// 	$form.removeClass('is-dragover');
		// });
		// this.$refs.file.on('drop', function(e) {
		// 	droppedFiles = e.originalEvent.dataTransfer.files;
		// });
	},
}
</script>

<style scoped>
label {
	width: 100%;
	padding: 25px;
	border-radius: 3px;
    border-style: dashed;
    border-width: 2px;
}
label div {
	display: flex;
	align-items: center;
}
label i {
	margin-right: 0.25em;
}
input {
	display: none;
}
</style>
