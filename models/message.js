var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Message(message){
    this.messagePhotoId = message.messagePhotoId;
    this.starId = message.starId;
    this.messageBody = message.messageBody;
    this.uploadDate = message.uploadDate;
};

module.exports = Message;

Message.prototype.save = function(callback){
    var message = {
        messagePhotoId: this.messagePhotoId,
        starId: this.starId,
        messageBody: this.messageBody,
        uploadDate: this.uploadDate
    };
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('message',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('starId',function(err,audio){});
            collection.insert(message,{w:1},function(err,message){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null,message);
            });
        });
    });
};

Message.getLastMessageByStarId = function(starArray,messageLoadTime,callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('message', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            var date = new Date(messageLoadTime);
            collection.find({'starId':{'$in':starArray},'uploadDate':{'$gt':date}}).sort({uploadDate:1}).toArray(function(err,docs){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(err,docs);
            });
        });
    });
};

Message.getMessageByStarId = function(starId, starDateTime, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('message', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            var date = new Date(starDateTime);
            collection.find({'starId':date, 'uploadDate':{'$gt':date}}).sort({uploadDate:1}).toArray(function(err,docs){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(err,docs);
            });
        });
    });
};
