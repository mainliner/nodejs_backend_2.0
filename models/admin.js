var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Admin (admin){
    this.username = admin.username;
    this.password = admin.password;
    this.level = admin.level;
}

module.exports = Admin;

Admin.prototype.save =  function(callback){
    var admin = {
        username: this.username,
        password: this.password,
        level: this.level
    }
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('username',function(){});
            collection.ensureIndex('password',function(){});
            collection.insert(admin,{w:1},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,doc)
            });
        });
    });
};
Admin.getAdmin = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find().toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs);
            });
        });
    });

};

Admin.get = function(username,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({'username':username},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,doc);
            });
        });
    });
};
Admin.getStar = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({level:2}).toArray(function(err,docs){
                mongodb.close()
                if(err){
                    return callback(err);
                }
                return callback(null, docs);
            });
        });
    });
};

Admin.changePassword = function(admin,newPassword,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({'username':admin.username},{'$set':{'password':newPassword}},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};


Admin.deleteAdmin = function(username,callback){
    //only level 0 admin can do delete opt
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({'username':username},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};

Admin.deleteStar = function(starId,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admin_user',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({'_id':new ObjectID(starId)},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
}
