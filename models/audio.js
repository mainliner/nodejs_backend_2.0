var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Audio(audio){
    this.audioFileId = audio.fileID;
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
        db.collection(function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
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
