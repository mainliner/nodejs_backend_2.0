var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Audio(audio){
    this.audioFileId = audio.audioFileId;
    this.starId = audio.starId;
    this.uploadDate = audio.uploadDate;
};

module.exports = Audio;

Audio.prototype.save = function(callback){
    var audio = {
        audioFileId:this.audioFileId,
        starId:this.starId,
        uploadDate:this.uploadDate
    }
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('audio',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('starId',function(err,audio){});
            collection.insert(audio,{w:1},function(err,audio){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,audio);
            });
        });
    });
};
Audio.getLastAudioByStarId = function (starId, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('audio',function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({'starId':starId},{audioFileId:1}).sort({uploadDate:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(err,docs[0]);
            });
        });
    });
};

Audio.getAudioByStarId = function (starId, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('audio',function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({'starId':starId},{audioFileId:1}).sort({uploadDate:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return  callback(err);
                }
                return callback(err,docs);
            });
        });
    });
};
