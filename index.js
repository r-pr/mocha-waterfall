const spawn = require('child_process').spawn;
const colors = require('./lib/console-colors');

/**
 * Main class.
 * 
 * @param {Object} options
 * @param {String[]} options.filenames
 * @param {Boolean} options.failOnStderr
 * @param {String} options.mochaDir
 */
function MochaWaterfall(options) {
    if (typeof options !== 'object' || !options)
        throw new Error('options must be an object');
    if (typeof options.filenames === 'undefined')
        throw new Error('options.filenames is required');
    if (!options.filenames.constructor || options.filenames.constructor !== Array)
        throw new Error('options.filenames must be an array');
    if (typeof options.mochaDir !== 'string')
        throw new Error('options.mochaDir must be a string');
    if (typeof options.failOnStderr !== 'boolean')
        throw new Error('options.failOnStderr must be a boolean');
    this._filenames = options.filenames.slice();
    this._mochaDir = options.mochaDir;
    this._failOnStderr = options.failOnStderr;
}

var firstTest = true;
var total;
var current = 0;
var start = Date.now();

MochaWaterfall.prototype.execute = function executeTests() {
    var filenames = this._filenames;
    if (firstTest){
        total = filenames.length;
        firstTest = false;
    }

    if (filenames.length > 0) {
        var filename = filenames.shift();
        current++;
        console.log(colors.cyan('\t' + filename + ' (' + current + '/' + total + ')'));
        const child = spawn('node', [this._mochaDir, filename]);
        var hasStderr = false;
        child.stdout.on('data', (data) => {
            process.stdout.write(data.toString());
        });
        child.stderr.on('data', (data) => {
            hasStderr = true;
            process.stdout.write(colors.yellow(data.toString()));
        });
        child.on('close', (code) => {
            if (hasStderr && this._failOnStderr) {
                console.log(colors.red('An error occured.'));
                process.exit(1);
            }
            if (code !== 0) {
                console.log(colors.red('Child process exited with code ' + code));
                console.log(colors.red('Test file: ' + filename));
                process.exit(1);
            }
            console.log(colors.green(' OK\n'));
            MochaWaterfall.prototype.execute.call(this);
        });
    } else {
        var end = Date.now();
        var elapsedSec = Math.round((end - start) / 1000);
        console.log(colors.green('All passed (' + elapsedSec + 's)'));
    }
};


module.exports = MochaWaterfall;