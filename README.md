# slurpdir

[![Build Status](https://travis-ci.org/seangarner/slurpdir.svg?branch=master)](https://travis-ci.org/seangarner/slurpdir)

Read a directory tree structure and parse contents of files into js object.  Think require-dir for
all file types.

## async require
This library does enable async require albeit with caveats.  Requiring js in async mode should be
considered experimental.  These caveats only apply when slurping javascript files with the inbuilt
parser in async mode.

  - private method within a core node library used to parse the js; could break with any node upgrade
  - exports aren't cached like they are with require

## example
```js
// TODO
```
