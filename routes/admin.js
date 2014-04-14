var Admin = require('../models/admin.js');
var Star = require('../models/star.js');
var Item = require('../models/item.js');
var crypto = require('crypto');

exports.checkAdminLogin = function (req, res, next){
    if(!req.session.admin) {
      return res.redirect('/admin');
    }else{
        next();
    }
};
exports.checkAdminNotLogin = function (req, res, next){
    if(req.session.admin) {
        return res.redirect('/dashboard');
    }else{
        next();
    }
};
exports.logout = function (req, res){
    req.session.admin = null;
    res.redirect('/admin');
};
exports.doReg = function (req, res){
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.query.password).digest('base64');
    var admin = new Admin({
        username:req.query.username,
        password:password,
        level:0
    });
    admin.save(function(err){
        if(err){
            res.json(999,{err:"failed to create root admin"});
        }
        res.json(200,{info:"create root admin success"});
    });
}
exports.login = function (req, res){
    res.render('admin');
};
exports.doLogin = function (req, res){
    if(req.param('username') === "" || req.param('password') === ""){
       return res.render('error',{'msg':'Wrong Request'});
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.param('password')).digest('base64');
    Admin.get(req.param('username'),function(err,admin){
        if(err){
            return res.render('error', {'msg':'Wrong Request'});
        }
        if(admin){
            if(password === admin.password){
                req.session.admin = admin;
                return res.redirect('/dashboard');
            }else{
                return res.render('error', {'msg': "password not match"});
            }
        }else{
            return res.render('error',{'msg': "Don't have this user"});
        }
    });
};
exports.changePassword = function(req, res){
    if(req.param('oldpassword') ===""||req.param('newpassword') ==="" || req.param('repeatpassword') ===""){
        return res.render('error',{'msg':'Wrong Request'});
    }
    if(req.param('newpassword') != req.param('repeatpassword')){
        return res.render('error',{'msg':'Please input the same password in new password and repeat password'});
    }
    var md5 = crypto.createHash('md5');
    var oldpassword = md5.update(req.param('oldpassword')).digest('base64');
    var _md5 = crypto.createHash('md5');
    var newpassword = _md5.update(req.param('newpassword')).digest('base64');
    Admin.get(req.session.admin.username,function(err,admin){
        if(err){
            return res.render('error', {'msg': 'wrong request'});
        }
        if(admin){
            if(admin.password === oldpassword){
                Admin.changePassword(admin,newpassword,function(err){
                    if(err){
                        return res.render('dashboard');
                    }
                    return res.render('dashboard');
                })
            }else{
                res.render('error',{'msg':'old password is not match'});
            }
        }else{
            return res.render('error',{'msg':'no this user! hey~'});
        }
    });
};
exports.dashboard = function (req, res){
    admin = req.session.admin;
    res.render('dashboard',admin);
};
exports.addAdmin = function(req, res){
    if(req.session.admin.level != 0){
        return res.render('error',{'msg':"you don't have power to do this!"});
    }
    if(req.param('password')==="" || req.param('username')===""){
        return res.render('error',{'msg':"please input the right value"});
    }
    Admin.get(req.param('username'),function(err,admin){
        if(err){
            return res.render('error',{'msg':"Create failed. Please try again!"});
        }
        if(admin){
            return res.render('error',{'msg':'The admin has already existed'});
        }
        var md5 = crypto.createHash('md5');
        var pwd = md5.update(req.param('password')).digest('base64');
        var newAdmin = new Admin({
            username:req.param('username'),
            password:pwd,
            level:parseInt(req.param('level'))
        });
        newAdmin.save(function(err,doc){
            if(err){
                return res.render('error',{'msg':'Create failed. Please try again!'});
            }
            if(doc){
                if(doc.level < 2){
                    return res.redirect('/showadmin');
                }else{
                    return res.redirect('/showstar');
                }
            }
        });
    });
};
exports.delAdmin = function(req, res){
    if(req.query.username ===""){
        return res.render('error',{'msg':'wrong request format'});
    }
    if(req.query.username === req.session.admin.username){
        return res.render('error',{'msg':'You can not delete yourself!'});
    }
    if(req.session.admin.level != 0){
        return res.render('error',{'msg':'You can not do this'});
    }
    Admin.deleteAdmin(req.query.username, function(err){
        if(err){
            return res.render('error',{'msg':'Delete failed. Please try again'});
        }
        return res.redirect('/showadmin');
    });
};
exports.showAdmin = function(req, res){
    if(req.session.admin.level != 0){
        return res.render('adminlist',{'msg':"You don't have the power to search these message",'list':''});
    }
    Admin.getAdmin(function(err,docs){
        if(err){
            return res.render('adminlist',{'msg':'Get admin list failed.','list':''});
        }
        if(docs){
            return res.render('adminlist', {'msg':'','list':docs});
        }else{
            return res.render('adminlist', {'msg':'No admin in db','list':''});
        }
    });
};

exports.showStar = function(req, res){
    Star.getAll(function(err,docs){
        if(err){
            return res.render('starlist',{'msg':'load star info failed','list':''});
        }
        return res.render('starlist',{'msg':'','list':docs});
    });
};
exports.addStar = function(req, res){
    if(req.param("username") ==="" || req.param("password") ===""){
        return res.render('starlist',{'msg':'username and password can not be blank','list':''});
    }
    var md5 =  crypto.createHash('md5');
    var password = md5.update(req.param("password")).digest('base64');
    var starBirthday = new Date(parseInt(req.param("year")), parseInt(req.param("mouth"))-1, parseInt(req.param("day")) );
    console.log(starBirthday);
    var newStar = new Star({
        username:req.param("username"),
        password:password,
        ChineseName:req.param("chinesename"),
        EnglishName:req.param("englishname"),
        nickName:req.param("nickname"),
        birthday:starBirthday,
        birthplace:req.param("birthplace"),
        blood:req.param("blood"),
        constellation:req.param("constellation"),
        stature:req.param("stature"),
        voice:req.param("voice"),
        description:req.param("description"),
        headPortrait:req.param("headportrait"),
        portraitBig:req.param("portraitbig"),
        portraitSmall:req.param("portraitsmall")
    });
    console.log(newStar);
    newStar.save(function(err,star){
        if(err){
            return res.render('error',{'msg':'create star failed'});
        }
        return res.redirect('/showstar');
    });
};
exports.changeStarInfo = function(req, res){
    if(req.param("englishname") ==="" || req.param("chinesename") ===""){
        return res.render('error',{'msg':'wrong requst format'});
    }
    var starEnName = req.param("englishname");
    var starBirthday = new Date(req.param("birthday"));
    var newInfo = {
            'star.nickName':req.param("nickname"),
            'star.birthday':starBirthday,
            'star.birthplace':req.param("birthplace"),
            'star.blood':req.param("blood"),
            'star.constellation':req.param("constellation"),
            'star.stature':req.param("stature"),
            'star.voice':req.param("voice"),
            'star.description':req.param("description"),
            'star.headPortrait':req.param("headportrait"),
            'star.portraitBig':req.param("portraitbig"),
            'star.portraitSmall':req.param("portraitsmall")
    };
    Star.changeStarInfo(starEnName,newInfo,function(err){
        if(err){
            return res.render('error',{'msg':'change star info failed'});
        }
        return res.redirect('/showstar');
    });

};

exports.showItem = function(req, res){

};
exports.addItem = function(req, res){

};
exports.showItemDetail = function(req, res){

};