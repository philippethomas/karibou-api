// from
// http://pixelhandler.com/blog/2012/02/09/develop-a-restful-api-using-node-js-with-express-and-mongoose/

require('../app/config');
var db          = require('mongoose');
var Categories  = db.model('Categories');
var assert      = require("assert");
var extend      = require('util')._extend;
var _           =require('underscore');
var check       = require('validator').check,
    sanitize    = require('validator').sanitize;

function checkParams(req){
  req.body.name&&check(req.body.name, "Le format du nom est invalide").len(2, 45);
  req.body.description && check(req.body.description, "Le format de la description est invalide").len(3, 400);
  req.body.image && check(req.body.image, "Le format de l'image est invalide").len(2, 45).is(/^[a-zA-ZÀ-ÿ0-9-]+$/);
  req.body.color && check(req.body.color, "Le format de la couleur est invalide").len(2, 45).is(/^[a-zA-ZÀ-ÿ0-9-]+$/);
  req.body.group && check(req.body.group, "Le format du group est invalide").len(2, 45).is(/^[a-zA-ZÀ-ÿ0-9]+$/);
}

exports.list=function (req, res) {
  try{
    req.query.group&&check(req.query.group, "Le groupe du filtre est invalide").len(2, 32).isAlphanumeric();
    req.query.name&&check(req.query.name, "Le nom du filtre est invalide").len(2, 32).is(/^[a-zA-ZÀ-ÿ0-9]+$/);
    req.query.type&&check(req.query.type, "Le type de catégorie est invalide").len(1, 32).is(/^[a-zA-ZÀ-ÿ0-9-*]+$/);
  }catch(err){
    return res.send(400, err.message);
  }  
  var type=(req.query.type)?{type:req.query.type}:{};
  //if (req.query.type==='*')type={};
  var query=Categories.find(type);



  //
  // count sku by category
  if (req.query.stats){
    var stats=db.model('Products').aggregate(
      {$project : { sku : 1, categories : 1 }},
      {$unwind:'$categories'}, 
      {
        $group:{
          _id:"$categories", 
          sku:{$addToSet:"$sku"}
        }
    });
  }
  //
  // filter by group name
  if (req.query.group){
    query=query.where("group",new RegExp(req.query.group, "i"))
  }
  
  //
  // filter by name
  if (req.query.name){
    query=query.where("name",new RegExp(req.query.name, "i"))
  }
  
  query.exec(function(err,cats){
    if(err){
      return res.send(400,err);
    }

    //
    // merge aggregate with categories to obtains :
    // the products by category
    if (stats){
      stats.exec(function(err,result){
        if(err){
          return res.send(400,err);
        }
        cats.forEach(function(cat){
          var stat=_.find(result,function(s){return s._id.toString()==cat._id.toString()});          
          cat._doc.usedBy=(stat)?stat.sku:[];
        })
        return res.json(cats);
      });
      return;
    }
    
    return res.json(cats);
  });
};

exports.get=function (req, res) {
  try{
    check(req.params.category, "Invalid characters for category name").len(2, 64).is(/^[a-z0-9-]+$/);    
  }catch(err){
    return res.send(400, err.message);
  }  

  Categories.findBySlug(req.params.category,function(err,cat){
    if(err){
      return res.send(400,err);
    }

    if(!cat){
      return res.send(400,"Category doesn't exist");
    }
    
    return res.json(cat);
  });

};

exports.update=function (req, res) {
  try{
    check(req.params.category, "Invalid characters for category name").len(2, 64).is(/^[a-z0-9-]+$/);    
    checkParams(req);
  }catch(err){
    return res.send(400, err.message);
  }  

  Categories.findBySlug(req.params.category,function(err,cat){
    if(err){
      return res.send(400,err);
    }
    _.extend(cat,req.body);
    cat.slug=cat.slugName();
    cat.save(function(err){
      if(err){
        return res.send(400,err);
      }
      return res.json(cat);
    });    
  });


};

exports.remove=function (req, res) {
  try{
    check(req.params.category, "Invalid characters for category name").len(2, 64).is(/^[a-z0-9-]+$/);    
  }catch(err){
    return res.send(400, err.message);
  } 
  
  Categories.remove({slug:req.params.category},function(err){
    if (err){
    	res.status(400);
      return res.send(err);    
    }
    return res.send(200);
  });
   
};


exports.create=function (req, res) {
   
  try{
    checkParams(req);
  }catch(err){
    return res.send(400, err.message);
  }  

  Categories.create(req.body,function(err,category){
    if (err){
      return res.send(400,err);    
    }
    return res.json(200,category);    
  });
};


