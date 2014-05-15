
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var resetServer = require('../models/passwordReset');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var nodemailer = require("nodemailer");
var settings = require('../settings');

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
    if(req.body.phone === undefined || req.body.email === undefined){
        return res.json(400,{'err':'Please input your username and password'});
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.getByLogin(req.body, function(err,user){
        if(err){
            return res.json(400,err);
        }
        if(user){
            if(user.user.userInfo.password == password){
                req.session.cookie.originalMaxAge = settings.maxAge;
                req.session.user = user;
                return res.json(200,user);
            }else{
                return res.json(402,{'err':'password does not match'});
            }
        }else{
            return res.json(401,{'err':'user does not exist'});
        }
    });
};

exports.logout = function(req,res) {
    req.session.user = null;
    res.json(200,{'info':'logout success'})
};

exports.doReg = function(req, res){
    if(req.body.phone === undefined || req.body.email === undefined || req.body.password === undefined || req.body.UUID === undefined){
        return res.json(400,{'err':'wrong request format'})
    }
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
            req.session.cookie.originalMaxAge = settings.maxAge;
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
    url= "http://192.168.199.238:3000/reset?sid="+sid+"&email="+email;
    console.log(url);
    var mailOptions = {
        from: "WeDate",
        to: email,
        subject: "Password Get Back Service",
        text: "",
        html: "Please click the link below to renew you password in 10 mins, <a>"+url+"</a>"
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
    if(req.body.email === undefined || req.body.name === undefined){
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
            var RS = new resetServer({'email':email,'privateKey':privateKey,'outTime':outTime});
            RS.save(function(err){
                if(err){
                    return res.json(400,err);
                }
                sendEmail(email,sid,function(err){
                    if(err){
                        return res.json(401,{'err':'send email failed'});
                    }
                    return res.json(200,{'info':'send email successful'});
                });
            });  
        }else{
            return res.json(402,{'err':'information not match'});
        }
    });
};

exports.doReset = function(req,res){
    //veritify the url key and username
    if(req.query.sid ===undefined || req.query.email === undefined){
        return res.json(302,{'err':'not enough params'})
    }
    resetServer.getByEmail(req.query.email,function(err,doc){
        if(err){
            return res.json(400,err);
        }
        if(!doc){
            return res.json(400,{err:'no this user for password reset'});
        }
        var now = new Date();
        if(doc.outTime < now.getTime()){
            console.log(now.getTime());
            return res.json(400,{'err':"out time yeah"});
        }
        var md5 = crypto.createHash('md5');
        var sid = md5.update(doc.email+'$'+doc.outTime+'@'+doc.privateKey).digest('base64');
        if(req.query.sid != sid){
            return res.json(400,{'err':'invalue sid '});
        }
        var Num = "";
        for(var i=0;i<8;i++) { 
            Num+=Math.floor(Math.random()*10); 
        }
        var _md5 = crypto.createHash('md5');
        var newPassword = _md5.update(Num).digest('base64');
        User.changePassword(newPassword, Num,doc.email, function(err,Num){
            if(err){
                return res.json(400,err);
            }
            return res.json(200,{'password':Num});
        }) 

    });
};
exports.password = function(req,res){
    if(req.body.oldPassword === undefined || req.body.newPassword === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    if(req.session.user.user.userInfo.email === undefined || req.session.user.user.userInfo.phone === undefined){
        return res.json(400, {'err':'wrong request format'});
    }
    var md5 = crypto.createHash('md5');
    var oldPassword = md5.update(req.body.oldPassword).digest('base64');
    User.get(req.session.user, function(err,doc){
        if(err){
            return res.json(400,err);
        }
        if(doc){
            if(oldPassword == doc.user.userInfo.password){
                var _md5 = crypto.createHash('md5');
                var newPassword = _md5.update(req.body.newPassword).digest('base64');
                User.changePassword(newPassword, null, req.session.user.user.userInfo.email, function(err,password){
                    if(err){
                        return res.json(400,err);
                    }
                        return res.json(200,{'info':'change password success'});
                });
            }else{
                return res.json(402,{'err':'password does not match'});
            }
        }else{
            return res.json(400,{'err':'user not exist'});
        }
    });
};

/*
exports.test = function(req, res){
    app.exchange = app.rabbitMQConnection.exchange('APNSRouter',{confirm:true,type:'Direct'},function(exchange){
        console.log(exchange.name);
    });
    res.json(200,{'info':'sdfsd'});
};
*/
