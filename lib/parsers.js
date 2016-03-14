'use strict';

let Module = require('module').Module;

module.exports = {

  '.json' (input) {
    return JSON.parse(input.data.toString());
  },

  '.js' (input) {
    let parsed = require(input.filename);
    delete require.cache[input.filename];
    return parsed;

    //BROKEN: relative path requires from within files have wrong path
    // let js = new Module(input.filename, module);
    // js._compile(input.data.toString(), input.filename);
    // return js.exports;

    //BROKEN: can't require at all
    // var sandbox = {
    //   module: {
    //     exports: {}
    //   }
    // };
    // var code = `(function (module) {\n' + ${input.toString()} + '\n})(module)'`;
    // try {
    //   vm.runInNewContext(code, sandbox);
    // } catch (err) {
    //   return cb(err);
    // }
    // cb(null, sandbox.module.exports);
  }

};
