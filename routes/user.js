
/*
 * deal users info.
 */
var User = require('../models/user.js');

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
        }
    });
};

exports.checkUserVersion = function(req, res){
    //比较更新时间
    query = req.session.user;
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
