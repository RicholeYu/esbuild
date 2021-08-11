const esbuild = require('esbuild')
const vuePlugin = require('esbuild-vue')

esbuild.build({
	entryPoints: [require.resolve('vue')],
	bundle: true,
	format: 'esm',
	loader: {
		'.js': 'jsx',
		'.css': 'css'
	},
	jsxFactory: 'h',
	jsxFragment: 'h',
	plugins: [
		vuePlugin()
	]
})