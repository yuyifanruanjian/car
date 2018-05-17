'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('UserController');
logger.setLevel('DEBUG');
var user = require('../model/user');


var register = async function (req) {
    try {
        var para_json = {
            name:req.body.username,
            passwd:req.body.passwd,
            phone:req.body.phone,
            url:""

        };
        var user_id = await user.register(para_json);

        var response = {
            success: true,
            status: '200',
            message: '注册成功',
            payload: {id: user_id}
        };
        return response;
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.name, error.toString());
        return 'failed '+error.toString();
    }
};

exports.register = register;