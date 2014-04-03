
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var nodemailer = require("nodemailer");

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
            return res.json(401,{'err':'user has exist'});
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

var sendEmail = function(email, sid, callback){
    var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth:{
            user: "nosongyang@gmail.com",
            pass: "mainliner880320"
        }
    });
    url= "http://127.0.0.1/reset?sid="+sid+"&email="+email;
    var mailOptions = {
        from: "WeDate",
        to: email,
        subject: "Password Get Back Service",
        text: "",
        html: "Please click the link below to renew you password in 10 mins, "+url
    };
    smtpTransport.sendMail(mailOptions,function(err,res){
        smtpTransport.close();
        if(err){
            return callback(err);
        }else{
            return callback(null);
        }
    });
};


exports.reset = function(req, res){
    if(!(req.body.user.userInfo.email && req.body.user.userInfo.name)){
        return res.json(400,{'err':'bad request format'});
    }
    User.getByEmailAndName(req.body,function(err,user){
        if(err){
            return res.json(400,err);
        }
        if(user){
            //生成过期时间 密钥 与用户名组成sid 并存储。
            //构建url地址，发送邮件
            var privateKey = uuid.v1();
            var date = new Date();
            var outTime = date.getTime()+600000; //10 mins out date time
            var email = user.user.userInfo.email;
            var md5 = crypto.createHash('md5');
            var sid = md5.update(email+'$'+outTime+'@'+privateKey).digest('base64');
            sendEmail(email,sid,function(err){
                    if(err){
                        return res.json(401,{'err':'send email failed'});
                    }
                    return res.json(200,{'info':'send email successful'});
            });
        }else{
            return res.json(402,{'err':'information not match'});
        }
    });
};

exports.doReset = function(req,res){
    //veritify the url key and username
};

/*
exports.test = function(req, res){
    User.test(function(err,user){
        if(err){
            return res.json(400,err);
        }
        res.json(200,user);
    });
}
*/
