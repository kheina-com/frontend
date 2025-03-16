<template>
	<form>
		<input @input='fileAdded' :id='id' type='file' size='50' autocomplete='off'>
		<label @drop.prevent='onDrop' @dragenter.prevent @dragover.prevent @click.right.stop='rightClick' :for='id' class='interactable upload'>
			<slot v-if='$slots.default && showSlot'/>
			<Media v-else-if='file' :mime='file.type' :src='src' v-model:width='width' v-model:height='height' :controls='false' type='block' autoplay/>
			<div v-else>
				<i class='material-icons'>upload_file</i>
				{{isMobile ? 'Tap' : 'Click or Drag'}} to Upload File
			</div>
		</label>
	</form>
</template>
<script setup lang='ts'>
import { onMounted, onUnmounted, ref, toRef, watch, type Ref } from 'vue';
import { isMobile } from '@/config/constants';
import Media from '@/components/Media.vue';

const props = withDefaults(defineProps<{
	file?:     File,
	showSlot?: boolean,
	id?:       string,
	width:     number,
	height:    number,
}>(), {
	showSlot: true,
	id: "file-field",
});

const file: Ref<File | undefined> = toRef(props, "file");
const src: Ref<string | undefined> = ref();
const width: Ref<number> = ref(props.width);
const height: Ref<number> = ref(props.height);

const emits = defineEmits([
	"update:file",
	"update:width",
	"update:height",
]);

onMounted(() => document.addEventListener("paste", listener));
onUnmounted(() => document.removeEventListener("paste", listener));

function listener(e: ClipboardEvent) {
	if (!e.clipboardData) return;

	const items = e.clipboardData.items;
	if (!items) return;

	for (let i = 0; i < items.length; i++) {
		const f = items[i].getAsFile();
		if (f && f.type.indexOf("image") !== -1) {
			// image
			addFile(f);
			e.preventDefault();
			return;
		}
	}
}

function addFile(f: File) {
	file.value = f;
	emits("update:file", f);
}

function fileAdded(event: Event) {
	if (event.target) {
		const target = (event.target as HTMLInputElement)
		if (target.files)
		addFile(target.files[0]);
	}
}

function onDrop(event: DragEvent) {
	if (event.dataTransfer && event.dataTransfer.files)
	addFile(event.dataTransfer.files[0]);
}

function rightClick(event: MouseEvent) {
	console.debug('test', event);
}

watch(width, (value?: number) => emits("update:width", value));
watch(height, (value?: number) => emits("update:height", value));
watch(file, (f?: File) => {
	if (src.value) {
		window.URL.revokeObjectURL(src.value);
		console.debug("[FileField] revoked", src.value);
		src.value = undefined;
	}
	if (f) {
		src.value = window.URL.createObjectURL(f);
		console.debug("[FileField] file:", f, "src:", src.value);
	}
});
</script>

<style scoped>
label {
	width: 100%;
	padding: var(--margin);
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
