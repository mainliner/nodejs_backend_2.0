/*author: SONG Yang

/*Deal with the audio file upload from ios star client
*/
var assert = require('assert');
var formidable = require('gridform/node_modules/formidable');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodbPool = require('../models/db.js');

var Audio = require('../models/audio.js');

exports.upload = function (req,res) {
    mongodbPool.acquire(function(err,db){
        if(err){
            return res.josn(400,{'err':'acquire db failed'});
        }
        var gridform = require('gridform');
        gridform.db = db;
        gridform.mongo = mongo;
        var form = gridform();
        //assert(form instanceof formidable.IncomingForm);
        form.parse(req, function (err, fields, files) {
            mongodbPool.release(db);
            if(err){
                return res.json(400,err);
            }  
            if(files.starVoiceMessage === undefined || fields.star_id === undefined){
                //need to delete the file which has already save in the gridfs
                return res.json(400,{'err':'wrong fromat'});
            } 
            var audio = new Audio({
                audioFileId: files.starVoiceMessage.id,
                starId: fields.star_id,
                uploadDate: new Date()
            });
            audio.save(function(err,doc){
                if(err){
                    //need to delete the audio file which not associate with the right star in GridFS 
                    return res.json(400,err);
                }
                return res.json(200,{'info':'upload success'});
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

