/*
 * deal users info.
 */
var Star = require('../models/star.js');

exports.getAllStar = function(req,res){
    Star.getAll(function(err,stars){
        if(err){
            res.json(400,{'err':'get stars error'});
        }
        res.json(200,stars);
    });
};

