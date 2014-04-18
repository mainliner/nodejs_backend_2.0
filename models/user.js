var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;


function User(user){
    this.user = {
        userInfo:{
            UUID: user.UUID,
            email: user.email,
            phone: user.phone,
            password: user.password,
            name: "None",
            gender: "None",
            birthday: new Date(),
            receiveGiftTime: 0,
            money: 3000,
            lovePoint: 200,
            lastUpDateTime: new Date(),
            photoFrame:"None",
            status: "normal"
        },
        starInfo:[
            {starId:"", name:"赵本山", startDate: new Date(), expireTime: new Date(), relationValue: 20, receiveItem:[]}
        ],
        npcInfo:[
            {name:'npc1',relationValue:0},{name:'npc2',relationValue:0},{name:'npc3',relationValue:0},{name:'npc4',relationValue:0},{name:'npc5',relationValue:0}
        ],
        items:{
            clothes:[
                {id:"", num:1},
                {id:"", num:1}
            ],
            furniture:[
                {id:"", num:1},
                {id:"", num:1}
            ],
            CD:[
                {id:"", num:1},
                {id:"", num:1}
            ],
            Props:[
                {id:"", num:1},
                {id:"", num:1}
            ],
        }
    };
};
module.exports = User;

User.prototype.save = function save(callback){
    var user = {
        user:this.user
    };
    mongodbPool.acquire(function(err,db) {
        if(err) {
            return callback(err);
        }
        console.log(db);
        db.collection('users',function(err,collection) {
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('user.userInfo.status',function(err, user){});
            collection.ensureIndex('user.userInfo.UUID',function(err, user) {});
            collection.ensureIndex('user.userInfo.phone',function(err, user) {});
            collection.ensureIndex('user.userInfo.email',function(err, user) {});
            collection.insert(user,{w:1}, function(err,user) {
                mongodbPool.release(db);
                callback(err, user);
            });
        });
    });
};
User.get = function get(query,callback){
    mongodbPool.acquire(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'user.userInfo.phone':query.user.userInfo.phone, 'user.userInfo.email':query.user.userInfo.email},function(err, doc){
                mongodbPool.release(db);
                if(doc){
                    callback(err,doc);
                }else{
                    callback(err,null);
                }
            });
        });
    });
};
User.getByLogin = function get(query,callback){
    mongodbPool.acquire(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'user.userInfo.phone':query.phone,'user.userInfo.email':query.email},function(err,doc){
                if(doc){
                    if(query.UUID != doc.user.userInfo.UUID){
                        collection.update({'user.userInfo.phone':query.phone,'user.userInfo.email':query.email},{'$set':{'user.userInfo.UUID':query.UUID}},function(err){
                            if(err){
                                return callback(err);
                            }
                            doc.user.userInfo.UUID = query.UUID;
                            return callback(err,doc);
                        });
                    }
                    mongodbPool.release(db);
                    callback(err,doc);
                }else{
                    mongodbPool.release(db);
                    callback(err,null);
                }
            });
        });
    });
};

User.getByTime = function getByTime(query,callback){
    mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            var date = new Date(query.user.userInfo.lastUpDateTime);
            collection.findOne({'user.userInfo.email':query.user.userInfo.email, 'user.userInfo.phone':query.user.userInfo.phone,'user.userInfo.lastUpDateTime':{'$lt':date}},function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                if(doc){
                    var todo = "upload";
                    return callback(null,todo);
                }else{
                    var todo = "download";
                    return callback(null,todo);
                }
            });
        });
    });
};

User.update = function update(query,callback){
    if(query._id){
        var id = query._id;
        delete query._id;
    }
    else{
        var err = {'err':'can not find the user'};
        return callback(err);
    }
    mongodbPool.acquire(function(err,db){
        if(err){
            return  callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return  callback(err);
            }
            collection.update({'_id':new ObjectID(id)},{'$set':query},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};


User.modifyUserState = function modifyUserState(query,callback){
        mongodbPool.acquire(function(err,db){
            if(err){
                return callback(err);
            }
            db.collection('users', function(err, collection){
                if(err){
                    mongodbPool.release(db);
                    return callback(err);
                }
                    collection.update({_id:new ObjectID(query._id)},{'$set':{'user.userInfo.status':'hack'}},{w:1},function(err){
                        mongodbPool.release(db);
                        if(err){
                            return callback(err);
                        }
                        callback(null);
                    });
            });
        });

};
User.getByEmailAndName = function getByEmailAndName(query,callback){
    mongodbPool.acquire(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'user.userInfo.name':query.name, 'user.userInfo.email':query.email},function(err,user){
                mongodbPool.release(db);
                if(err){
                    return callback(err,null);
                }
                callback(null,user);
            });
        });
    });
};

User.changePassword = function(newPassword,Num,email,callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'user.userInfo.email':email},{'$set':{'user.userInfo.password':newPassword}},function(err){
                mongodbPool.release(db);
                if(err){
                    callback(err);
                }
                callback(null,Num);
            });
        });
    });
};
//for test
/*
User.test = function (callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({_id:new ObjectID("5333edfc0e5b06e51d958b81")},function(err,user){
                mongodbPool.release(db)
                if(err){
                    return callback(err,null);
                }
                callback(err,user);
            });
        });

    });
};
*/
