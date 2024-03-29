<template>
	<main>
		<div style='display: flex; flex-direction: column; align-items: center'>
			I haven't gotten around to building a proper privacy policy yet, but here's the gist:
			<p style='margin-bottom: 0; text-align: center; padding-top: var(--margin)'>
				we don't store any private or personally-identifiable information, not even your email.
				<br>
				in order to perform logins (with your email), we use a 512-byte variant of the <a href='https://en.wikipedia.org/wiki/SHA-3'>sha-3</a> hash.
				<br>
				this allows us to securely perform logins (and other account verifications) without storing your email. no one at fuzz.ly or otherwise is able to access your email
			</p>
		</div>
		<ThemeMenu/>
	</main>
</template>

<script>
import ThemeMenu from '@/components/ThemeMenu.vue';

export default {
	name: 'Privacy',
	components: {
		ThemeMenu,
	},
	computed: {
	},
	methods: {
	},
}
</script>

<style scoped>
main {
	background: var(--main);
	position: relative;
	padding: var(--margin);
}
</style>
