const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const babel = require('babel-core')
const minify = require("babel-minify");

let ID = 0

const createAsset = (filename) => {
    // read content of the javascript file
    const content = fs.readFileSync(filename, 'utf-8')

    // parse javascript code and create abstract syntax tree
    const ast = babylon.parse(content, {sourceType: 'module'})

    // here will be import declarations of the js file
    const dependencies = []

    // parse syntax tree 
    traverse(ast, {
        ImportDeclaration: ({ node }) => { // import declaration in the file
            // every node describes import declaration 
            dependencies.push(node.source.value) // list of the relative paths
        },
    })

    const id = ID++;

    const { code } = babel.transformFromAst(ast, null, {
        presets: ['env'] // transform esnext to es5
    })

    return {
        id, filename, dependencies, code
    }
}

const createGraph = (entryFile) => {
    const mainAsset = createAsset(entryFile)

    const queue = [mainAsset];

    for (const asset of queue) {
        const dirname = path.dirname(asset.filename)

        // key is relativePath (path in require function) and id (id of the module. see: let ID = 0)
        asset.mapping = {}

        asset.dependencies.forEach(relativePath => {
            let absolutePath = path.join(dirname, relativePath)

            // in case require('./name') (without file extension)
            if (!absolutePath.endsWith('.js')) {
                absolutePath = absolutePath.concat('.js')
            }

            const child = createAsset(absolutePath)

            asset.mapping[relativePath] = child.id

            // next iteration
            queue.push(child)
        })
    }

    return queue
}

const bundle = (graph) => {
    let modules = '';

    // to emulate common js modules in browser 
    // wrap every module with function (require, module, exports)
    // mod.code - es5 code, mod.mapping - {path: id}

    graph.forEach(mod => {
        modules += `${mod.id}: [
            function (require, module, exports) { ${mod.code} },
            ${JSON.stringify(mod.mapping)}
        ],`
    })

    const result = `
        (function(modules) {
            function require(id) {
                const [fn, mapping] = modules[id]

                // when we call require in common js module, localRequire will be executed
                function localRequire(relativePath) {
                    return require(mapping[relativePath])
                }

                // exports will be filled with exported from module objects and methods
                const module = {exports: {}}

                fn(localRequire, module, module.exports)

                // then we return it to allow another module to use exported values
                return module.exports;
            }

            require(0)
        })({
            ${modules}
        })
    `

    return result;
}

const graph = createGraph('./example/index.js')
const result = bundle(graph)
const {code} = minify(result)

fs.writeFileSync(path.resolve(__dirname, 'dist', 'index.js'), code)

console.log(result)

