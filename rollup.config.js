import copy from 'rollup-plugin-copy';

const plugins = [
	copy({
		targets: [
			{
				src: './node_modules/vue/dist/vue.esm-browser.js',
				dest: './libs/',
			},
			{
				src: './node_modules/vue/dist/vue.esm-browser.prod.js',
				dest: './libs/',
			},
		]
	})
];

const watch = {
	exclude: ['node_modules/**'],
};

export default [
	{
		input: 'src/index.js',
		output: {
			file: 'build/index.js',
			format: 'es',
		},
		plugins,
		watch,
	}
];
