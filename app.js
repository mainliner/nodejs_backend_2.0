
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
var MongoStore = require('connect-mongo')(express);
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
    store: new MongoStore({
        db: settings.db
    }),
    cookie: {},
}));
app.use(app.router);
/*
connect to rabbitMQ, create a exchange( routKey: A--APNS  E--Email) to push message to APNS queue or Emai queue 
*/
app.rabbitMQConnection = amqp.createConnection({host:"localhost", port:5672});;
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

//for normal game player
//--------
app.get('/', routes.index);
app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
//app.post('/login', routes.checkNotLogin);//Maybe this should not be used when server for a iOS client
app.post('/login', routes.doLogin);
//app.post('/password', routes.checkLogin);
app.post('/password', routes.password);
app.all('/reset', routes.checkNotLogin);
app.post('/reset', routes.reset);
app.get('/reset', routes.doReset);
app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);
//get and updata user info
app.post('/check_user_version',routes.checkLogin);
app.post('/check_user_version', user.checkUserVersion);
app.get('/getuser', routes.checkLogin);
app.get('/getuser', user.getUser);
app.post('/putuser', routes.checkLogin);
app.post('/putuser', user.putUser);
//get item info
app.get('/items',item.getAllItems);
//get star info
app.get('/stars', star.getAllStar);
//get NPC info
app.get('/npc', npc.getAllNPC);
//player subscribe one star
app.post('/subscribetostar' ,routes.checkLogin ,user.subscribeToStar);
app.post('/unsubscribetostar' ,routes.checkLogin ,user.unsubscribeToStar);


//some service about the star
//---------------------------------------
app.post('/upload', audio.upload);//need star login check
app.post('/putmessage', star.starUploadMessage);//need star login check
//app.post('/getallaudio', routes.checkLogin);
//app.post('/getallaudio', audio.getAllAudio);
app.post('/getlastaudio',routes.checkLogin);
app.post('/getlastaudio',audio.getLastAudio);
app.post('/getlastmessage',routes.checkLogin);
app.post('/getlastmessage', star.getLastMessage);


//only for admin
//----------------------------------------- 
app.all('/admin', admin.checkAdminNotLogin);
app.get('/admin', admin.login);
app.post('/admin', admin.doLogin);
app.get('/dashboard', admin.checkAdminLogin, admin.dashboard);
app.get('/adminlogout', admin.checkAdminLogin, admin.logout);
app.get('/showadmin', admin.checkAdminLogin, admin.showAdmin);
app.post('/addadmin', admin.checkAdminLogin, admin.addAdmin);
app.get('/deladmin', admin.checkAdminLogin, admin.delAdmin);
app.post('/adminchangepwd', admin.checkAdminLogin, admin.changePassword);
app.get('/showstar', admin.checkAdminLogin, admin.showStar);
app.post('/changestarinfo', admin.checkAdminLogin, admin.changeStarInfo);
app.post('/addstar', admin.checkAdminLogin, admin.addStar);
app.get('/showitem', admin.checkAdminLogin, admin.showItem);
app.post('/changeiteminfo', admin.checkAdminLogin, admin.changeItemInfo);
app.post('/additem', admin.checkAdminLogin, admin.addItem);
app.get('/delitem', admin.checkAdminLogin, admin.deleteItem);
app.get('/shownpc', admin.checkAdminLogin, admin.showNPC);
app.post('/addnpc', admin.checkAdminLogin, admin.addNPC);
app.post('/changenpcinfo', admin.checkAdminLogin, admin.changeNPCInfo);
app.get('/delnpc', admin.checkAdminLogin, admin.deleteNPC);
app.get('/language', admin.checkAdminLogin, admin.languageNPC);
app.post('/addlanguage', admin.checkAdminLogin, admin.addLanguageNPC);
app.get('/dellanguage', admin.checkAdminLogin, admin.deleteLanguageNPC);
app.get('/shop', admin.checkAdminLogin, admin.shopNPC);
app.post('/addshoptype', admin.checkAdminLogin, admin.addShopType);
app.get('/delshoptype', admin.checkAdminLogin, admin.deleteShopType);
app.post('/addshopitem', admin.checkAdminLogin, admin.addShopItem);
app.get('/delshopitem', admin.checkAdminLogin, admin.deleteShopItem);

/*
app.get('/test',function(req,res){
    var encoded_payload = JSON.stringify({'starId':'534ba1488ccd99bf7a63ad75','message':'一条未接来电','noticeType':'audio','badge':1});
                app.e.publish('A',encoded_payload,{},function(err,message){
                    if(err){
                        //need to save the unpush message for resend
                        return res.json(200,{'info':' success'});
                    }
                    return res.json(200,{'info':' success'});
                });
});
app.get('/domain',function(req,res){
    setTimeout(function() {
        // Whoops!
        flerb.bark();
      });
});
*/

app.get('*', function(req, res){
    res.render('error', {
        'msg': 'No Found'
    });
});


server.on('request', app);
if(!module.parent) {
    server.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}

exports.server= server;
exports.app = app;
