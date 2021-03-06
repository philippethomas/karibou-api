/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
//  , flash = require('connect-flash')
//  , helpers = require('view-helpers')
  , pkg = require('../package.json')

//
// extend express state
// https://github.com/yahoo/express-state
if (config.express.state){
  var expstate = require('express-state')
  expstate.extend(app);
}  

module.exports = function (app, config, passport, sendmail) {

  //
  // CORS middleware
  // Allow cross-domain 
  var CORS = function(req, res, next) {
      res.header('Access-Control-Allow-Credentials', config.cors.credentials);
      if (config.cors.allowedDomains.indexOf(req.header('Origin')) !== -1) {
        res.header('Access-Control-Allow-Origin', req.header('Origin'));
      }

//      res.header('Access-Control-Max-Age', config.cors.age);
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Requested-With,ETag');
      if( req.method.toLowerCase() === "options" ) {
          res.writeHead(204);
          return res.end();        
      }
      next();
  }


  app.set('showStackError', true)

  // should be placed before express.static 
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }))




  // set views path, template engine and default layout
  app.set('views', config.express.views)
  app.set('view engine', config.express['view engine'])

  app.configure(function () {
    // expose package.json to views
    app.use(function (req, res, next) {
      res.locals.pkg = pkg
      next()
    })

    //
    // use cors
    app.use(CORS);  


    app.use(express.favicon())
    app.use(express.static(config.root + '/public'))

    // don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
      app.use(express.logger('short'))
    }


    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.urlencoded())
    app.use(express.json())

    app.use(express.methodOverride())

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));  


    //
    // cookie session
    if (!config.express.mongoSession){
      app.use(express.cookieSession({
        secret: config.middleware.session.secret,
        cookie: config.middleware.cookie
      }));
    }


    // express/mongo session storage
    if (config.express.mongoSession){
      app.use(express.session({
        secret: config.middleware.session.secret,
        store: new mongoStore({
          url: config.mongo.name,
          collection : 'sessions'
        }),
        cookie: config.middleware.cookie
      }))
    }



    // use passport session
    app.use(passport.initialize())
    app.use(passport.session())


    // connect flash for flash messages - should be declared after sessions
    // app.use(flash())

    // should be declared after session and flash
    //app.use(helpers(pkg.name))

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test' && config.express.csrf) {
      app.use(express.csrf())

      // This could be moved to view-helpers :-)
      app.use(function(req, res, next){
        res.locals.csrf_token = req.csrfToken()
        next()
      })
    }

    app.use(function(req, res, next){
      req.sendmail=sendmail;
      console.log("cookies",req.cookies)
      console.log("session.passport",req.session.passport)
      next();
    });



    // routes should be at the last
    app.use(app.router)



    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    /**
    app.use(function(err, req, res, next){
      // treat as 404
      if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next()
      }

      // log it
      // send emails if you want
      console.error(err)

      // error page
      res.status(500).render('500', { error: err.stack })
    })


    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      })
    })
*/
  })

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true
  })
}