# slurpdir

[![Build Status](https://travis-ci.org/seangarner/slurpdir.svg?branch=master)](https://travis-ci.org/seangarner/slurpdir)

Read a directory tree structure and parse contents of files into js object.  Think require-dir for
all file types (bring your own parser).

## example
```js
const ini = require('ini');
const yaml = require('yaml');
const slurpdir = require('slurpdir');

let args = {
  dir: __dirname,
  recursive: true,
  parsers: {
    ini: (input) => ini.parse(input.data.toString()),
    yaml: (input) => yaml.eval(input.data.toString())
  }
};
new slurpdir.Slurp({dir, recursive: true})
  .on('file', (name, data, path) => {
    console.log(name, Object.keys(data));
  })
  .once('end', () => console.log('done!'););
```

## callback
There's also a callback interface.
```js
slurpdir(__dirname, {recursive: true}, (err, tree) => {
  console.log(Object.keys(tree));
});
```

## sync
Need sync?  Ok.
```js
let tree = slurpdir.sync(__dirname, {recursive: true});
console.dir(tree);
```

## a note on the js parser
When running in async mode and parsing javascript files slurp will actually use node's `require` to
parse which means that it's not actually async.  If you check the source for `parsers.js` you will
find a couple of commented parsers for js which do enable async parsing of js, however both methods
have caveats.
