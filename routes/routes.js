/**
 * One controller app
 */
exports.index = function (req, res) {
    
   var esi = req.enableEsi,
       partials = {esi_header: '../views/esi_header', esi_maxwait: '../views/esi_maxwait',withpage: '../views/withpage', fragment: '../views/fragment', esi_sidebar: '../views/esi_sidebar', ajax_sidebar: '../views/ajax_sidebar'};     

   // Get fragments
   getFragment('mykey', function(err, html) {
    res.render('index', {esi: {enabled: esi}, fragment:html, partials: partials}); 
   });
     
}

exports.esi_header = function(req, res) {

   res.render('esi_header_response'); 

}

exports.esi_sidebar = function(req, res) {

   res.render('esi_sidebar_response', {geo: req.query.geo || 'Unknown', query: req.query.query || 'Unknown'}); 

}

exports.esi_error = function(req, res) {

  var errorCode = req.query.error ? req.query.error : 500;

  // Return an error
  res.status(errorCode);
  res.end("This is a " + errorCode + " page.");

}

exports.esi_maxwait = function(req, res) {

  // Respond with delay - maxwait doesn't work with ETS
  setTimeout(function() {
   res.end("I AM SLOW!"); 
  }, 500);

}

exports.ajax = function(req, res) {

  // Respond with small delay
  setTimeout(function() {
   res.render('ajax_response'); 
  }, 500);

}

function getFragment(fragmentKey, next) {

    // Imagine that this is a wrapper around an in memory cache like Redis
    // Common use is to have a CMS publish content accessible via a key
    // The various front end apps can then use this key to retrieve it from their local
    // cache (either pass through or primed) with no run time dependency
    // Close up if nothing found

    var fragmentHtml = '<div class="blog-post">' +
                       '<h2 class="blog-post-title">Rendered from in memory cache</h2>' +
                       '<p>This could be content that is accessible in a local cache, populated via messaging.</p>' +
                       '</div>';

    next(null, fragmentHtml);

}