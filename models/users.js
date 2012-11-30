
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , validate = require('mongoose-validate')
	, passport = require('passport')
	, bcrypt = require('bcrypt');

 /* Enumerations for field validation */
 var EnumGender="homme femme".split(' ');
 var EnumProvider="twitter facebook goolge".split(' ');

 // validate URL
 validate.url = function (value) {
   try {
     check(value).len(10, 200).regex(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
   } catch(err) {
     return false;
   }
   return true;
 };

 // Normalized profile information conforms to the contact schema established by Portable Contacts.
 // http://portablecontacts.net/draft-spec.html#schema
 var UserSchema = new Schema({
    /* A unique identifier for the user, as generated by the service provider.  */
    id    : {type:Number, required: true, unique: true},   

    /* The provider which with the user authenticated (facebook, twitter, etc.) */
    provider: {type:String, required: true, unique: false, enum: EnumProvider}, 
    
    emails :[{
      email:{type : String, index:true, unique: false, required : false, 
        validate:[validate.email, 'invalid email address']
      },
      primary:Boolean
    }],
    
    /* The name of this user, suitable for display.*/
    displayName:String, 
    name: {
        familyName: String,
        givenName: String
    },
    
    birthday: Date,
    gender: {type:String, enum:EnumGender},
    tags: [String],
    url:{type:String, validate:[validate.url,'Invalide URL format or lenght']},
    
    phoneNumbers: [{
          value: String,
          type: String
    }],
    
    photo: String,
    
    addresses: [{
          type: { type: String, required : true, lowercase: true, trim: true },
          streetAdress: { type: String, required : true, lowercase: true, trim: true },
          locality: { type: String, required : true, lowercase: true, trim: true,
            validate:[validate.alpha, 'Invalide locality'] 
          },
          region: { type: String, required : true, lowercase: true, trim: true, default:"GE" },
          postalCode: { type: String, required : true,
            validate:[validate.postalcode,'Invalide postal code'] 
          },
          primary:{ type: Boolean, required : true, default:false} 
    }],
    
    likes: [{type: Schema.Types.ObjectId, ref : 'Products'}],
    
    /* The available Shop for this user */
    shops: [{type: Schema.Types.ObjectId, ref : 'Shops'}],
    
    
    /* */    
    invoices : {type: Schema.ObjectId, ref : 'Invoice'},
    
    /* password and creation date (for local session only)*/    
    created:{type:Date, default: Date.now},
		salt: { type: String, required: false },
		hash: { type: String, required: false },   
});


/**
 * validation functions
 */
//UserSchema.path('XYZ').validate(function (value) {
//  return /male|female|homme|femme/i.test(value);
//}, 'Invalid gender');

UserSchema.statics.findOrCreate=function(u,callback){
	var Users=this.model('Users');
  Users.findOne(u, function(err, user){
    if(!user){
      var newuser=new Users(u);
      newuser.save(function(e,user){
        callback(e,user);
      });
    }else{
      callback(err, user);
    }
  });

};


UserSchema.statics.findByEmail = function(email, success, fail){
	var Users=this.model('Users');
  Users.findOne({email:email}, function(e, doc){
    if(e){
      fail(e)
    }else{
      success(doc);
    }
  });
};

UserSchema.statics.findByToken = function(token, success, fail){
	var Users=this.model('Users');
  Users.findOne({provider:token}, function(e, doc){
    if(e){
      fail(e)
    }else{
      success(doc);
    }
  });
};

UserSchema.statics.login = function(email, password, callback){
  console.log("login",email, password);
};


/**
 * local registration
 * - virtual field for password (mapped to salt && hash)
 * - verify password 
 * - authenticate
 * - register
 */  
UserSchema.virtual('password').get(function () {
  return this._password;
});

UserSchema.virtual('password').set(function (password) {
  this._password = password;
  var salt = this.salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});

UserSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});


UserSchema.statics.authenticate=function(email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
      // on error
      if (err) { return callback(err); }
      
      // on user is Null
      if (!user) { return callback(null, false); }
      
      // verify passwd
      user.verifyPassword(password, function(err, passwordCorrect) {
        if (err) { return callback(err); }
        if (!passwordCorrect) { return callback(null, false); }
        return callback(null, user);
      });
    });
};


UserSchema.statics.register = function(email, password, confirm, callback){
	var Users=this.model('Users');
	
	// hash password
	var pwd=require('crypto').createHash('md5').update(password).digest("hex");
	
	// create a new customer
	var user=new Users({
			email:email,
			provider:"local",
			password:password,
			created:new Date()
	});
	

	
	//save it
	user.save(function(err){
		callback(err, user);
	});
};

module.exports = mongoose.model('Users', UserSchema);



