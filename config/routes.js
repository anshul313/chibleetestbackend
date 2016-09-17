var fs = require('fs');
var config = require('./config')

module.exports = function (router) {

  if (process.env.NODE_ENV != 'test') {
    // router.use(function(req,res,next) {
    //     if(req.method === 'GET')
    //       res.cookie('XSRF-TOKEN', req.csrfToken(), { expires: new Date(Date.now() + 900000) } );
    //     next();
    // });
  }

   // Bootstrap controllers
  fs.readdirSync(config.root+'/app/controllers').forEach(function (file) {
      if (~file.indexOf('.js')){
        console.log(file);
        var route = require(config.root+'/app/controllers/' + file).controller(router); 
        console.log("imported"); 
      }
  });


  router.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    
    
    console.error(err.stack); 
    res.status(500).send({ error: err.stack });
    

  });
  // assume 404 since no middleware responded
  router.use(function (req, res, next) {
    res.status(404).send({
      url: req.originalUrl,
      error: 'Not found'
    });
  });
  
};