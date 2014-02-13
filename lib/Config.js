var config = require('config'),
    _ = require('underscore');

//--------------------------------------------------------------------------------
// This object is a drop-in replacement for the previous Config object which is
// why it supports the 'a:b:c' config key syntax and has a set() method
// -------------------------------------------------------------------------------

module.exports = (function() {

    function get(key) {
        var parts = key.split(':'),
            current = config;

        for (var i = 0; i < parts.length; i++) {
            var next = current[parts[i]];
            if (typeof next === 'undefined') {
                return undefined;
            }
            current = next;
        }

        return current;
    }

   
    return {
        get: get
    }

})();

/**
 * Export the config object
 */
//exports.Config = Config;
