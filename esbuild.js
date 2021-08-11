const esbuild = require('esbuild')
const vuePlugin = require('esbuild-vue')
let [node, filename, entry, bundle] = process.argv

esbuild.build({
	entryPoints: [bundle ? require.resolve(entry) : entry],
	bundle: !!bundle,
	format: 'esm',
	loader: {
		'.js': 'jsx',
		'.css': 'css'
	},
	jsxFactory: 'h',
	jsxFragment: 'h',
	sourcemap: true,
  sourcesContent: false,
	plugins: [
		vuePlugin()
	]
})