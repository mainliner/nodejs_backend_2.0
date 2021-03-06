var Admin = require('../models/admin.js');
var Star = require('../models/star.js');
var Item = require('../models/item.js');
var NPC = require('../models/npc.js');
var settings = require('../settings');
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
    req.session.destroy(function(err){
        if(err){
            return res.json(400,err);
        }
        return res.redirect('/admin');
    });
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
                req.session.cookie.originalMaxAge = settings.maxAge;
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
                        return res.render('error', {'msg': 'change password failed'});
                    }
                    return res.redirect('/dashboard');
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
    res.render('dashboard',{'user':admin});
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
                    return res.redirect('/showadmin');
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
        return res.render('adminlist',{'msg':"You don't have the power to search these message",'list':'','user':req.session.admin});
    }
    Admin.getAdmin(function(err,docs){
        if(err){
            return res.render('adminlist',{'msg':'Get admin list failed.','list':'','user':req.session.admin});
        }
        return res.render('adminlist', {'msg':'','list':docs,'user':req.session.admin});
    });
};

exports.showStar = function(req, res){
    Star.getAll(function(err,docs){
        if(err){
            return res.render('starlist',{'msg':'load star info failed','list':'','user':req.session.admin});
        }
        return res.render('starlist',{'msg':'','list':docs,'user':req.session.admin});
    });
};
exports.addStar = function(req, res){
    if(req.param("username") ==="" || req.param("password") ===""){
        return res.render('starlist',{'msg':'username and password can not be blank','list':''});
    }
    var md5 =  crypto.createHash('md5');
    var password = md5.update(req.param("password")).digest('base64');
    var starBirthday = new Date(parseInt(req.param("year")), parseInt(req.param("month"))-1, parseInt(req.param("day")) );
    var newStar = new Star({
        username:req.param("username"),
        password:password,
        ChineseName:req.param("chinesename"),
        EnglishName:req.param("englishname"),
        nickName:req.param("nickname"),
        birthday:starBirthday,
        gender:req.param("gender"),
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
    Star.getByName(req.param("username"),function(err,doc){
        if(err){
            return res.render('error',{'msg':'create star failed'});
        }
        if(doc){
            return res.render('error',{'msg':'star user has already existed'});
        }
        newStar.save(function(err,star){
            if(err){
                return res.render('error',{'msg':'create star failed'});
            }
            return res.redirect('/showstar');
        });
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
            'star.gender':req.param('gender'),
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
    Item.getAll(function(err,docs){
        if(err){
            return res.render('itemlist',{'msg':'load item info failed','list':'','user':req.session.admin});
        }
        return res.render('itemlist',{'msg':'','list':docs,'user':req.session.admin});
    });
};
exports.addItem = function(req, res){
    if(req.param('chinesename') ==="" || req.param('englishname') === ""){
        return res.render('error',{'msg':'wrong request format'});
    }
    var newItem = new Item({
        chineseName:req.param('chinesename'),
        englishName : req.param('englishname'),
        title : req.param('title'),
        price : parseInt(req.param('price')),
        LP : parseInt(req.param('lp')),
        isRMB : parseInt(req.param('isrmb')),
        sex : req.param('sex'),
        wearable : parseInt(req.param('wearable')),
        attribute : parseInt(req.param('attribute')),
        description : req.param('description'),
        type : req.param('type'),
        pictureBig : req.param('picturebig'),
        pictureSmall : req.param('picturesmall'),
        level:parseInt(req.param('level'))
    });
    newItem.save(function(err,item){
        if(err){
            return res.render('error',{'msg':'create item failed!'});
        }
        return res.redirect('/showitem');
    });
};
exports.changeItemInfo = function(req, res){
    if(req.param("englishname") ==="" || req.param("chinesename") ==="" || req.param('id') ===""){
        return res.render('error',{'msg':'wrong requst format'});
    }
    var newInfo = {
        'item.chineseName':req.param('chinesename'),
        'item.englishName': req.param('englishname'),
        'item.title': req.param('title'),
        'item.price': parseInt(req.param('price')),
        'item.LP': parseInt(req.param('lp')),
        'item.isRMB': parseInt(req.param('isrmb')),
        'item.sex': req.param('sex'),
        'item.wearable': parseInt(req.param('wearable')),
        'item.attribute': parseInt(req.param('attribute')),
        'item.description': req.param('description'),
        'item.type': req.param('type'),
        'item.pictureBig': req.param('picturebig'),
        'item.pictureSmall': req.param('picturesmall'),
        'item.level': parseInt(req.param('level'))
    };
    Item.changeItemInfo(req.param('id'),newInfo,function(err){
        if(err){
            return res.render('error','Edit the item info failed');
        }
        return res.redirect('/showitem');
    });
};
exports.deleteItem = function(req, res){
    if(req.query.id === ""){
        return res.render('error','wrong request format');
    }
    if(req.session.admin.level != 0){
        return res.render('error',"You don't have the power to do this!");
    }
    Item.deleteItem(req.query.id, function(err){
        if(err){
            return res.render('error',"delete item failed!");
        }
        return res.redirect('/showitem');
    });

};
exports.showNPC = function(req, res){
     NPC.getAll(function(err,docs){
        if(err){
            return res.render('npclist',{'msg':'load item info failed','list':'','user':req.session.admin});
        }
        return res.render('npclist',{'msg':'','list':docs,'user':req.session.admin});
    });
};
exports.addNPC = function(req, res){
    var NPCBirthday = new Date(parseInt(req.param("year")), parseInt(req.param("month"))-1, parseInt(req.param("day")) );
    var newNPC = new NPC({
        npcChineseName: req.param('npcchinesename'),
        npcEnglishName: req.param('npcenglishname'),
        birthday: NPCBirthday,
        blood: req.param('blood'),
        constellation: req.param('constellation'),
        description: req.param('description'),
        petPhrase: req.param('petphrase'),
        l2dModel: req.param('l2dmodel'),
        shopModel: {
            englishTitle:req.param('englishtitle'),
            chineseTitle:req.param('chinesetitle'),
            titleImageStr:req.param('titleimagestr'),
            backImageStr:req.param('backimagestr'),
        },
    });
    newNPC.save(function(err,npc){
        if(err){
            return res.render('error',{'msg':'create npc failed!'});
        }
        return res.redirect('/shownpc');
    });
};
exports.changeNPCInfo = function(req, res){
    if(req.param("npcchinesename") ==="" || req.param("npcenglishname") ==="" || req.param('id') ===""){
        return res.render('error',{'msg':'wrong requst format'});
    }
    var newBirthday = new Date(req.param('birthday'));
    var newInfo = {
        'npc.npcChineseName': req.param('npcchinesename'),
        'npc.npcEnglishName': req.param('npcenglishname'), 
        'npc.birthday': newBirthday,
        'npc.blood':req.param('blood'),
        'npc.constellation':req.param('constellation'),
        'npc.description': req.param('description'),
        'npc.petPhrase': req.param('petphrase'),
        'npc.l2dModel': req.param('l2dmodel'),
        'npc.shopModel.englishTitle': req.param('englishtitle'),
        'npc.shopModel.chineseTitle': req.param('chinesetitle'),
        'npc.shopModel.titleImageStr': req.param('titleimagestr'),
        'npc.shopModel.backImageStr': req.param('backimagestr'),
    };
    NPC.changeNPCInfo(req.param('id'),newInfo,function(err){
        if(err){
            return res.render('error',{'msg':'change NPC info failed!'});
        }
        return res.redirect('/shownpc');
    })
};
exports.deleteNPC = function(req, res){
    if(req.query.id === ""){
        return res.render('error',{'msg': 'wrong request format'});
    }
    if(req.session.admin.level != 0){
        return res.render('error',{'msg':"You don't have the power to do this!"});
    }
    NPC.deleteNPC(req.query.id, function(err){
        if(err){
            return res.render('error',{'msg':'delete NPC failed!'});
        }
        return res.redirect('/shownpc');
    });
};
exports.languageNPC = function(req, res){
    NPC.get(req.query.id,function(err,npc){
        if(err){
            return res.render('language',{'msg':'load item info failed','data':{'npc':''},'user':req.session.admin});
        }
        return res.render('language',{'msg':'','data':npc,'user':req.session.admin});
    });
};
exports.addLanguageNPC = function(req, res){
    if(req.param('language') ===""){
        return res.render('error',{'msg':'wrong request format'});
    }
    NPC.pushLanguage(req.param('id'),req.param('language'),function(err){
        if(err){
            return res.render('error', {'msg':'add failed!'});
        }
        return res.redirect('/language?id='+req.param('id'));
    });
};
exports.deleteLanguageNPC = function(req, res){
    if(req.session.admin.level != 0){
        return res.render('error',{'msg':"You don't have the power to do this!"});
    }
    NPC.deleteLanguage(req.query.id, req.query.data, function(err){
        if(err){
            return res.render('error', {'msg':'delete failed!'});
        }
        return res.redirect('/language?id='+req.query.id);
    });
};
exports.shopNPC = function(req, res){
    NPC.get(req.query.id,function(err,npc){
        if(err){
            return res.render('shop',{'msg':'load shop info failed','data':'','list':'','user':req.session.admin});
        }
        Item.getAll(function(err,docs){
            if(err){
                return res.render('shop',{'msg':'load shop info failed','data':'','list':'','user':req.session.admin});
            }
            return res.render('shop',{'msg':'','data':npc,'list':docs,'user':req.session.admin});
        });
    });
};
exports.addShopType = function(req, res){
    if(req.param('shoptype') === ""){
        return res.render('error',{'msg':'wrong request formate'});
    }
    NPC.addShopType(req.param('id'), req.param('shoptype'), req.param('englishshoptype'),function(err){
        if(err){
            return res.render('error', {'msg':'add failed!'});
        }
        return res.redirect('/shop?id='+req.param('id'));
    });
};
exports.deleteShopType = function(req, res){
    NPC.deleteShopType(req.query.id, req.query.index, function(err){
        if(err){
            return res.render('error', {'msg':'delete failed'})
        }
        return res.redirect('/shop?id='+req.query.id);
    });
};
exports.addShopItem = function(req, res){
    if(req.param('item') == "none"){
        return res.render('error', {'msg': 'Please select one item for this shop type'});
    }
    NPC.addShopItem(req.param('id'),req.param('index'),req.param('item'),function(err){
        if(err){
            return res.render('error', {'msg':'add failed!'});
        }
        return res.redirect('/shop?id='+req.param('id'));
    });
};
exports.deleteShopItem = function(req, res){
    NPC.deleteShopItem(req.query.id, req.query.index, req.query.item, function(err){
        if(err){
            return res.render('error', {'msg': 'delete failed!'});
        }
        return res.redirect('/shop?id='+req.query.id);
    });
};
