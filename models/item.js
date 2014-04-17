var mongodbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Item(item){
    this.item = {
        chineseName : item.chineseName,
        englishName : item.englishName,
        title : item.title,
        price : item.price,
        npc : item.npc,
        description : item.description,
        type : item.type,
        pictureBig : item.pictureBig,
        pictureSmall : item.pictureSmall
    }
};
module.exports = Item;

Item.prototype.save = function save(callback){
    var item = {
        item:this.item
    };
    mongodbPool.acquire(function(err,db){
        if (err){
            return callback(err);
        }
        db.collection('item', function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('item.englishName',function(){});
            collection.insert(item, {safe:true}, function(err,item){
                mongodbPool.release(db);
                callback(err,item);
            });
        });
    });
};

Item.getAll = function getAll(callback) {
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.find().sort({price:-1}).toArray(function(err,docs){
                mongodbPool.release(db);
                if (err) {
                    callback(err, null);
                }
                callback(null,docs);
            });
        });
    });
};
Item.changeItemInfo = function (id, newinfo, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.update({'_id':new ObjectID(id)},{'$set':newinfo},function(err){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};
Item.deleteItem = function (id, callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
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
/*
Item.get = function get(itemName, callback) {
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({name:itemName}, function(err,doc){
                mongodbPool.release(db);
                if(err){
                    return callback(err);
                }
                if(doc){
                   var item = new Item(doc);
                   callback(null,item); 
                }else{
                    callback(err,null);
                }
                });
            });
        });
    };*/