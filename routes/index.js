
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var resetServer = require('../models/passwordReset');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');
var settings = require('../settings');
var wedate = require('../app.js');
var SingleLogin = require('../models/singlelogin.js'); //只允许 用户在一台设备上登录。

exports.index = function(req, res){
  res.render('index', { title: 'Let\'s date' });
};

exports.checkLogin = function(req,res, next) {
    if(!req.session.user) {
      return res.json(302,{'err':'you have not login'});
    }else{
        SingleLogin.checkSessionID(req.session.user._id, function(err, sessionID){
            if(err){
                return res.json(400,{'err':'db error'});
            }
            if(sessionID == req.sessionID){
                next();
            }else{
                //说明该用户在另外一个新session下登录了游戏，旧session应该destroy
                req.session.destroy(function(err){});
                return res.json(302,{'err':'you have not login'});
            }
        });
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
    User.getByLogin(req.body, function(err,user){
        if(err){
            return res.json(400,err);
        }
        if(user){
            var md5 = crypto.createHash('sha256');
            var salt = user.user.userInfo.salt;
            var password = md5.update(salt+req.body.password).digest('base64');
            if(user.user.userInfo.password == password){
                req.session.cookie.originalMaxAge = settings.maxAge;
                req.session.user = user;
                var newUserLogin = new SingleLogin ({
                    'userID':user._id,
                    'sessionID':req.sessionID,
                });
                newUserLogin.save(function(err){   //新用户登陆 更新singlelogin文档
                    if(err){
                        return res.json(400,{'err':'server error'});
                    }
                    return res.json(200,user);
                });
            }else{
                return res.json(402,{'err':'password does not match'});
            }
        }else{
            return res.json(401,{'err':'user does not exist'});
        }
    });
};

exports.logout = function(req,res) {
    req.session.destroy(function(err){
        if(err){
            return res.json(400,{'info':'logout failed'});
        }
        return res.json(200,{'info':'logout success'});
    });
};

exports.doReg = function(req, res){
    if(req.body.phone === undefined || req.body.email === undefined || req.body.password === undefined || req.body.UUID === undefined){
        return res.json(400,{'err':'wrong request format'})
    }
    var md5 = crypto.createHash('sha256');
    var saltOfUser = uuid.v1();
    var password = md5.update(saltOfUser+req.body.password).digest('base64');
    var newUser = new User({
        salt: saltOfUser,
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
            console.log(user);
            req.session.cookie.originalMaxAge = settings.maxAge;
            req.session.user = user[0];
            var newUserLogin = new SingleLogin ({
                    'userID':user._id,
                    'sessionID':req.sessionID,
                });
            newUserLogin.save(function(err){   //新用户登陆 更新singlelogin文档
                if(err){
                    return res.json(400,{'err':'server error'});
                }
                    return res.json(200,user);
            });
        });
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
            var outTime = date.getTime()+600000.0; //10 mins out date time
            var email = user.user.userInfo.email;
            var md5 = crypto.createHash('sha256');
            var sid = md5.update(email+'$'+outTime+'@'+privateKey).digest('base64');
            var RS = new resetServer({'email':email,'privateKey':privateKey,'outTime':outTime});
            RS.save(function(err){
                if(err){
                    return res.json(400,err);
                }
                var encoded_payload = JSON.stringify({'email':email,'sid':sid});
                wedate.app.e.publish('E',encoded_payload,{},function(err,message){
                    if(err){
                        //need to save the unpush message for later use here
                        return res.json(200,{'info':'send email success'});
                    }
                    return res.json(200,{'info':'send email success'});
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
            return res.json(400,{'err':"out time yeah"});
        }
        var md5 = crypto.createHash('sha256');
        var sid = md5.update(doc.email+'$'+doc.outTime+'@'+doc.privateKey).digest('base64');
        if(req.query.sid != sid){
            return res.json(400,{'err':'invalue sid '});
        }
        var Num = "";
        for(var i=0;i<8;i++) { 
            Num+=Math.floor(Math.random()*10); 
        }
        var _md5 = crypto.createHash('sha256');
        var newSalt = uuid.v1();
        var newPassword = _md5.update(newSalt+Num).digest('base64');
        User.changePassword(newPassword, newSalt,doc.email, function(err){
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
    User.get(req.session.user, function(err,doc){
        if(err){
            return res.json(400,err);
        }
        if(doc){
            var md5 = crypto.createHash('sha256');
            var oldPassword = md5.update(doc.user.userInfo.salt+req.body.oldPassword).digest('base64');
            if(oldPassword == doc.user.userInfo.password){
                var _md5 = crypto.createHash('sha256');
                var newSalt = uuid.v1();
                var newPassword = _md5.update(newSalt+req.body.newPassword).digest('base64');
                User.changePassword(newPassword, newSalt, req.session.user.user.userInfo.email, function(err,password){
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
