// Use a different DB for tests
var app = require("../app/index");

var mongoose = require("mongoose");
var Users = mongoose.model('Users');

// why not using
// https://github.com/1602/jugglingdb




describe("Users", function(){
  var profile = null;
  var assert = require("assert");
  var request= require('supertest');

  beforeEach(function(done){

  	// create a new user
    var user=new Users({
		    provider:"twitter",
		    id:312528659,
		    photo:"https: //si0.twimg.com/profile_images/1385850059/oli-avatar-small_normal.png",
		    roles:["admin", "mod"]
    });

    user.save(function(err){
      profile=user;
      profile.id.should.equal(312528659);
	    done();
    });

  });

  afterEach(function(done){
    done();
  });
  

  describe("login",function(){
    
    it("validate inexistant Oauth user", function(done){
  		Users.findOrCreate({ id: 1234, provider:profile.provider, photo:profile.photo }, function (err, user) {
  		  user.id.should.equal(1234);
    		return done();
  		});
      
    });

    it("validate existant Oauth user", function(done){
    		Users.findOrCreate({ id: profile.id, provider:profile.provider, photo:profile.photo }, function (err, user) {
  		  user.id.should.equal(profile.id);
    		return done();
  		});
      
    });

    it("validation for wrong provider", function(done){
    		Users.findOrCreate({ id: profile.id, provider:"test", photo:profile.photo }, function (err, user) {
    		err.errors.provider.message.should.equal('Validator "enum" failed for path provider');
    		return done();
  		});      
    });

    it("validation for duplicate id", function(done){
    		Users.findOrCreate({ id: profile.id, provider:"facebook", photo:profile.photo }, function (err, user) {
    		assert(err.code,11000);
    		return done();
  		});
      
    });
    
    
    it.skip("validate provider", function(done){
      
    });
    
    it.skip("validate provider token", function(done){
      
    });

    it("registers a new User", function(done){
    
      Users.register("test2@test.com", "olivier", "evalet", "password", "password", function(err, doc){
        doc.email.address.should.equal("test2@test.com");
        doc.name.familyName.should.equal("evalet");
        doc.name.givenName.should.equal("olivier");
        done();
      });
    });

  });
  
  it('should return true if the user has role', function (done) {
       profile.hasRole('admin').should.be.true;
       profile.hasRole('mod').should.be.true;
       done();
   });
   it('should return false if the user does not have role', function (done) {
     profile.hasRole('astronaut').should.be.false;
     profile.hasRole('cowboy').should.be.false;
     done();
   });  

  it.skip("retrieves by email", function(done){
    Users.findByEmail(currentUsers.email, function(doc){
      doc.email.address.should.equal("test@test.com");
      done();
    });
  });

  it.skip("retrieves by token (eg. twitter)", function(done){
    Users.findByToken(currentUsers.auth_token, function(doc){
      doc.email.address.should.equal("test@test.com");
      done();
    });
  });

  it.skip("forget password", function(done){
    
  	done();
  });

  it.skip("confirm mail for registration", function(done){
  	done();
  });

  it.skip("authenticates and returns User with valid login", function(done){
    Users.authenticate(currentUsers.email, "password", function(User){
      User.email.should.equal("test@test.com");
      done();
    }, function(){
      throw("oops");
      done();
    });
  });

  it.skip("authenticates and returns fail with invalid login", function(done){
    Users.authenticate(currentUser.email, "liar", function(User){
      throw("This shouldn't happen");
    }, function(){
      done();
    });
  });

  it.skip("registers a new User only via twitter", function(done){
  });
  
  describe("Customers", function(){
    it.skip("Customers can view their order history and order statuses", function(done){
    });

    it.skip("Customers can maintain their multiple shipping and billing addresses", function(done){
    });

    it.skip("Temporary shopping cart for guests and permanent shopping cart for customers", function(done){
    });

    it.skip("Fast and friendly quick search and advanced search features", function(done){
    });

    it.skip("Product reviews for an interactive shopping experience", function(done){
    });

    it.skip("Secure transactions with SSL", function(done){
    });

    it.skip("Number of products in each category can be shown or hidden", function(done){
    });

    it.skip("Global and per-category bestseller lists", function(done){
    });

    it.skip("Display what other customers have ordered with the current product shown", function(done){
    });

    it.skip("Breadcrumb trail for easy site navigation", function(done){
    });
  });
    
  
});

