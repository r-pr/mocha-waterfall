//Appens console color marks to string.
module.exports = {
    red: function(msg) {
        return '\x1b[31m' + msg + '\x1b[0m';
    },
    cyan: function(msg) {
        return '\x1b[36m' + msg + '\x1b[0m';
    },
    green: function(msg) {
        return '\x1b[32m' + msg + '\x1b[0m';
    },
    yellow: function(msg) {
        return '\x1b[33m' + msg + '\x1b[0m';
    }
};