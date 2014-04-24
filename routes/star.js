/*
 * deal users info.
 */
var Star = require('../models/star.js');

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

};