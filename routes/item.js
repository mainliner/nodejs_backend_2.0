
/*
 * deal items info.
 */
var Item = require('../models/item.js');
var User = require('../models/user.js');

exports.getAllItems = function(req, res){
    Item.getAll(function(err,items){
        if(!items){
            return res.json(400,err);
        }
        if(err){
            return res.json(400,err);
        }
        res.json(200,items);
    });
};
/*
exports.putItem = function(req, res){
    user = req.session.user;
    if(user.admin){
        var newItem = new Item({
        name: req.body.name,
        price: req.body.price,
        describe: req.body.describe,
        });
        newItem.save(function(err, item){
            if(err){
                return res.json(400,err);
            }
            res.json(200,item);
        });
    }
    else{
        res.json(400,{'info':'you do not have the premision'})
    }
};*/