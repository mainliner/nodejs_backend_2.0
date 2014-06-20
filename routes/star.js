/*
 * deal users info.
 */
var assert = require('assert');
var Star = require('../models/star.js');
var Message = require('../models/message.js');
var Audio = require('../models/audio.js');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodbPool = require('../models/db.js');
var wedate = require('../app.js');
var crypto = require('crypto');
var settings = require('../settings');

var Grid = require('mongodb').Grid;
var uploadErrorLogfile = require('./audio.js').uploadErrorLogfile;

exports.getAllStar = function(req, res){
    Star.getAll(function(err,stars){
        if(err){
            res.json(400,{'err':'get stars error'});
        }
        res.json(200,stars);
    });};

exports.starLogin = function(req, res){
    if(req.body.name === undefined || req.body.password === undefined
        || req.body.name == "" || req.body.password == ""){
        return res.json(400,{"err": "Please input your username and password"});
    }

    Star.getByName(req.body.name, function(err,doc){
        if(err){
            return res.json(400,err);
        }

        if(doc){
            var md5 =  crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('base64');

            if(doc.star.password == password){
                req.session.cookie.originalMaxAge = settings.maxAge;
                req.session.star = doc;

                return res.json(200, doc);
            }else{
                return res.json(402,{'err':'password does not match'});
            }
        }else{
            return res.json(401,{'err':'user does not exist'});
        }
    });
};

exports.starLogout = function(req, res){
    req.session.destroy(function(err){
        if(err){
            return res.json(400,{'info':'logout failed'});
        }
        return res.json(200,{'info':'logout success'});
    });
};

exports.checkLogin = function(req, res, next) {
    if(!req.session.star) {
        return res.json(302, {'err': 'you have not login'});
    }else{
        next();
    }
}

exports.starChangePassword = function(req, res){
    if(req.body.name === undefined || req.body.oldPassword === undefined || req.body.newPassword == undefined){
        return res.json(400, {'err': 'wrong request format'});
    }

    if(req.body.name == "" || req.body.oldPassword == "" || req.body.newPassword == ""){
        return res.json(400, {'err': 'Please input your password'});
    }

    Star.getByName(req.body.name, function(err, doc){
        if(err) {
            return res.json(400, err);
        }

        if(doc){
            var md5 =  crypto.createHash('md5');
            var oldPassword = md5.update(req.body.oldPassword).digest('base64');

            if(doc.star.password == oldPassword){
                var _md5 = crypto.createHash('md5');
                var newPassword = _md5.update(req.body.newPassword).digest('base64');

                Star.changePassword(req.body.name, newPassword, function(err) {
                    if(err) {
                        return res.json(400, err);
                    }

                    return res.json(200, {'info': 'change password success'});
                });
            }else {
                return res.json(402, {'err': 'password does not match'});
            }
        }else {
            return res.json(401, {'err': 'star does not exist'});
        }
    });
};

exports.starUploadMessage = function(req, res){
        mongodbPool.acquire(function(err,db){
        if(err){
            return res.josn(400,{'err':'acquire db failed'});
        }
        var gridform = require('gridform');
        gridform.db = db;
        gridform.mongo = mongo;
        var form = gridform();
        form.parse(req, function (err, fields, files) {
            //mongodbPool.release(db);
            if(err){
                mongodbPool.release(db);
                return res.json(400,err);
            }  
            if(files.message_photo === undefined || fields.star_id === undefined || fields.messagebody === undefined){
                //need to delete the message file which save in the Gridfs 
                var grid = new Grid(db, 'fs');
                for(var key in files){
                    grid.delete(files[key].id, function(err, result){
                        if(err){
                            //the useless file data can not be delete, its id need to record in error log
                            uploadErrorLogfile.write('file need to delete: '+files[key].id);
                        }
                    });
                }
                mongodbPool.release(db);
                return res.json(400,{'err':'wrong formate'});
            } 
            var message = new Message({
                messagePhotoId: files.message_photo.id,
                starId: fields.star_id,
                messageBody: fields.messagebody,
                uploadDate: new Date()
            });
            message.save(function(err,doc){
                if(err){
                    var grid = new Grid(db, 'fs');
                    for(var key in files){
                        grid.delete(files[key].id, function(err,result){
                            if(err){
                                //the useless file data can not be delete, its id need to record in error log
                                uploadErrorLogfile.write('file need to delete: '+files.starVoiceMessage.id);
                            }
                        });
                    } 
                    mongodbPool.release(db);
                    return res.json(400,err);
                }
                mongodbPool.release(db);
                var encoded_payload = JSON.stringify({'starId':fields.star_id,'message':'一条未读短信','noticeType':'text','badge':1});
                wedate.app.e.publish('A',encoded_payload,{},function(err,message){
                    if(err){
                        //need to save the unpush message for later use here
                        return res.json(200,{'info':'upload success'});
                    }
                    return res.json(200,{'info':'upload success'});
                });
            });
        });
    });
};
exports.getLastMessage = function(req, res){
    if(req.body.starArray === undefined || req.body.messageLoadTime === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Message.getLastMessageByStarId(req.body.starArray,req.body.messageLoadTime,function(err,docs){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,docs);
    });
};
exports.getDiaryAudioAndMessage = function(req, res){
    if(req.body.starId === undefined || req.body.starDateTime === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Audio.getAudioByStarId(req.body.starId, req.body.starDateTime, function(err,audioArray){
        if(err){
            return res.json(400, err);
        }
        Message.getMessageByStarId(req.body.starId, req.body.starDateTime, function(err,messageArray){
            if(err){
                return res.json(400,err);
            }
            var result = {};
            result['audioArray'] = audioArray;
            result['messageArray'] = messageArray;
            return res.json(200,result);
        });
    });
};