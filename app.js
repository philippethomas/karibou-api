#!/bin/env node
//
// check links
// https://github.com/madhums/node-express-mongoose-demo
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
// mongo/express sample 
// https://gist.github.com/1025038
// dynamic helpers
// http://stackoverflow.com/questions/6331776/accessing-express-js-req-or-session-from-jade-template
// http://stackoverflow.com/questions/11580796/migrating-express-js-2-to-3-specifically-app-dynamichelpers-to-app-locals-use

//
// start newrelic logs here
//require('newrelic');

if(process.env.NODETIME_KEY){
  var nodetime=require('nodetime').profile({
      accountKey:process.env.NODETIME_KEY, 
      appName: process.env.NODETIME_APP
  });
}

//
// load env
var express = require('express')
  , fs = require('fs')
  , passport = require('passport')

  , env = process.env.NODE_ENV || 'development'
  , config = require('./app/config')
  , mongoose = require('mongoose')


//
// open database
mongoose.connect(config.mongo.name,function(e){  
    //double check for database drop
    console.log("boot[",new Date(),"] :",mongoose.connection.db.databaseName, config.mongo.name)

    if(process.env.NODE_ENV!=='test'){
      console.time("running db maintain")
      require('./app/db.maintain').update(mongoose.connection.db,function(err,log){
        if(err){
          console.log("ERROR",err)
        }
        console.timeEnd("running db maintain")
      });            
    }

    if(config.dropdb && process.env.NODE_ENV==='test'){
      mongoose.connection.db.dropDatabase(function(err,done){
      });
    }
});

// load models
files = require("fs").readdirSync( './models' );
for(var i in files) {
  if(/\.js$/.test(files[i])) require('./models/'+files[i]);
}

var app = express()


// utils 
require('./app/utils')(app);

// mailer
var sendmail=require('./app/mail')(app);
  
// bootstrap passport config
require('./app/passport')(app, config, passport)

// express settings
require('./app/express')(app, config, passport, sendmail)

// Bootstrap routes
require('./app/routes')(app, config, passport)



//
// maintain db
//
//
//
// start the server
var port = (process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || process.env.C9_PORT || process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || config.express.port);
var host = (process.env.VMC_APP_HOST || process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || 'localhost');

// manage c9 env
if (process.env.C9_PORT ){
    host='0.0.0.0';
}

app.listen(port,host);




// expose app
exports = module.exports = app





