
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var item = require('./routes/item');
var audio = require('./routes/audio');
var admin = require('./routes/admin');

var http = require('http');
var path = require('path');
var settings = require('./settings');
var MongoStore = require('connect-mongo')(express);
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags:'a'});


var app = express();

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
//app.use(express.bodyParser({ keepExtensions: true, uploadDir: './' }));
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(app.router);


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

app.get('/', routes.index);

app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
app.post('/login', routes.checkNotLogin);
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
app.all('/items', routes.checkLogin);
app.get('/items', item.getAllItems);
app.post('/items', item.putItem);
//upload audio file to service
app.post('/upload', routes.checkLogin);
app.post('/upload', audio.upload);
app.post('/getallaudio', routes.checkLogin);
app.post('/getallaudio', audio.getAllAudio);
app.post('/getunreadaudio', routes.checkLogin);
app.post('/getunreadaudio', audio.getUnreadAudio);
app.post('/getlastaudio',routes.checkLogin);
app.post('/getlastaudio',audio.getLastAudio);

//only for admin 
app.all('/admin', admin.checkAdminNotLogin);
app.get('/admin', admin.login);
app.post('/admin', admin.doLogin);
app.get('/dashboard', admin.checkAdminLogin, admin.dashboard);
app.get('/adminlogout', admin.checkAdminLogin, admin.logout);


app.get('/showadmin', admin.checkAdminLogin, admin.showAdmin);
app.post('/addadmin',  admin.addAdmin);
app.get('/deladmin', admin.checkAdminLogin, admin.delAdmin);
app.post('/adminchangepwd', admin.checkAdminLogin, admin.changePassword);

app.get('/showstar', admin.checkAdminLogin, admin.showStar);
app.post('/changestarinfo', admin.checkAdminLogin, admin.changeStarInfo);
app.post('/addstar', admin.checkAdminLogin, admin.addStar);
app.get('/showitem', admin.showItem);
app.get('/itemdetail', admin.showItemDetail);
app.post('/additem', admin.addItem);

//app.post('/test',routes.test);

app.get('*', function(req, res){
    res.render('error', {
        'msg': 'No Found'
    });
});


if(!module.parent) {
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}
module.exports = app;
