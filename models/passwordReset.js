var mongodb = require('./db');

function resetServer(resetInfo){
    this.email = resetInfo.email;
    this.privateKey = resetInfo.privateKey;
    this.outTime = resetInfo.outTime;
}
module.exports = resetServer;

resetServer.prototype.save = function save(callback){
    var resetInfo = {
            email:this.email,
            privateKey:this.privateKey,
            outTime:this.outTime
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('resetServer',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('email',function(err,doc){});
            collection.update({email:resetInfo.email}, resetInfo, {upsert:true, w: 1},function(err){
                mongodb.close();
                callback(err);
            });
        });
    })
};

resetServer.getByEmail = function(email,callback){
    mongodb.open(function(err,db){
        if(err){
            callback(err);
        }
        db.collection('resetServer',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({'email':email},function(err,doc){ //need find and modify it to make one key only can be userd once
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
