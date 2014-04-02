var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Star(star){
    this.star = {
        ChineseName:star.ChineseName,
        EnglishName:star.EnglishName,
        nickName:star.nickName,
        birthday:star.birthday,
        birthplace:star.birthplace,
        blood:star.blood,
        constellation:star.constellation,
        stature:star.stature,
        voice:star.voice,
        description:star.description,
        headPortrait:star.headPortrait,
        portraitBig:star.portraitBig,
        portraitSmall:star.portraitSmall
    };
}

module.exports = Star;

Star.prototype.save = function (callback){
    var star = {
        star:this.star;
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
            collection.ensureIndex('star.EnglishName',function(err,star){});
            collection.insert(star,{w:1},function(err,star){
                mongodb.close();
                callback(err,star);
            });
        });
    });
};

Star.getAll = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection(function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find(function(err,stars){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,stars);
            });
        });
    });
};

Star.getByName = function(query,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection(function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({'star.EnglishName':query.EnglishName,'star.ChineseName':query.ChineseName},function(err,doc){
                mongodb.close;
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });

            }
        });
    });
};

