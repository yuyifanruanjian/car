'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('UserController');
logger.setLevel('DEBUG');
var user = require('../model/user');


var register = async function (req, res, token) {
    try {
        var para_json = {
            name:req.body.username,
            passwd:req.body.password,
            phone:req.body.phone,
            url:"",
            score: 0
        };
        await user.register(res, token, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.name, error.toString());
        return 'failed '+error.toString();
    }
};

exports.register = register;