var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function NPC(npc){
    this.npc = {
        npcChineseName: npc.npcChineseName,
        npcEnglishName: npc.npcEnglishName,
        birthday: npc.birthday,
        blood: npc.blood,
        constellation: npc.constellation,
        description: npc.description,
        petPhrase: npc.petPhrase,
        language: [],
        l2dModel: npc.l2dModel,
        shopModel:{
            englishTitle:npc.shopModel.englishTitle,
            chineseTitle:npc.shopModel.chineseTitle,
            titleImageStr:npc.shopModel.titleImageStr,
            backImageStr:npc.shopModel.backImageStr,
            typeArray:[
            ],
        },
    }
};
module.exports = NPC;

NPC.prototype.save = function save(callback) {
   var npc = {
        npc:this.npc
   };
   mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.insert(npc,{safe:true},function(err,npc){
                mongodbPool.release(db);
                callback(err,npc);
            });
        });
   });
};

NPC.get = function (id, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc',function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'_id': new ObjectID(id)}, function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return callback(err,null);
                }
                return callback(null,doc);
            });
        });
    });
};

NPC.getAll = function (callback) {
    mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('npc',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.find().toArray(function(err,docs){
                mongodbPool.release(db);
                if(err){
                    return callback(err,null);
                }
                return callback(null, docs);
            });
        });
    });
};

NPC.changeNPCInfo = function (id, newInfo, callback){
    mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'_id':new ObjectID(id)},{'$set':newInfo},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
}
NPC.pushLanguage = function (id, language, callback){
    mongodbPool.acquire(function(err, db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'_id': new ObjectID(id)},{'$push':{'npc.language':language}}, function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};

NPC.deleteNPC = function (id, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return  callback(err);
            }
            collection.remove({'_id':new ObjectID(id)},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};

NPC.deleteLanguage = function(id, data, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return  callback(err);
        }
        db.collection('npc', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'_id':new ObjectID(id)}, {'$pull':{'npc.language':data}}, function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null)
            });
        });
    });
};

NPC.addShopType = function(id, shopType, englishShopType,callback){
    newShopType = {
        'shopType':shopType,
        'englishShopType':englishShopType,
        'item':[]
    }
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'_id':new ObjectID(id)}, {'$push':{'npc.shopModel.typeArray':newShopType}}, function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};
NPC.deleteShopType = function(id, index, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            var key = "npc.shopModel.typeArray." + index;
            var dict ={};
            dict[key] = 1;
            collection.update({'_id': new ObjectID(id)}, {'$unset': dict},function(err){
                if(err){
                    mongodbPool.release(db);
                    return callback(err);
                }
                collection.update({'_id': new ObjectID(id)}, {'$pull':{'npc.shopModel.typeArray':null}},function(err){
                    mongodbPool.release(db);
                    if(err){
                        return callback(err);
                    }
                    return callback(null);
                });
            });
        });
    });
};

NPC.addShopItem = function(id, index, item, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return  callback(err);
            }
            var key = "npc.shopModel.typeArray." + index + ".item";
            var dict = {};
            dict[key] = item;
            collection.update({'_id': new ObjectID(id)}, {'$addToSet': dict},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};
NPC.deleteShopItem = function(id, index, item, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('npc', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            var key = "npc.shopModel.typeArray." + index + ".item";
            var dict = {};
            dict[key] = item;
            collection.update({'_id': new ObjectID(id)}, {"$pull": dict}, function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
}

