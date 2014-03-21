var mongodb = require('./db');

var userInitItem = ["apple","mirror"];

function User(user){
    this.email = user.email;
    this.phone = user.phone;
    this.password = user.password;
    this.UUID = user.UUID;
    this.lastUpDateTime = new Date();
    //init with default
    this.name = "None";
    this.birthday = new Date();
    this.receiveGiftTime = 0;
    this.gender = "男";
    this.money = 3000;
    this.fmailyValue = [{'npc1':1},{'npc2':1},{'npc3':1}];
    this.album = [];
    this.star = [];
    this.item = userInitItem;
    this.status = "normal";
};
module.exports = User;

User.prototype.save = function save(callback){
    var user = {
        email:this.email,
        phone:this.phone,
        password:this.password,
        UUID:this.UUID,
        lastUpDateTime:this.lastUpDateTime,
        name:this.name,
        birthday:this.birthday,
        receiveGiftTime:this.receiveGiftTime,
        gender:this.gender,
        money:this.money,
        familyValue:this.fmailyValue,
        album:this.album,
        star:this.star,
        item:this.item,
        status:this.status,
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
            collection.ensureIndex('status',function(err, user){});
            collection.ensureIndex('UUID',function(err, user) {});
            collection.ensureIndex('phone',function(err, user) {});
            collection.ensureIndex('email',function(err, user) {});
            collection.insert(user,{w:1}, function(err,user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
};
User.getByEmail = function get(email,callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({email:email},function(err, doc) {
                mongodb.close();
                if (doc){
                    var user = new User(doc);
                    callback(err,user);
                }else{
                    callback(err,null);
                }
            });
        });
    });
};
User.getByPhone = function get(phone,callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('users', function(err,collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({phone:phone},function(err, doc) {
                mongodb.close();
                if (doc){
                    var user = new User(doc);
                    callback(err,user);
                }else{
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
            if(query.email){
                collection.find({email:query.email,lastUpDateTime:{"$lt": query.lastUpDateTime}},function(err,doc){
                    if(err){
                        mongodb.close();
                        return callback(err);
                    }
                    if(doc){
                        var todo = "update";
                        return callback(null,todo);
                    }else{
                        var todo = "download";
                        return callback(null,todo);
                    }
                });
            }
            else if(query.phone){
                collection.find({phone:query.phone,lastUpDateTime:{"$lt": query.lastUpDateTime}},function(err,doc){
                    if(err){
                        mongodb.close();
                        return callback(err);
                    }
                    if(doc){
                        var todo = "update";
                        return callback(null,todo);
                    }else{
                        var todo = "download";
                        return callback(null,todo);
                    }
                });
            }
        });
    });
};

User.update = function update(query,callback){
    
};