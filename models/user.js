var mongodb = require('./db');
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
    mongodb.open(function(err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('users',function(err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('user.userInfo.status',function(err, user){});
            collection.ensureIndex('user.userInfo.UUID',function(err, user) {});
            collection.ensureIndex('user.userInfo.phone',function(err, user) {});
            collection.ensureIndex('user.userInfo.email',function(err, user) {});
            collection.insert(user,{w:1}, function(err,user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
};
User.get = function get(query,callback){
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({'user.userInfo.phone':query.user.userInfo.phone, 'user.userInfo.email':query.user.userInfo.email},function(err, doc){
                mongodb.close();
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
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
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
                    mongodb.close();
                    callback(err,doc);
                }else{
                    mongodb.close();
                    callback(err,null);
                }
            });
        });
    });
};

User.getByTime = function getByTime(query,callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var date = new Date(query.user.userInfo.lastUpDateTime);
            collection.findOne({'user.userInfo.email':query.user.userInfo.email, 'user.userInfo.phone':query.user.userInfo.phone,'user.userInfo.lastUpDateTime':{'$lt':date}},function(err,doc){
                mongodb.close();
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
    mongodb.open(function(err,db){
        if(err){
            return  callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return  callback(err);
            }
            collection.update({'_id':new ObjectID(id)},{'$set':query},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};


User.modifyUserState = function modifyUserState(query,callback){
        mongodb.open(function(err,db){
            if(err){
                return callback(err);
            }
            db.collection('users', function(err, collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                    collection.update({_id:new ObjectID(query._id)},{'$set':{'user.userInfo.status':'hack'}},{w:1},function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                        callback(null);
                    });
            });
        });

};
User.getByEmailAndName = function getByEmailAndName(query,callback){
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({'user.userInfo.name':query.user.userInfo.name, 'user.userInfo.email':query.user.userInfo.email},function(err,user){
                mongodb.close();
                if(err){
                    return callback(err,null);
                }
                callbck(null,user);
            });
        });
    });
};
//for test
/*
User.test = function (callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({_id:new ObjectID("5333edfc0e5b06e51d958b81")},function(err,user){
                mongodb.close()
                if(err){
                    return callback(err,null);
                }
                callback(err,user);
            });
        });

    });
};
*/
