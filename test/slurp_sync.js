'use strict';

let chai = require("chai");
let sinon = require("sinon");
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let EventEmitter = require('events');
let path = require('path');
let slurpdir = require('..');

function assetPath(id) {
  return path.join(__dirname, 'assets', id);
}

describe('slurpdir.sync', function() {

  it('should return an object of all files in a directory', () => {
    let tree = slurpdir.sync(assetPath('simple'));
    expect(tree).to.have.keys(['simple']);
    expect(tree.simple).to.equal('simple string');
  });

  it('should recurse directories when recurse:true', () => {
    let tree = slurpdir.sync(assetPath('recursive'), {recursive: true});
    expect(tree).to.have.keys(['foo', 'bar']);
  });

  it('should default to recurse:false', () => {
    let tree = slurpdir.sync(assetPath('recursive'), {});
    expect(tree).to.have.keys(['foo']);
  });

  it('should ignore unknown file types', () => {
    let tree = slurpdir.sync(assetPath('parsers'), {});
    expect(tree).to.not.have.keys(['jsonlines']);
  });

  it('should parse other file types with custom parsers', () => {
    let args = {
      parsers: {
        '.jsonlines': function (input) {
          return input.data.toString().split('\n').map((l) => l && JSON.parse(l));
        }
      }
    };
    let tree = slurpdir.sync(assetPath('parsers'), args);
    expect(tree).to.have.keys(['js', 'json', 'jsonlines']);
  });

  it('should disable built in parser when custom parser is null', () => {
    let args = {
      parsers: {
        '.js': null
      }
    };
    let tree = slurpdir.sync(assetPath('parsers'), args);
    expect(tree).to.not.have.keys(['js']);
  });

});
