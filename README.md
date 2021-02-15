# mini-webpack

To emulate common js modules in browser we should wrap every module in function which receives 'require' 'module' and 'exports' as params. These words are keywords for commonjs modules.

Using AST we can parse every module and get dependencies of each module (all that was 'imported')
Then we should create a graph where each node will have ID, relativePath and mapping object (keyvalue pairs where key is an ID of imported module and value is relativepath)

Example of the graph

```js

[{
        id: 0,
        filename: './example/index.js',
        dependencies: ['./name'],
        code: '<es5 code of the file>',
        mapping: {
            './name': 1 // index.js imports and uses name property from name.js 
        }
    },
    {
        id: 1,
        filename: 'example/name.js',
        dependencies: [],
        code: '<es5 code of the file>',
        mapping: {} // name.js doesn't import anything
    }
]

```

Using babel we can covert each module to es5 (requrie and exports keywords are still there so we should define it)

from:
```js
// index.js
import { name } from './name';
console.log({ firstname: name, lastname: 'Skr', age: 20 });

// name.js
export const name = 'Daniel';

```
to:
```js
// index.js
"use strict";
var _name = require("./name");

console.log({
    firstname: _name.name,
    lastname: 'Skr',
    age: 20
});

// name.js
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var name = exports.name = 'Daniel';
```

Then we should require root module and write this code
```js
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
            
```
aasdf       
