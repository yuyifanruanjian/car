'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('UserController');
logger.setLevel('DEBUG');
var user = require('../model/user');
var car = require('../model/car');


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

var carRegister = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            carList: JSON.parse(req.body.carIdList),
        };
        await car.register(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var login = async function (req, res, token) {
    try {
        var para_json = {
            phone:req.body.phone,
            passwd: req.body.password
        };
        await user.login(res, token, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.phone, error.toString());
        return 'failed '+error.toString();
    }
};

var userInfo = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.userInfo(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var minePhoto = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.minePhoto(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var myCarPhoto = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.myCarPhoto(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var mineQuestion = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.mineQuestion(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var answerQuestion = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.answerQuestion(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var mineBook = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.mineBook(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var mineArbitration = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.mineArbitration(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var votedArbitration = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.votedArbitration(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var userName = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.userName(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var userMessage = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
        };
        await user.userMessage(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var carMessage = async function (req, res) {
    try {
        var para_json = {
            id:req.body.carId,
        };
        await car.carMessage(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

exports.register = register;
exports.carRegister = carRegister;
exports.login = login;
exports.userInfo = userInfo;
exports.minePhoto = minePhoto;
exports.myCarPhoto = myCarPhoto;
exports.mineQuestion = mineQuestion;
exports.answerQuestion = answerQuestion;
exports.mineBook = mineBook;
exports.mineArbitration = mineArbitration;
exports.votedArbitration = votedArbitration;
exports.userName = userName;
exports.userMessage = userMessage;
exports.carMessage = carMessage;