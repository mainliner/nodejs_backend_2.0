
/*
 * deal users info.
 */
var User = require('../models/user.js');
var Subscriber = require('../models/subscriber.js');
var crypto = require('crypto');
var settings = require('../settings');
var SingleLogin = require('../models/singlelogin.js'); //只允许 用户在一台设备上登录。
var uuid = require('node-uuid');
var wedate = require('../app.js');
var resetServer = require('../models/passwordReset');
var nodemailer = require('nodemailer');

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

exports.doReg = function(req, res){
    if(req.body.phone === undefined || req.body.email === undefined || req.body.password === undefined || req.body.UUID === undefined){
        return res.json(400,{'err':'wrong request format'})
    }
    var md5 = crypto.createHash('sha256');
    var saltOfUser = uuid.v1();
    var password = md5.update(saltOfUser+req.body.password).digest('hex');
    var newUser = new User({
        salt: saltOfUser,
        phone: req.body.phone,
        email: req.body.email,
        password: password,
        UUID: req.body.UUID,
    });
    User.get(newUser,function(err,doc){
        if(err){
            return res.json(400,err);
        }
        if(doc){
            return res.json(401,{'err':'user has exist'});
        }
        newUser.save(function(err,user){
            if(err){
                return res.json(300,err);
            }
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
        });
    });
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
            var password = md5.update(salt+req.body.password).digest('hex');
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
            var oldPassword = md5.update(doc.user.userInfo.salt+req.body.oldPassword).digest('hex');
            if(oldPassword == doc.user.userInfo.password){
                var _md5 = crypto.createHash('sha256');
                var newSalt = uuid.v1();
                var newPassword = _md5.update(newSalt+req.body.newPassword).digest('hex');
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
            var sid = md5.update(email+'$'+outTime+'@'+privateKey).digest('hex');
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
        var sid = md5.update(doc.email+'$'+doc.outTime+'@'+doc.privateKey).digest('hex');
        if(req.query.sid != sid){
            return res.json(400,{'err':'invalue sid '});
        }
        var Num = "";
        for(var i=0;i<8;i++) { 
            Num+=Math.floor(Math.random()*10); 
        }
        var _md5 = crypto.createHash('sha256');
        var newSalt = uuid.v1();
        var newPassword = _md5.update(newSalt+Num).digest('hex');
        User.changePassword(newPassword, newSalt,doc.email, function(err){
            if(err){
                return res.json(400,err);
            }
            return res.json(200,{'password':Num});
        }) 

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


exports.getUser= function(req, res){
  //通过email||phone 和 status位，索引数据，有则返回。
    User.get(req.session.user,function(err,user){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,user);
    });
};

var checkData = function(newDate,oldDate){
    //status check
    //value range check
    return 1;
};

exports.putUser = function(req, res){
    if(req.body.userData === undefined || req.body.checkKey === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    var userData = JSON.stringify(req.body.userData);
    var checkKey = req.body.checkKey;
    var salt = "ce23dc8d7a345337836211f829f0c05d";
    var md5 = crypto.createHash('md5');
    var newStr = userData+salt;
    var newKey = md5.update(newStr,'utf-8').digest('hex');
    if(checkKey == newKey){
        User.update(req.body.userData,function(err){
            if(err){
                return res.json(400,err);
            }
            Subscriber.changeSubscriberValidStatus(req.body.userData.user.starInfo.starId, req.body.userData.user.userInfo.userId, req.body.userData.user.starInfo.dieFlag, function(err){
                if(err){
                    return res.json(400,err);
                }
                return res.json(200,{'info':'upload success'});
            });
        });
    }else{
        return res.json(333,{'err':"Please don't be evil"});
    }
};


exports.checkUserVersion = function(req, res){
    //比较更新时间
    var query = req.body;
    if(query.user.userInfo.email === undefined || query.user.userInfo.phone === undefined || query.user.userInfo.lastUpDateTime === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    User.getByTime(query,function(err,todo){
        if(err){
            return res.json(400,err);
        }
        if(todo == "upload"){
            res.json(201,{'info':'need to upload device data'});
        }else if(todo == "download"){
            res.json(202,{'info':'need to download the newest data'});
        }
    });
};

exports.subscribeToStar = function(req, res){
    var query = req.body;
    if(query.starName === undefined || query.starId === undefined ||  query.deviceToken === undefined || query.userId === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    var newSubscriber = new Subscriber({
        'starId':query.starId,
        'starName':query.starName,
        'deviceToken':query.deviceToken,
        'userId':query.userId,
        'valid':true,
        'updateAt': new Date(),
    });
    Subscriber.getSubscriber(newSubscriber,function(err,doc){
        if(err){
            return res.json(400,err);
        }else if(doc){
            return res.json(200,{'info':'subscriber existed'});
        }else{
            newSubscriber.save(function(err){
                if(err){
                    return res.json(400,err);
                }
                return res.json(200,{'info':'subscriber success'});
            });
        }
    });
};

exports.unsubscribeToStar = function(req, res){
    var query = req.body;
    var status = false; // 不活跃
    if(query.starId === undefined || query.userId ===undefined
        || query.starId == "" || query.userId == ""){
        return res.json(400,{'err':'wrong request format'});
    }
    Subscriber.changeSubscriberValidStatus(query.starId, query.userId, status, function(err){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,{'info':'unscriber success'});
    });
};

exports.reLive = function(req, res){
    var query = req.body;
    var status = true; // 活跃
    if(query.starId === undefined || query.userId === undefined
        || query.starId == "" || query.userId == ""){
        return res.json(400, {'err':'wrong request format'})
    }

    Subscriber.changeSubscriberValidStatus(query.starId, query.userId, status, function(err){
        if(err){
            return res.json(400, err);
        }
        return res.json(200, {'info': 'relive success'})
    });
};