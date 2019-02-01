const spawn = require('child_process').spawn;
const colors = require('./lib/console-colors');

/**
 * Main class.
 * 
 * @param {Object} options
 * @param {String[]} options.filenames
 * @param {Boolean} options.failOnStderr
 * @param {String} options.mochaDir
 * @param {Boolean=} options.bail
 * @param {Number=} options.maxRestarts
 */
function MochaWaterfall(options) {
    if (typeof options !== 'object' || !options)
        throw new Error('options must be an object');
    if (typeof options.filenames === 'undefined')
        throw new Error('options.filenames is required');
    if (!options.filenames.constructor || options.filenames.constructor !== Array)
        throw new Error('options.filenames must be an array');
    if (typeof options.failOnStderr !== 'boolean')
        throw new Error('options.failOnStderr must be a boolean');
    this._filenames = options.filenames.slice();
    this._mochaDir = options.mochaDir;
    this._failOnStderr = options.failOnStderr;
    this._bail = options.bail;
    this._maxRestarts = options.maxRestarts || 0;

}

var firstTest = true;
var total;
var current = 0;
var start = Date.now();

var restarts = {};

function didRestart(scriptPath){
    if (typeof restarts[scriptPath] === 'undefined'){
        restarts[scriptPath] = 1;
    } else {
        restarts[scriptPath]++;
    }
}

function printRestartsStat(){
    let keys = Object.keys(restarts);
    if (keys.length === 0){
        console.log('No restarts occured');
    } else {
        console.log('Restarts');
        console.log('========');
        console.log('Count\tScript');
    }

    Object.keys(restarts).forEach(scriptPath=>{
        console.log(`${restarts[scriptPath]}\t${scriptPath}`);
    })
}

var nRestarts = 0;

function spawnTest(filename, bail){
    var bailArg = bail ? '--bail' : '';
    return spawn('mocha', [filename, bailArg], { shell: true });
}

MochaWaterfall.prototype.execute = function executeTests() {
    var filenames = this._filenames;
    if (firstTest){
        total = filenames.length;
        firstTest = false;
    }
    if (filenames.length > 0) {
        var filename = filenames.shift();
        current++;
        nRestarts = 0;
        var appendListeners = (proc)=>{
            var hasStderr = false;
            proc.stdout.on('data', (data) => {
                process.stdout.write(data.toString());
            });
            proc.stderr.on('data', (data) => {
                hasStderr = true;
                process.stdout.write(colors.yellow(data.toString()));
            });
            proc.on('close', (code) => {
                if ((hasStderr && this._failOnStderr) || code !== 0) {
                    var msg = code === 0 ? 'An error occured.' : 'Child process exited with code ' + code;
                    console.log(colors.red(msg));
                    console.log(colors.red('Test file: ' + filename));
                    if (nRestarts < this._maxRestarts){
                        nRestarts++;
                        didRestart(filename);
                        console.log(colors.cyan('Restart attempt #' + nRestarts));
                        child = spawnTest(filename, this._bail);
                        appendListeners(child);
                    } else {
                        printRestartsStat();
                        process.exit(1);
                    }
                    return;
                }
                console.log(colors.green(' OK\n'));
                MochaWaterfall.prototype.execute.call(this);
            });
        }
        console.log(colors.cyan('\t' + filename + ' (' + current + '/' + total + ')'));
        let child = spawnTest(filename, this._bail);
        appendListeners(child); 
    } else {
        var end = Date.now();
        var elapsedSec = Math.round((end - start) / 1000);
        console.log(colors.green('All passed (' + prettyTime(elapsedSec) + ')'));
        printRestartsStat();
    }
};

function prettyTime(totalSeconds){
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds - (minutes * 60);
    let result = seconds + ' sec';
    if (minutes > 0){
        result = minutes + ' min ' + result;
    }
    return result;
}

module.exports = MochaWaterfall;
