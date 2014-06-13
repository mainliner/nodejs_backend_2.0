
/*
 * deal users info.
 */
var User = require('../models/user.js');
var Subscriber = require('../models/subscriber.js');
var crypto = require('crypto');

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
            return res.json(200,{'info':'upload success'});
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
    if(query.starId === undefined || query.userId ===undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Subscriber.removeSubscriber(query.starId, query.userId, function(err){
        if(err){
            return(400,err);
        }
        return res.json(200,{'info':'unscriber success'});
    });
};