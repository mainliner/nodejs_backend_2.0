
/*
 * GET home page.
 */
var user = require('./user');
var star = require('./star');
var item = require('./item');
var npc = require('./npc');
var audio = require('./audio');
var admin = require('./admin');

module.exports = function(app) {
    app.get("/index", function (req, res) {
        res.render('index', { title: 'Let\'s date' });
    });

    app.post('/reg', user.checkNotLogin);
    app.post('/reg', user.doReg);

    app.post('/login', user.doLogin);

    app.post('/password', user.checkLogin);
    app.post('/password', user.password);

    app.all('/reset', user.checkNotLogin);
    app.post('/reset', user.reset);
    app.get('/reset', user.doReset);

    app.get('/logout', user.checkLogin);
    app.get('/logout', user.logout);

    //get and updata user info
    app.post('/check_user_version',user.checkLogin);
    app.post('/check_user_version', user.checkUserVersion);

    app.get('/getuser', user.checkLogin);
    app.get('/getuser', user.getUser);


    app.post('/putuser', user.putUser);


    //get item info
    app.get('/items',item.getAllItems);
    //get star info
    app.get('/stars', star.getAllStar);
    //get NPC info
    app.get('/npc', npc.getAllNPC);

    //player subscribe one star
    app.post('/subscribetostar', user.checkLogin);
    app.post('/subscribetostar', user.subscribeToStar);

    app.post('/unsubscribetostar', user.checkLogin);
    app.post('/unsubscribetostar', user.unsubscribeToStar);

    app.post('/relive',user.checkLogin);
    app.post('/relive', user.reLive);

    //diary audio and message
    app.post('/getdiaryaudioandmessage', user.checkLogin);
    app.post('/getdiaryaudioandmessage', star.getDiaryAudioAndMessage);

    app.post('/getlastaudio',user.checkLogin);
    app.post('/getlastaudio',audio.getLastAudio);

    app.post('/getlastmessage',user.checkLogin);
    app.post('/getlastmessage', star.getLastMessage);

    //some service about the star
    //---------------------------------------
    app.post('/upload', audio.upload);//need star login check
    app.post('/putmessage', star.starUploadMessage);//need star login check

    app.post('/starLogin', star.starLogin);
    app.post('/starLogout', star.starLogout);
    app.post('/starChangePassword', star.checkLogin);
    app.post('/starChangePassword', star.starChangePassword);

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
    app.post('/test',function(req,res){

        var userData = JSON.stringify(req.body.userData);
        var checkKey = req.body.checkKey;
        var salt = "12345678901234567890";
        var crypto = require('crypto');
        var md5 = crypto.createHash('md5');
        var newStr = userData+salt;
        var newKey = md5.update(newStr,'utf-8').digest('hex');
        if(checkKey == newKey){
            console.log('YES');
        }
        res.json(200,{'info':newKey});
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
}

/*
exports.test = function(req, res){
    app.exchange = app.rabbitMQConnection.exchange('APNSRouter',{confirm:true,type:'Direct'},function(exchange){
        console.log(exchange.name);
    });
    res.json(200,{'info':'sdfsd'});
};
*/
