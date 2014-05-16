/*author: SONG Yang

/*Deal with the audio file upload from ios star client
*/
var assert = require('assert');
var formidable = require('gridform/node_modules/formidable');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodbPool = require('../models/db.js');
var Grid = require('mongodb').Grid;

var Audio = require('../models/audio.js');
var wedate = require('../app.js');
var fs = require('fs');
var uploadErrorLogfile = fs.createWriteStream('uploadError.log',{flags:'a'});

exports.uploadErrorLogfile = uploadErrorLogfile;

exports.upload = function (req,res) {
    mongodbPool.acquire(function(err,db){
        if(err){
            return res.josn(400,{'err':'acquire db failed'});
        }
        var gridform = require('gridform');
        gridform.db = db;
        gridform.mongo = mongo;
        var form = gridform();
        form.parse(req, function (err, fields, files) {
            if(err){
                mongodbPool.release(db);
                return res.json(400,err);
            }  
            if(files.starVoiceMessage === undefined || fields.star_id === undefined){
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
                return res.json(400,{'err':'wrong format'});
            } 
            var audio = new Audio({
                audioFileId: files.starVoiceMessage.id,
                starId: fields.star_id,
                uploadDate: new Date()
            });
            audio.save(function(err,doc){
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
                var encoded_payload = JSON.stringify({'starId':fields.star_id,'message':'一条未接来电','noticeType':'audio','badge':1});
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

exports.getLastAudio = function(req, res) {
    if(req.body.starArray === undefined || req.body.audioLoadTime === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Audio.getLastAudioByStarId(req.body.starArray,req.body.audioLoadTime,function(err,docs){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,docs);
    });
};
exports.getAllAudio = function(req, res) {
    if(req.body.starId === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Audio.getAudioByStarId(req.body.starId, function(err,docs){
        if(err){
            return res.json(400, err);
        }
        return res.json(200,docs);
    });
};

