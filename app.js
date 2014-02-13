var cluster = require('cluster'),
    express = require('express'),
    config = require('./lib/Config'),
    async = require('async'),
    Logging = require('./lib/Logging'),
    cons = require('consolidate'),    
    utils = require('./lib/Utils');

exports = module.exports = {
  processArgs: processArgs,
  bootstrap: bootstrap
}

function processArgs() {
  var env = process.env['NODE_ENV'] || 'development',
      argv = require('optimist')
            .usage('Launch Sherlock Search\nUsage: $0')
            .describe('c', 'Number of CPUs').alias('c', 'cpu')
            .describe('p', 'Listen port').alias('p', 'port')
            .argv;

  return {
    cpus: argv.c || config.get('workers:server:instances') || require('os').cpus().length,
    port: argv.p || config.get('workers:server:port') || 3000,
    logger: Logging.configureLogging(config.get('logging'), argv.m),
    config: config,
    env: env
  }
}

function bootstrap(options, next) {

     // Create the express app
    var app = express();

    // Core configuration
    // app.use(express.compress());

    // To remove x-powered-by
    app.use(function (req, res, next) {
      res.removeHeader("X-Powered-By");
      next();
    });

    app.use(express.cookieParser());

    // ESI Detection middleware
    app.use(function(req, res, next) {
      if(req.headers["surrogate-capability"] == 'akam="ESI/1.0"') {
        req.enableEsi = true;        
      } else {
        req.enableEsi = false;        
      }
      next();
    });

    app.engine('html', cons.mustache);    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.static(__dirname + '/public'));
  
    app.use(app.router);

    // Per environment
    app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
      //app.use(express.errorHandler());
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    var router = require('./routes/routes');

    app.get('/', router.index);
    app.get('/esi_header', router.esi_header);
    app.get('/esi_sidebar', router.esi_sidebar);
    app.get('/esi_error', router.esi_error);
    app.get('/esi_maxwait', router.esi_maxwait);
    app.get('/ajax', router.ajax);

    // Attach the redis client to the app so it can be used in routes      
    app.set('config', options.config);
    app.set('logger', options.logger);
    app.listen(options.port);
    next(app, true);
  
}

// Only auto-bootstrap if we're the main module (e.g. a cluster worker, or "node app.js") Specifically, don't do so in tests.
if (require.main === module) {
  var options = processArgs();

  bootstrap(options, function(app, listen) {
    options.logger.info("Worker with pid " + process.pid + (listen ? " listening." : " ready to process messages."));
  });
}
