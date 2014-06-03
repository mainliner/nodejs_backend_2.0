
/*
 * deal items info.
 */
var Item = require('../models/item.js');
var User = require('../models/user.js');

exports.getAllItems = function(req, res){
    Item.getAll(function(err,items){
        if(!items){
            return res.json(400,{'err':'no item info'});
        }
        if(err){
            return res.json(400,err);
        }
        res.json(200,items);
    });
};
