<template>
	<main id='feature'>
		<Loading :isLoading='isStageLoading' v-if='isStageUpload'>
			<template v-slot:onLoad>
				<ProgressBar :fill='uploadProgress' textColor='#000000'>{{uploadProgress < 1 ? 'uploading...' : 'processing...'}}</ProgressBar>
			</template>
			<Title static>Reverse Image Search<template v-slot:super><a href='https://gitlab.com/kheina.com'>beta</a></template></Title>
			<Subtitle static>
				{{(stats && stats.hasOwnProperty('images')) ? commafy(stats.images) : ''}} images - 
				{{(stats && stats.hasOwnProperty('artists')) ? commafy(stats.artists) : ''}} artists - 
				{{(stats && stats.hasOwnProperty('sources')) ? commafy(stats.sources) : ''}} sources
			</Subtitle>
			<form action='' method='post' enctype='multipart/form-data' class='centerx'>
				<p>Search via file</p>
				<FileField id='file' name='file'/>
				<p>...or by url</p>
				<UrlField id='url' name='url'/>
				<p>Maximum rating</p>
				<RadioButtons
					name='maxrating'
					:onClick='setCookie'
					:data='[
						{ val: 0, content: "General" },
						{ val: 1, content: "Mature" },
						{ val: 2, content: "Explicit" },
					]'
				/>
				<Submit :onClick='search'>Submit »</Submit>
			</form>
			<p class='center'>
				maximum file size: 8192 KB<br>
				supported file types are: .jpg, .png, and .gif<br>
				maximum image size: 56,250,000 pixels (7500x7500)<br>
				image database updates every ~15 minutes (last updated <LastUpdated :stats='stats'/>)
			</p>
		</Loading>
		<SearchResults v-else-if='isStageResults' v-bind='results'/>
	</main>
</template>

<script>
import { setCookie, commafy } from '@/utilities';
import RadioButtons from '@/components/RadioButtons.vue';
import Submit from '@/components/Submit.vue';
import UrlField from '@/components/UrlField.vue';
import FileField from '@/components/FileField.vue';
import Loading from '@/components/Loading.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import SearchResults from '@/components/SearchResults.vue';
import LastUpdated from '@/components/LastUpdated.vue';
import Subtitle from '@/components/Subtitle.vue';
import Title from '@/components/Title.vue';

export default {
	name: 'Home',
	props: {
		stats: {
			type: Object,
			default: Object(),
		},
	},
	data() {
		return {
			// stages:
			// 0: default, displays form
			// 1: loading, display loading and progress bar
			// 2: got response, display results
			searchStage: 0,
			uploadProgress: 0,
			results: null,
			setCookie: setCookie,
		}
	},
	components: {
		RadioButtons,
		Submit,
		UrlField,
		FileField,
		Loading,
		ProgressBar,
		SearchResults,
		LastUpdated,
		Subtitle,
		Title,
		Error,
	},
	computed: {
		isStageUpload()
		{ return this.searchStage >= 0 && this.searchStage < 2; },
		isStageLoading()
		{ return this.searchStage === 1; },
		isStageResults()
		{ return this.searchStage > 1; },
	},
	methods: {
		search() {
			let form = document.querySelector('form.centerx');
			let formurl = form.querySelector('input#url');
			let formfile = form.querySelector('input#file');

			if (formfile.value || formurl.value.startsWith('http:') || formurl.value.startsWith('https:'))
			{
				this.searchStage += 1;

				if (formfile.value)
				{ this.sendApiCall('file', formfile.files[0]); }
				else if (formurl.value)
				{ this.sendApiCall('url', formurl.value); }
			}
		},
		sendApiCall(field, data) {
			let formdata = new FormData();
			formdata.append(field, data);

			let ajax = new XMLHttpRequest();

			// this.responseHandler(undefined);
			// return;

			ajax.upload.addEventListener('progress', event => this.uploadProgress = (event.loaded / event.total) * 100, false);
			ajax.addEventListener('load', this.responseHandler, false);
			ajax.addEventListener('error', this.errorHandler, false);
			// ajax.addEventListener('abort', abortHandler, false);

			ajax.open('POST', 'https://api.kheina.com/v1/search'); // this needs to be changed for local search testing

			ajax.send(formdata);
		},
		responseHandler(event) {
			try
			{
				let response = JSON.parse(event.target.responseText);

				// validate data here
				if (response.hasOwnProperty('error') && response.error)
				{
					this.searchStage = -1;
					this.results = {
						error: response.error,
						message: '	stacktrace:\n' + response.stacktrace.join('').replace(/\s*$/,''),
					};
				}
				else
				{
					this.searchStage += 1;
					this.results = response;
				}
			}
			catch (error)
			{
				this.searchStage = -1;
				this.results = {
					error: 'An error has occurred in your browser during an API call.',
					dump: error,
				};
			}
		},
		errorHandler(event) {
			this.searchStage = -1;
			this.$store.commit(
				'error',
				'An error has occurred in your browser during an API call.',
				event.target.responseText ?? event,
			);
		},
	},
}
</script>

<style scoped>
form .text
{
	width: 100%;
	color: var(--textcolor);
	padding: 0.5em;
}
form .text:hover
{ color: var(--icolor); }
form .text:active, form .text:focus
{ color: var(--textcolor); }
input
{
	display: inline-block;
	border: var(--border-size) solid var(--bordercolor);
	border-radius: var(--border-radius);
	background: var(--bg2color);
	color: var(--textcolor);
	font-size: 1em;
	padding: 1px 3px;
}
form
{
	width: 800px;
	max-width: calc(100% - 50px);
}
form span
{
	position: relative;
	left: 25px;
	padding: 0 0 2px;
	display: inline-block;
}
form .maxrating, form .integratedsearch
{
	margin: -14px 0 9px;
	padding: 0.5em 0;
	display: inline-block;
	width: calc(100% - 80px);
	line-height: 3;
}
form .maxrating input, form .integratedsearch input, form .submit input
{
	position: absolute;
	top: -100vh;
	opacity: 0;
	height: 0;
	width: 0;
}
form input
{ margin: 0 0 25px; }
form p
{ margin-left: 25px; }
</style>