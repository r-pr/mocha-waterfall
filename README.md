mocha-waterfall
===============

Runs test files with [mocha](https://mochajs.org/) sequentially.

It solves a problem when several test files open same port, mocha tries to run them simultaneously, and
one of them gets an error.

## Usage ##

Create file `runall.js`:

```
const MochaWaterfall = require('mocha-waterfall');

const mochaWaterfall = new MochaWaterfall({
    filenames: ['test1.js', 'test2.js'],
    failOnStderr: true,
    flags: ['bail', 'exit'],
    maxRestarts: 1,
});

mochaWaterfall.execute();
```

Then run `node runall.js`

### Usage with local `mocha` and `npx`

If you want to use locally installed `mocha`, you can specify `execCommand` option:

```
const mochaWaterfall = new MochaWaterfall({
    //...
    execCommand: 'npx mocha'

    // or specify relative path:
    // execCommand: '../node_modules/.bin/mocha'
});
```

## Options ##

| name         | type             | required | meaning             |
|:-------------|:-----------------|:---------|:--------------------|
| filenames    | array of strings | yes      | test files to execute |
| failOnStderr | boolean          | yes      | whether to stop execution when a test file writes to `stderr` |
| bail         | boolean          | no       | whether to run `mocha` with `--bail` flag; defaults to `false` |
| flags        | array of strings | no       | flags to execute `mocha` with; e.g. `['bail', 'exit']` will result in executing `mocha --bail --exit` |
| maxRestarts  | number           | no       | how many times to rerun failed test file; defaults to 0 |
| execCommand  | string           | no       | what command to use to start `mocha`
