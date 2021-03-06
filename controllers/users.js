
/*
 * Users API
 */
var db = require('mongoose'),
    password = require('password-generator'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

function check(req){
    if(req.body.email.address) check(req.body.email.address).len(6, 64).isEmail();
    if(req.body.name.familyName) check(req.body.name.familyName).len(2, 64).isAlphanumeric();
    if(req.body.name.givenName) check(req.body.name.givenName).len(2, 64).isAlphanumeric();
}

exports.ensureMe=function(req, res, next) {
    
  //
  // ensure auth
	if (!req.isAuthenticated()) { 
      return res.send(401);	
	}

  // if not me,  
  var me=sanitize(req.params.id).toInt()||req.body.id;
  if (req.user.id!==me) { 
      return res.send(401, "Vous n'êtes le propriétaire de ce compte");	
	}
	
  return next();
}




exports.me = function (req, res, next)  {
  res.json(req.user);
};


exports.list = function (req, res, next)  {
  //
  // TODO add criteria
  db.model('Users').find({},function(err,users){
      if (err){
        return res.send(400,err);    
      }
      users.forEach(function(user){
        if( user.email&&user.email.address && config.admin.emails.indexOf(user.email.address)!=-1){
          user.roles.push('admin');
        }        
      })
      return res.json(200,users);
  });
}

exports.recover=function(req,res){
  try{
    //check(req.params.token,"token inconnu").isEmail();
    check(req.params.email,"Utilisateur inconnu").isEmail();
  }catch(err){
    return res.send(400, err.message);
  }  


  db.model('Users').findOne({'email.address': req.params.email},
    function(err,user){
      
      if (err){
        return res.send(400,err);    
      }
      if(!user){
        return res.send(400,"Utilisateur inconnu");    
      }
  
      //
      // change the password
      var content=user;      
      content.password=user.password=password();  
      user.save(function(err){
        if(err)return res.send(400,err);    
        

        //
        // send email
        req.sendmail(user.email.address, 
                     "Vous avez un nouveau mot de passe", 
                     content, 
                     "password", function(err, status){
          if(err){
            console.log(err,status)
            return res.send(400,err);
          }      
                     
          return res.json("Un nouveau mot de passe à été envoyé à votre adresse mail.");  
        });
        
        
      });      
      
  });
};

exports.password=function(req,res){

  try{
    check(req.params.id).isInt();
    check(req.body.email).isEmail();
    check(req.body.new,"Votre nouveau password est trop court ou trop long").len(4,32);
    if(!req.body.current && req.user.hash) throw new Error("Il manque votre password");
  }catch(err){
    return res.send(400, err.message);
  }  

      
  var stderr="L' utilisateur "+req.body.email+"@"+req.params.id+" n'existe pas ou son mot de passe est incorrect";
  
  db.model('Users').findOne({'email.address': req.body.email, id:req.params.id},
    function(err,user){
      if (err){
        return res.send(400,err);    
      }
      //
      // check user
      if(!user){
        return res.send(400,stderr);    
      }
      
      //
      // check password
      if(req.user.hash){user.verifyPassword(req.body.current, function(err, passwordCorrect) {
          if (err) {           
            return res.send(400,err);    
          }
          if (!passwordCorrect) { 
            return res.send(400,stderr+" (2)");    
          }
          
          //
          // change the password
          user.password=req.body.new;
          user.save(function(err){
            if(err)return res.send(400,err);    
            return res.json({});  
          });
        });
      }else{
        //
        // set the password
        user.password=req.body.new;
        user.save(function(err){
          if(err)return res.send(400,err);    
          return res.json({});  
        });
      }
      
  });

};

exports.update=function(req,res){

  try{
    check(req.params.id).isInt();
    check(req);
  }catch(err){
    return res.send(400, err.message);
  }  
      
  
  db.model('Users').update({id:req.params.id},req.body,function(err,user){
    if (err){
      return res.send(400,err);    
    }
    return res.json(user);  
  });

};


exports.status=function(req,res){

  try{
    check(req.params.id).isInt();
    if(req.body.status===undefined)throw new Error("Invalid request");;
  }catch(err){
    return res.send(400, err.message);
  }  
      
  
  db.model('Users').updateStatus({id:req.params.id},req.body.status,function(err,user){
    if (err){
      return res.send(400,err);    
    }
    return res.json(user);  
  });

};

