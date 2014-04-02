
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
    }else{
    next();
    }
};

exports.checkNotLogin = function(req, res, next) {
    if(req.session.user) {
        return res.json(302,{'err':'you have login'});
    }
    next();
};

exports.doLogin = function(req,res) {
    if(!(req.body.phone || req.body.email)){
        return res.json(400,{'err':'Please input your username and password'});
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.getByLogin(req.body, function(err,user){
        if(!user){
            return res.json(401,{'err':'user does not exist'});
        }
        if(user.user.userInfo.password != password){
            return res.json(402,{'err':'password does not match'});
        }
        req.session.user = user;
        return res.json(200,user);
    });
};

exports.logout = function(req,res) {
    req.session.user = null;
    res.json(200,{'info':'logout success'})
};

exports.doReg = function(req, res){
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
        phone: req.body.phone,
        email: req.body.email,
        password: password,
        UUID: req.body.UUID,
    });
    User.get(newUser,function(err,user){
        if(err){
            return res.json(400,err);
        }
        if(user){
            return res.json(401,{'err':'user has exist')
        }
        newUser.save(function(err,user){
            if(err){
                return res.json(300,err);
            }
            req.session.user = user[0];
            return res.json(200,user[0]);
        });
    });
};

exports.test = function(req, res){
    User.test(function(err,user){
        if(err){
            return res.json(400,err);
        }
        res.json(200,user);
    });
}

