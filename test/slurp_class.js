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

describe('Slurp class', () => {

  it('should return an event emitter', () => {
    expect(new slurpdir.Slurp({dir: assetPath('simple')})).to.be.an.instanceof(EventEmitter);
  });

  it('should emit files as they are parsed', (done) => {
    let spy = sinon.spy();
    new slurpdir.Slurp({dir: assetPath('simple')})
      .once('error', done)
      .once('file', (name, content) => {
        expect(name).to.equal('simple');
        expect(content).to.equal('simple string');
        done();
      });
  });

  it('should emit end when done', (done) => {
    new slurpdir.Slurp({dir: assetPath('simple')})
      .once('error', done)
      .once('end', done);
  });

  it('should emit end when done even if there were no files found', (done) => {
    new slurpdir.Slurp({dir: assetPath('___does_not_exist')})
      .once('error', done)
      .once('end', done);
  });

  it('should emit an error if a file fails parsing', (done) => {
    let spy = sinon.spy();
    new slurpdir.Slurp({dir: assetPath('bad_json')})
      .once('error', (err) => {
        expect(err).to.have.property('message').which.contains('bad');
        done();
      });
  });

});
