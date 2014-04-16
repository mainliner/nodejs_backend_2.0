var mongodb = require('./db');
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
    mongodb.open(function(err,db){
        if (err){
            return callback(err);
        }
        db.collection('item', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('item.englishName',function(){});
            collection.insert(item, {safe:true}, function(err,item){
                mongodb.close();
                callback(err,item);
            });
        });
    });
};

Item.getAll = function getAll(callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find().sort({price:-1}).toArray(function(err,docs){
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null,docs);
            });
        });
    });
};
Item.changeItemInfo = function (id, newinfo, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({'_id':new ObjectID(id)},{'$set':newinfo},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            });
        });
    });
};
Item.deleteItem = function (id, callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({'_id':new ObjectID(id)},function(err){
                mongodb.close();
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
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('item',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:itemName}, function(err,doc){
                mongodb.close();
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