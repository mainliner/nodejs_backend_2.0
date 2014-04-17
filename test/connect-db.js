var mongodbPool = require('../models/db.js');
var http = require('http');

var server = http.createServer(function(req,res){
    mongodbPool.acquire(function(err,db){
        if(err){
            res.statusCode = 500;
            res.end(JSON.stringify(err,null,2));
        }
        db.collection('test').save({test:100},function(err,result){
            mongodbPool.release(db);
            res.end(JSON.stringify(result,null,2));
        
       });
    });
});
server.listen(8080,function(){
    console.log('server listen to %d',this.address().port);
});
setTimeout(function(){
    http.get('http://localhost:8080',function(res){console.log('request ok')});
    http.get('http://localhost:8080',function(res){console.log('request ok')});
    http.get('http://localhost:8080',function(res){console.log('request ok')});
    http.get('http://localhost:8080',function(res){console.log('request ok')});
    http.get('http://localhost:8080',function(res){console.log('request ok')});
    http.get('http://localhost:8080',function(res){console.log('request ok')});
},2000);