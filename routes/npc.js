/*
 * deal npc info.
 */

var NPC = require('../models/npc.js');

exports.getAllNPC = function (req, res) {
    NPC.getAll(function(err,docs){
        if(err){
            return res.json(400,err)
        }
        if(!docs){
            return res.json(400,{'err':'no npc info'});
        }
        return res.json(200,docs);
    });
}