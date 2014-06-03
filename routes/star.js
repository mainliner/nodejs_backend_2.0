/*
 * deal users info.
 */
var assert = require('assert');
var Star = require('../models/star.js');
var Message = require('../models/message.js');
var formidable = require('gridform/node_modules/formidable');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodbPool = require('../models/db.js');
var wedate = require('../app.js');

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

};

exports.starLogout = function(req, res){

};

exports.starChangePassword = function(req, res){

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
exports.getAllMessage = function(req, res){

};