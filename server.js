var recluster = require('recluster'),
    path = require('path'),
    App = require('./app.js');

var options = App.processArgs(),
    cluster = recluster(path.join(__dirname, 'app.js'), {
      workers: options.cpus,
      timeout: 10,
      readyWhen: options.config.get('workers:server:reclusterReady')
    });

options.logger.info('Launching ' + options.env + ' server with ' + options.cpus + ' workers on port ' + options.config.get('workers:server:port'));
options.logger.info('Use "kill -s SIGUSR2 ' + process.pid + '" to reload');
cluster.run();

process.on('SIGUSR2', function() {
    options.logger.warn('Got SIGUSR2, reloading cluster...');
    cluster.reload();
});