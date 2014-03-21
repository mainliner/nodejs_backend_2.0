var mongodb = require('./db')

function Item(item){
    this.name = item.name;
    this.price = item.price;
    this.npc = item.npc;
    this.describe = item.describe;
    this.type = item.type;
};
module.exports = Item;

Item.prototype.save = function save(callback){
    var item = {
        name: this.name,
        price: this.price,
        describe: this.describe,
        npc: this.npc,
        type: this.type,
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
            collection.ensureIndex('name');
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
                var items = [];
                docs.forEach(function(doc,index){
                    var item = new Item(doc);
                    items.push(item);
                });
                callback(null,items);
            });
        });
    });
}
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
    };