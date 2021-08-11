const child_process = require('child_process')

async function run (filename, bundle = '') {
	const child = child_process.fork('./esbuild.js', [filename, bundle], {
		silent: true
	})
	let data = []
	for await (let chunk of child.stdout) data.push(chunk)
	return Buffer.concat(data).toString()
}

function handleImport (fileContent) {
	let reg = /from.*?['"](.+?)['"]/g
	fileContent = fileContent.replace(reg, function (str, module) {
		if (!/^\..+/.test(module)) {
			return `from "/node_modules/${module}"`
		} else {
			return str
		}
	})
	return fileContent
}

const express = require('express')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const app = express()
const resolve = file => require.resolve(path.resolve('src', file))

// app.use(express.static(path.join(__dirname)))

app.get('/', async (req, res) => {
	let result = await fs.promises.readFile('./public/index.html')
	res.end(result.toString())
})

app.get(/\.(js|vue)$/, async (req, res) => {
	let filepath = resolve(req.url.slice(1))
	let data = await run(filepath)
	res.setHeader('Content-Type', 'text/javascript')
	res.end(handleImport(data))
})

app.get(/\.png|jpg$/, async (req, res) => {
	let filepath = path.resolve('src', req.url.slice(1))
	res.setHeader('Content-Type', mime.lookup(filepath))
	res.end(await fs.promises.readFile(filepath))
})

app.get(/\.css$/, async (req, res) => {
	let filepath = path.resolve('src', req.url.slice(1))
	let result = await fs.promises.readFile(filepath)
	res.setHeader('Content-Type', 'text/javascript')
	res.end(`
		var style = document.createElement('style');
		style.innerText = \`${result.toString()}\`;
		document.head.appendChild(style);
	`)
})

app.get(/node_modules\//, async (req, res) => {
	let module = req.url.replace('/node_modules/', '')
	res.setHeader('Content-Type', 'text/javascript')
	console.log(module)
	let result = await run(module, '1')
	res.end(result)
})

app.listen(8000)