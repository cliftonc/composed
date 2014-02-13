var util = require('util'),
    winston = require('winston');

exports = module.exports = {
    configureLogging: configureLogging
}

function configureLogging(options, mode) {
    try {
        winston.remove(winston.transports.File);
    } catch (e) {
    }

    if (options.file && options.file.enabled) {
        // Options is a "live" object returned by the config library. If we change it,
        // the config library will write it back to disk! So we clone it...
        config = JSON.parse(JSON.stringify(options.file));
        config.filename = util.format(config.filename, mode);
        winston.add(winston.transports.File, config);
    }

    try {
        winston.remove(winston.transports.Console);
    } catch (e) {
    }

    if (options.console && options.console.enabled) {
        winston.add(winston.transports.Console, options.console);
    }

    if (options.syslog && options.syslog.enabled) {
        winston.add(require('winston-posix-syslog').PosixSyslog, options.syslog);
    }

    if (options.captureConsole && options.captureConsole.enabled) {
        // Replace console.* so they go through here too
        console.info = function() {
            winston.info(util.format.apply(this, arguments));
        }

        console.warn = function() {
            winston.warn(util.format.apply(this, arguments));
        }

        console.error = function() {
            winston.error(util.format.apply(this, arguments));
        }

        console.log = console.warn;
    }

    return {
        log: winston.info,
        info: winston.info,
        debug: winston.debug,
        warn: winston.warn,
        error: winston.error
    }
}
