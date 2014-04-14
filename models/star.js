var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Star(star){
    this.star = {
        username:star.username,
        password:star.password,
        chineseName:star.ChineseName,
        englishName:star.EnglishName,
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
        star:this.star,
    }
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('star.englishName',function(err,star){});
            collection.ensureIndex('star.username',function(err,star){});
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
        db.collection('star',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find().toArray(function(err,docs){
                mongodb.close();
                if(err){
                    callback(err);
                }
                return callback(null,docs);
            });
        });
    });
};

Star.getByName = function(query,callback){
    //unuse function
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({'star.englishName':query.EnglishName,'star.ChineseName':query.ChineseName},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
Star.changeStarInfo = function(starEnName, newInfo, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodb.close();
                return  callback(err);
            }
            collection.update({'star.englishName':starEnName},{'$set':newInfo},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            })
        });
    });
};
