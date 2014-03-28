/*author: SONG Yang

/*Deal with the audio file upload from ios star client
*/
var assert = require('assert');
var formidable = require('gridform/node_modules/formidable');
var gridfsStream = require('gridform/node_modules/gridfs-stream');
var mongo = require('mongodb');
var mongodb = require('../models/db.js');

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
            //var file = files.inpFile1;
            console.log(files);
            console.log(fields);
            mongodb.close();
            res.json(200,{'info':'upload success'});
        });
    });
};