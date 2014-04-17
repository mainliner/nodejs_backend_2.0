var mongodbPool = require('./db');

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
    mongodbPool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('resetServer',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.ensureIndex('email',function(err,doc){});
            collection.update({email:resetInfo.email}, resetInfo, {upsert:true, w: 1},function(err){
                mongodbPool.release(db);
                callback(err);
            });
        });
    })
};

resetServer.getByEmail = function(email,callback){
    mongodbPool.acquire(function(err,db){
        if(err){
            callback(err);
        }
        db.collection('resetServer',function(err,collection){
            if(err){
                mongodbPool.release(db);
                return callback(err);
            }
            collection.findOne({'email':email},function(err,doc){ //need find and modify it to make one key only can be userd once
                mongodbPool.release(db);
                if(err){
                    callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
