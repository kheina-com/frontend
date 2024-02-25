<template>
	<form>
		<input ref='file' @input='fileAdded' :id='id' type='file' size='50' autocomplete='off'>
		<label @drop.prevent='onDrop' @dragenter.prevent @dragover.prevent @click.right.stop='rightClick' :for='id' class='interactable upload'>
			<slot v-if='hasSlot && showSlot'/>
			<Media v-else-if='hasFile' :mime='file.type' :src='src' :link='false' v-model:width='width' v-model:height='height' type='block'/>
			<div v-else>
				<i class='material-icons'>upload_file</i>
				{{isMobile ? 'Tap' : 'Click or Drag'}} to Upload File
			</div>
		</label>
	</form>
</template>

<script>
import { ref } from 'vue';
import { isMobile } from '@/config/constants';
import Media from '@/components/Media.vue';

export default {
	name: 'FileField',
	props: {
		file: File,
		showSlot: {
			type: Boolean,
			default: true,
		},
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
			isMobile,
			hasFile: false,
			src: null,
			width: null,
			height: null,
		};
	},
	setup() {
		const file = ref(null);
		return {
			file,
		};
	},
	created() {
		document.addEventListener('paste', this.listener);
	},
	destroyed() {
		document.removeEventListener('paste', this.listener);
	},
	methods: {
		listener(e) {
			if (!e.clipboardData) {
				return;
			}

			const items = e.clipboardData.items;
			if (!items) {
				return;
			}

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("image") !== -1) {
					// image
					this.addFile(items[i].getAsFile());
					e.preventDefault();
					return;
				}
			}
		},
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
		rightClick(event) {
			console.debug('test', event);
		},
	},
	computed: {
		hasSlot() {
			return Boolean(this.$slots.default);
		},
	},
	watch: {
		width(value) {
			this.$emit('update:width', value);
		},
		height(value) {
			this.$emit('update:height', value);
		},
	},
}
</script>

<style scoped>
label {
	width: 100%;
	padding: 25px;
	border-radius: var(--border-radius);
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
.loading * {
	pointer-events: none;
}
</style>
