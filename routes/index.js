
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');

exports.index = function(req, res){
  res.render('index', { title: 'Let\'s date' });
};
exports.checkLogin = function(req,res, next) {
    if(!req.session.user) {
      return res.json(302,{'err':'you have not login'});
    }
    next();
};

exports.checkNotLogin = function(req, res, next) {
    if(req.session.user) {
        return res.json(302,{'err':'you have login'});
    }
    next();
};


exports.doLogin = function(req,res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    if(req.body.phone){
        User.getByPhone(req.body.phone, function(err,user){
            if(!user){
                return res.json(400,{'err':'user does not exist'});
            }
            if(user.password != password){
                return res.json(400,{'err':'password does not match'});
            }
            req.session.user = user;
            return res.json(200,user);
        });
    }
    else if(req.body.email){
        User.getByEmail(req.body.email, function(err,user){
            if(!user){
                return res.json(400,{'err':'user does not exist'});
            }
            if(user.password != password){
                return res.json(400,{'err':'password does not match'});
            }
            req.session.user = user;
            return res.json(200,user);
        });
    }
    else{
    return res.json(777,{'err':'Please request with phone or email'});
    }
};

exports.logout = function(req,res) {
    req.session.user = null;
    res.json(200,{'info':'logout success'})
};

exports.doReg = function(req, res){
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  if(req.body.phone){
    var newUser = new User({
        phone: req.body.phone,
        password: password,
        UUID: req.body.UUID,
    });
    User.getByPhone(newUser.phone, function(err,user){
        if(user){
            err = 'phone number has exist';
        }
        if(err){
            return res.json(400,{'error':err});
        }
        newUser.save(function(err,user){
            if(err){
                return res.json(300,{'error':err});
            }
            req.session.user = user;
            return res.json(200,user[0]);
        });
    });
  }
  else if(req.body.email){
    var newUser = new User({
        email: req.body.email,
        password: password,
        UUID: req.body.UUID,
    });
    User.getByEmail(newUser.email, function(err,user){
        if(user){
            err = 'email address has exist';
        }
        if(err){
            return res.json(400,{'error':err});
        }
        newUser.save(function(err,user){
            if(err){
                return res.json(300,{'error':err});
            }
            req.session.user = user;
            return res.json(200,user[0]);
        });
    });
  }else{
   res.json(777,{'err':'wrong request data format'}); 
  }
};



