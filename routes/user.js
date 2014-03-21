
/*
 * deal users info.
 */
var User = require('../models/user.js');

exports.getUser= function(req, res){
  //通过email||phone 和 status位，索引数据，有则返回。
  if(req.body.email){
    User.getByEmail(req.body.email,function(err,user){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,user);
    });
  }else if(req.body.phone){
    User.getByPhone(req.body.phone,function(err,user){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,user);
    });

  }
};

exports.putUser= function(req, res){
    //获取数据（email||phone + status）
    //检查更新时间
    //检查数据是否合法（数值跨度）-> update

    
};

exports.checkUserVersion = function(req, res){
    //比较更新时间
    query = req.body;
    User.getByTime(query,function(err,todo){
        if(err){
            return res.json(400,err);
        }
        if(todo == "noneed"){
            res.json(200,{'info':'no need to sync'});
        }else if(todo == "update"){
            res.json(201,{'info':'need to update device data'});
        }else if(todo == "download"){
            res.json(202,{'info':'need to download the newest data'});
        }
    });
};