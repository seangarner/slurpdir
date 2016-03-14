'use strict';

let util = require('util');
let EventEmitter = require('events');
let fs = require('fs');
let path = require('path');
let glob = require('glob');
let async = require('async');
let mixIn = require('mout/object/mixIn');
let merge = require('mout/object/merge');
let isFunction = require('mout/lang/isFunction');
let filter = require('mout/object/filter');

const DEFAULT_PARSERS = require('./parsers');

function Slurp(options) {
  EventEmitter.call(this);

  let dir = options.dir;

  // merge in default parsers and remove null parsers
  let parsers = buildParsers(options.parsers);
  let parserNames = Object.keys(parsers);
  let pattern = getPattern(Object.keys(parsers), options.recursive);

  let globOptions = {
    cwd: dir,
    nosort: true,
    nocase: true
  };

  let inflight = 0;
  let finished = false;
  let aborted = false;

  new glob.Glob(pattern, globOptions)

    .once('error', (err) => {
      aborted = true;
      this.emit('error', err);
    })

    .once('end', () => {
      finished = true;
      if (inflight < 1) this.emit('end');
    })

    .on('match', (filename) => {
      if (aborted) return;
      inflight++;
      filename = path.join(dir, filename);
      fs.readFile(filename, (err, data) => {
        if (aborted) return;
        let parserName = parserNames.find((parserName) => satisfies(filename, parserName));
        let id = path.basename(filename.substr(0, filename.length - parserName.length));
        let content;
        try {
          content = parsers[parserName]({filename, data});
        } catch (err) {
          err.filename = filename;
          err.message = `error parsing [${filename}]: ${err.message}`;
          this.emit('error', err);
          aborted = true;
          return;
        }
        this.emit('file', id, content, filename);
        inflight--;
        if (finished && !inflight) setImmediate(() => aborted || this.emit('end'));
      });
    });

}

util.inherits(Slurp, EventEmitter);

function slurpdir(dir, options, callback) {
  if (isFunction(options)) {
    callback = options;
    options = null;
  }
  if (!options) options = {};

  let tree = {};

  new Slurp(merge(options, {dir}))
    .once('error', callback)
    .once('end', () => callback(null, tree))
    .on('file', (name, content) => tree[name] = content);
}

function slurpSync(dir, options) {
  if (!options) options = {};

  // merge in default parsers and remove null parsers
  let parsers = buildParsers(options.parsers);
  let parserNames = Object.keys(parsers);
  let pattern = getPattern(Object.keys(parsers), options.recursive);

  let globOptions = {
    cwd: dir,
    nosort: true,
    nocase: true
  };

  let files = glob.sync(pattern, globOptions);

  return files.reduce((memo, filename) => {
    filename = path.join(dir, filename);
    let data = fs.readFileSync(filename);
    let parserName = parserNames.find((parserName) => filename.endsWith(parserName));
    let id = path.basename(filename, parserName);
    try {
      memo[id] = parsers[parserName]({filename, data});
    } catch (err) {
      err.filename = filename;
      err.message = `error parsing [${filename}]: ${err.message}`;
      throw err;
    }

    return memo;
  }, {});

}

slurpdir.Slurp = Slurp;
slurpdir.sync = slurpSync;

module.exports = slurpdir;

function getPattern(parsers, recursive) {
  let prefix = recursive ? '**/' : '';
  let parserGlobs = parsers.map((ext) => `*${ext}`);
  return `${prefix}@(${parserGlobs.join('|')})`;
}

function buildParsers(parsers) {
  if (!parsers) return DEFAULT_PARSERS;
  parsers = mixIn({}, DEFAULT_PARSERS, parsers);
  return filter(parsers, (parser) => parser !== null && parser !== undefined);
}

function satisfies(filename, parserName) {
  return (new RegExp(`${parserName}$`, 'i')).test(filename);
}
