var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

 function SingleLogin(loginInfo){
    this.userID = loginInfo.userID;
    this.sessionID = loginInfo.sessionID;
 }

module.exports = SingleLogin;

 SingleLogin.prototype.save = function(callback) {
     var loginInfo = {
        'userID' : this.userID,
        'sessionID' : this.sessionID,
     }
     mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('singleLogin',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('userID',function(err,doc){});
            collection.update({'userID': loginInfo.userID},loginInfo,{upsert:true},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });

        });
     })
 };

 SingleLogin.checkSessionID = function(userID, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err)
        }
        db.collection('singleLogin', function(err, collection){
            if(err){
                return callback(err);
            }
            collection.findOne({'userID':new ObjectID(userID)},function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return callback(err,null);
                }
                if(doc){
                    return callback(null,doc.sessionID);
                }else{
                    return callback(null,null);
                }
            });
        });
    });
 }