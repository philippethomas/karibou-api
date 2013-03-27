// Use a different DB for tests
// Use a different DB for tests
var app = require("../app/index");

var fx = require("./fixtures/products");
var mongoose = require("mongoose");
var Products = mongoose.model('Products');
var Shops = mongoose.model('Shops');
var Users = mongoose.model('Users');
var Sequences = mongoose.model('Sequences');
var Categories = mongoose.model('Categories');



describe("Shops", function(){
  var async= require("async");
  var assert = require("assert");
  var _ = require("underscore");
  var user,uid=12345;

  var products, shop, cats;


  before(function(done){
      fx.clean(function(){
      Users.findOrCreate({ id: 12345, provider:"twitter", photo:"jpg" }, function (err, u) {
          user=u;
          done();
      });      

      });
  });
    


  it("Create a new Shop", function(done){
    var s={
      name: "Votre nouveau vélo en ligne",
      description:"cool ce shop",
      photo:{
        bg:"http://image.truc.io/bg-01123.jp",
        fg:"http://image.truc.io/fg-01123.jp"
      }    
    };
    Shops.create(s,user, function(err,shop){
      assert(!err);
      shop.urlpath.should.equal("votre-nouveau-velo-en-ligne");
      done();
    });
  });

  it("Find One Shop", function(done){
    Shops.findOne({urlpath:"votre-nouveau-velo-en-ligne"},function(err,shop){
        //shop.user.id.should.equal(user.id);
        shop.name.should.equal("Votre nouveau vélo en ligne");
        done();
    });
  });

  it("Update shop", function(done){
    var s={
      name: "Votre nouveau vélo en ligne",
      description:"berk ce shop",
      photo:{
        bg:"bg",
        fg:"fg"
      }
    
    };
    Shops.update({name:s.name},s,function(err,shop){
        //shop.user.id.should.equal(user.id);
        shop.photo.fg.should.equal("fg");
        done();
    });
  });
  
  it("Update shop with wrong id",function(done){
    var s={
      name: "Votre nouveau vélo en ligne 2",
      description:"berk ce shop",
      photo:{
        bg:"bg",
        fg:"fg"
      }
    
    };
    Shops.update({name:s.name},s,function(err,shop){
        //shop.user.id.should.equal(user.id);
        err.should.be.a.string;
        done();
    });

  });
  
  it("Update shop with illegal field",function(done){
    var s={
      name: "Votre nouveau vélo en ligne",
      description:"berk ce shop",
      photo:{
        bg:"bg",
        fg:"fg"
      },
      options:{
        bio:"hello",
        avoid:"hello"
      }
    
    };
    Shops.update({name:s.name},s,function(err,shop){
        shop.options.bio.should.be.true;
        shop.options.should.not.have.property('avoid');
        done();
    });

  });
  
  it("Update shop without id",function(done){
    var s={
      name: "Votre nouveau vélo en ligne 2",
      description:"berk ce shop",
      photo:{
        bg:"bg",
        fg:"fg"
      }
    
    };
    Shops.update({},s,function(err,shop){
        //shop.user.id.should.equal(user.id);
        err.should.be.a.string;
        done();
    });

  });

  it("Update shop, remove  bg photo",function(done){
    var s={
      name: "Votre nouveau vélo en ligne",
      description:"berk ce shop",
      photo:{
        fg:"fg"
      }
    
    };
    Shops.update({name:s.name},s,function(err,shop){
        //shop.user.id.should.equal(user.id);
        shop.photo.fg.should.equal("fg");
        shop.photo.should.not.have.property('bg')
        done();
    });
  });
  

  it("Find Shops by the user", function(done){
    Shops.findByUser({id:uid},function(err,shops){
        shops[0].name.should.equal("Votre nouveau vélo en ligne");
        shops.length.should.equal(1);
        done();
    });
  });




});

