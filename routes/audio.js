/*author: SONG Yang

/*Deal with the audio file upload from ios star client
*/
var assert = require('assert');
var formidable = require('gridform/node_modules/formidable');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodb = require('../models/db.js');

var Audio = require('../models/audio.js');

exports.upload = function (req,res) {
    mongodb.open(function(err,db){
        if(err){
            return res.josn(400,{'err':'open db failed'});
        }
        var gridform = require('gridform');
        gridform.db = db;
        gridform.mongo = mongo;
        var form = gridform();
        assert(form instanceof formidable.IncomingForm);
        form.parse(req, function (err, fields, files) {
            mongodb.close();
            if(err){
                return res.json(400,err);
            }  
            console.log(files);
            console.log(fields); 
            var audio = new Audio({
                fileId: ,
                startId: ,
                uploadDate: 
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

exports.getAllAudio = function(req, res) {

};

exports.getUnreadAudio = function(req, res) {

};