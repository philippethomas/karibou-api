
var debug = require('debug')('emails');
var assert = require("assert");

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , validate = require('mongoose-validate')
  , ObjectId = Schema.ObjectId;
  


var Emails = new Schema({
    uid:{ type: String, required: true, unique:true },
    email: { type: String, required: true, unique:true },
    owner: {type: Schema.Types.ObjectId, ref : 'Users',required: true},
    created:{type:Date, default: Date.now}
});


Emails.statics.findOrCreate=function(e,callback){
	var Emails=this.model('Emails');
  return Emails.findOne(e, function(err, email){
    if(!email){
      var email=new Emails(e);
      email.save(function(err){
        callback(err,email);
      });
    }else{
      callback(err, email);
    }
  });
};


Emails.statics.create = function(user, callback){
  assert(user);
  assert(callback);
  

	var Emails=this.model('Emails');	
   
  //
  // check user for this email
  this.model('Users').findOne({id:user.id},function(err,u){
    if(!u){
      return callback(("Cannot find user: "+user.display()));
    }

    
    //
    // a unique url is created with this user and his email
    // FIXME hash method are not safe, use bcrypt 
    var uid=require('crypto').createHash('sha1').update(u.email.address+u.id).digest("hex");
    
    Emails.findOrCreate({owner:u,uid:uid,email:u.email.address}, function(err,validate){
      validate.created=new Date();
      validate.save(function (err) {
        return callback(err,validate);
      });  
    });
  });    

}; 

//
// validate email 
Emails.statics.validate=function(uid,email,callback){
	var Emails=this.model('Emails');	
	

	//
	// check owner
  return Emails.findOne({uid:uid}).populate('owner').exec(function (err, validate) {
  
    if(err){
      return callback(err);
    }      


    //
    // validate existant email
    if(!validate){
      return callback(("This validation url is no more avaiable (1)"));
    }


    //
    // validate check existant email
    if(email!==validate.owner.email.address || validate.email!==email){
      return callback( ("Cannot validate the email ["+email+"] "));
    }
    
    //
    // validate check timeout to,leave TTL
    var oneday=1000*60*60*24;
    if (((validate.created-Date.now())/oneday)>config.mail.ttl.long){
      // remove this validation process
      validate.remove();
      return callback(("This validation url is no more avaiable (2)"));
    };
    
    validate.owner.email.status=true;
    
    return validate.owner.save(function (err) {
      //
      // remove this validation process
      if (!err) validate.remove();
      return callback(err, validate.owner);
    });
  });
};

Emails.set('autoIndex', config.mongo.ensureIndex);
module.exports =mongoose.model('Emails', Emails);


