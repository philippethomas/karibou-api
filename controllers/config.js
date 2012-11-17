  
module.exports = function(app) {

	var mongoose = require('mongoose');
	var mongooseAuth = require('mongoose-auth');
	var everyauth = require('everyauth')
		, Promise = everyauth.Promise;

  var home = require('./home');
  var products = require('./products');


	//
	// auth logout
	app.get('/logout', function (req, res) {
		  req.logout();
		  res.redirect('/');
	});

  app.get('/v1', home.index);
	app.get('/v1/products',products.list);
	app.get('/v1/products/:id',products.get);
	app.delete('/v1/products',products.mass_remove);
	app.delete('/v1/products/:id', products.remove);
	app.post('/v1/products',products.create);
	app.put('/v1/products',products.mass_update);
	app.put('/v1/products/:id',products.update);
	
};
