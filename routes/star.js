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

exports.putStar = function(req,res){
    var star = req.body;
    var newStar = new Star({
        ChineseName: star.ChineseName,
        EnglishName: star.EnglishName,
        nickName: star.nickName,
        birthday: new Date(star.birthday),
        birthplace: star.birthplace,
        blood: star.blood,
        constellation: star.constellation,
        stature: star.stature,
        voice: star.voice,
        description: star.description,
        headPortrait: star.headPortrait,
        portraitBig: star.portraitBig,
        portraitSmall: star.portraitSmall
    });
    Star.get(star,function(err,doc){
        if(doc){
            err = {'err':'star has existed'};
        }
        if(err){
            return res.json(400,err);
        }
        newStar.save(function(err,doc){
            if(err){
                return res.json(400,err);
            }
            res.json(200,doc);
        });
    });
};