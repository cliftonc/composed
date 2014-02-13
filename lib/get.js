// Check to see if we are in dev mode, if so, go grab the masthead and nav
    if(!options.config.get('esi').enabled) {

      var masthead, navigation;

      var getHtml = function(url, next) {
        var http = require('http');
        http.get({host:options.config.get('esi').host, path:url}, function(res) {
          var data = "";
          res.on('data', function (chunk) {      
              data += chunk;
          });
          res.on('end', function(){
              next(null, data);
          })          
        }).on('error', function(err) {
            next(err);
        })
      }

      async.mapSeries([options.config.get('esi').masthead, options.config.get('esi').navigation, options.config.get('esi').footer], getHtml, function(err, result) { 
        options.config.get('esi').mastheadContent = result[0];
        options.config.get('esi').navigationContent = result[1];
        options.config.get('esi').footerContent = result[2];
        ready();
      })

    } else {