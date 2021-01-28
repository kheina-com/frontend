module.exports = {
	extends: [
		// add more generic rulesets here, such as:
		// 'eslint:recommended',
		'plugin:vue/vue3-recommended'
	],
	rules: {
		// override/add rules settings here, such as:
		// 'vue/no-unused-vars': 'error'
		'vue/valid-template-root': 0,
		'vue/no-multiple-template-root': 0,
	}
}
