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
        assert(form instanceof formidable.IncomingForm);
        form.parse(req, function (err, fields, files) {
            mongodbPool.release();
            if(err){
                return res.json(400,err);
            }  
            console.log(files.starVoiceMessage.id);
            console.log(fields); 
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
    if(req.body.starId === undefined){
        return res.json(400,{'err':'wrong request format'});
    }
    Audio.getLastAudioByStarId(req.body.starId,function(err,doc){
        if(err){
            return res.json(400,err);
        }
        return res.json(200,doc);
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

exports.getUnreadAudio = function(req, res) {
    
};