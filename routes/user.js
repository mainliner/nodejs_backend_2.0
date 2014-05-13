
/*
 * deal users info.
 */
var User = require('../models/user.js');
var Subscriber = require('../models/subscriber.js');

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
}

exports.putUser= function(req, res){
    //获取数据（email||phone )
    //检查数据是否合法（数值跨度）-> update
    User.get(req.body,function(err,user){
        if(err){
            return res.json(400,err);
        }
        if(user){
            var result = checkData(req.body, user);
            if(result){
                User.update(req.body, function(err){
                    if(err){
                        return res.json(400,err);
                    }
                    return res.json(200,{'info':'upload success'});
                });
            }else{
                User.modifyUserState(req.body,function(err){
                    if(err){
                        return res.json(400,{'err':'You are a hack, but modifyUserState failed'});
                    }
                    res.json(333,{'err':'you are a hacker'});
                });
            }
        }else{
            return res.json(400,{'err':'user not exist'});
        }
    });
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

var validateDeviceToken = function(token) {
    if (token.length < 64) {
        return false;
    }
    return true;
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
    if(query.starId === undefined || query.userId){
        return res.json(400,{'err':'wrong request format'});
    }
    Subscriber.removeSubscriber(query.starId, query.userId, function(err){
        if(err){
            return(400,err);
        }
        return res.json(200,{'info':'unscriber success'});
    });
};