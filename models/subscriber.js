var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Subscriber(subscriber){
    this.starId = subscriber.starId;
    this.starName = subscriber.starName;
    this.userId = subscriber.userId;
    this.deviceToken = subscriber.deviceToken;
    this.valid = subscriber.valid;
    this.updateAt = subscriber.updateAt;
};

module.exports = Subscriber;

Subscriber.prototype.save = function(callback){
    var subscriber = {
        'starId':this.starId,
        'starName':this.starName,
        'userId':this.userId,
        'deviceToken':this.deviceToken,
        'valid':this.valid,
        'updateAt':this.updateAt
    };
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('subscriber',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('starId',function(){});
            collection.ensureIndex('userId',function(){});
            collection.insert(subscriber,{w:1},function(err,audio){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};

Subscriber.changeSubscriberValidStatus = function(starId, userId, status, callback){
    mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }

        db.collection('subscriber', function(err, collection) {
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }

            collection.update({'starId':starId,'userId':userId},{'$set':{'valid':status}},{w:1},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Subscriber.removeSubscriber = function(starId, userId, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('subscriber', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.remove({'starId':starId,'userId':userId},{w:1},function(err,numberofremove){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return  callback(null);
            });
        });
    });
};

Subscriber.getSubscriber = function(sub,callback){
        mongodbPool.acquire(function (err,db){
            if(err){
                return callback(err);
            }
            db.collection('subscriber',function(err,collection){
                if(err){
                    mongodbPool.release(db);
                    return callback(err);
                }
                collection.findOne({'starId':sub.starId,'userId':sub.userId,'deviceToken':sub.deviceToken},function(err,doc){
                    mongodbPool.release(db);
                    if(doc){
                        return callback(err,doc);
                    }else{
                        return callback(err,null);
                    }
                });
            });
        });
};