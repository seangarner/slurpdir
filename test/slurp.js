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

describe('slurpdir', function() {

  it('should callback an object of all files in a directory', (done) => {
    slurpdir(assetPath('simple'), (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['simple']);
      expect(tree.simple).to.equal('simple string');
      done();
    });
  });

  it('should recurse directories when recurse:true', (done) => {
    slurpdir(assetPath('recursive'), {recursive: true}, (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['foo', 'bar']);
      done();
    });
  });

  it('should default to recurse:false', (done) => {
    slurpdir(assetPath('recursive'), (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['foo']);
      done();
    });
  });

  it('should ignore unknown file types', (done) => {
    slurpdir(assetPath('parsers'), (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['js', 'json']);
      done();
    });
  });

  it('should not treat extensions case sensitively', (done) => {
    slurpdir(assetPath('uppercase'), (err, tree) => {
      if (err) return done(err);
      expect(Object.keys(tree)).to.have.length(1);
      done();
    });
  });

  it('should treat basenames case sensitively', (done) => {
    slurpdir(assetPath('both_cases'), (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['lower', 'upper']);
      done();
    });
  });

  it('should parse other file types with custom parsers', (done) => {
    let args = {
      parsers: {
        '.jsonlines': function (input) {
          return input.data.toString().split('\n').map((l) => l && JSON.parse(l));
        }
      }
    };
    slurpdir(assetPath('parsers'), args, (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['js', 'json', 'jsonlines']);
      done();
    });
  });

  it('should disable built in parser when custom parser is null', (done) => {
    let args = {
      parsers: {
        '.js': null
      }
    };
    slurpdir(assetPath('parsers'), args, (err, tree) => {
      if (err) return done(err);
      expect(tree).to.have.keys(['json']);
      done();
    });

  });

});
