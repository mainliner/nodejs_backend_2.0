
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var star = require('./routes/star');
var item = require('./routes/item');
var audio = require('./routes/audio');
var admin = require('./routes/admin');
var npc = require('./routes/npc');

var http = require('http');
var path = require('path');
var settings = require('./settings');
var MongoStore = require('connect-mongostore')(express);
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags:'a'});

var amqp = require('amqp');
var domainMiddleware = require('./lib/domain.js');

var server = http.createServer();
var app = express();



app.use(domainMiddleware({
    server:server,
    killTimeout: 30000
}));
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('env','production');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore(settings.singleServer), //settings.singleServer for localhost
    cookie: {},
}));
app.use(app.router);
/*
connect to rabbitMQ, create a exchange( routKey: A--APNS  E--Email) to push message to APNS queue or Emai queue 
*/
app.rabbitMQConnection = amqp.createConnection({host:settings.rabbitMQHost, 
                                                port:settings.rabbitMQPort,
                                                login:settings.rabbitMQUser,
                                                password:settings.rabbitMQPassword});
app.rabbitMQConnection.on('ready',function(){
        console.log('connect to the rabbitMQ successful');
        app.rabbitMQConnection.exchange('router',{type: 'direct',autoDelete: false,confirm: true},function(exchange){
            app.e = exchange;
        });
});

//production only
if ('production' == app.get('env')) {

    app.use(express.logger({stream:accessLogfile}));
    app.use(function(err, req, res, next){
        var meta = '['+ new Date() +']' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '\n');
        next();
    });
}

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

server.on('request', app);
if(!module.parent) {
    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}

exports.server= server;
exports.app = app;
