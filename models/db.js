var settings = require('../settings');
var poolModule = require('generic-pool');
var mongodb = require('mongodb');

var pool = poolModule.Pool({
    name     : 'mongodb',
    create   : function(callback) {
        mongodb.MongoClient.connect('mongodb://localhost:27017/wedate', {
            server:{poolSize:1}
        }, function(err,db){
            callback(err,db);
        });
    },
    destroy  : function(db) { db.close(); },
    max      : 10,//根据应用的可能最高并发数设置
    idleTimeoutMillis : 30000,
    log : false 
});

module.exports = pool;

//var Db = require('mongodb').Db;
//var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
/*
var server_options={auto_reconnect:true,poolSize:5};
var db = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, server_options),{w:1});
db.open(function(err,db){
    if(err) throw err;
    console.info('mongodb connected');
});
module.exports = db;
*/