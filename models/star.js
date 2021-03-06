var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Star(star){
    this.star = {
        username:star.username,
        password:star.password,
        chineseName:star.ChineseName,
        englishName:star.EnglishName,
        nickName:star.nickName,
        birthday:star.birthday,
        gender:star.gender,
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
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('star.englishName',function(err,star){});
            collection.ensureIndex('star.username',function(err,star){});
            collection.insert(star,{w:1},function(err,star){
                mongodbPool.release(db);
                callback(err,star);
            });
        });
    });
};

Star.getAll = function(callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.find().toArray(function(err,docs){
                mongodbPool.release(db);
                if(err){
                    callback(err);
                }
                return callback(null,docs);
            });
        });
    });
};

Star.getByName = function(username,callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'star.username':username},function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
Star.changeStarInfo = function(starEnName, newInfo, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return  callback(err);
            }
            collection.update({'star.englishName':starEnName},{'$set':newInfo},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            })
        });
    });
};

Star.changePassword = function(username,newPassword,callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('star',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'star.username':username},{'$set':{'star.password':newPassword}},function(err){
                mongodbPool.release(db);
                if(err){
                    callback(err);
                }
                callback(null);
            });
        });
    });
};

