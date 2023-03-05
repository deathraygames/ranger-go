const isWindows = (process.platform === 'win32');
const linebreakStyle = (isWindows ? 'windows' : 'unix');

module.exports = {
	extends: 'airbnb-base',
	// plugins: ['jest']
	env: {
		browser: true,
		// 'jest/globals': true,
	},
	globals: {

	},
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-tabs': ['warn', { allowIndentationTabs: true }],
		'linebreak-style': ['error', linebreakStyle],
		'import/extensions': ['warn', 'always'],
		'arrow-body-style': ['warn', 'as-needed'],
		'no-use-before-define': ['warn', { functions: true, classes: true }],
		// 'no-console': ['warn', { allow: ['warn', 'error'] }],
		'max-lines': ['error', { max: 500, skipComments: true }],
		'object-curly-newline': ['warn', { multiline: true, minProperties: 10 }],
	},
};
