'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('ArbitrationController');
logger.setLevel('DEBUG');
var arbitration = require('../model/arbitration');

var arbitratedQuestion = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            ttime:req.body.ttime
        };
        await arbitration.arbitratedQuestion(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var arbitratedList = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id
        };
        await arbitration.arbitratedList(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var submitArbitration = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            questionId:req.body.questionId,
            starttime:req.body.starttime,
            endtime:req.body.endtime
        };
        await arbitration.submitArbitration(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var arbitrationInfo = async function (req, res) {
    try {
        var para_json = {
            arbitrationId:req.body.arbitrationId
        };
        await arbitration.arbitrationInfo(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var vote = async function (req, res) {
    try {
        var para_json = {
            arbitrationId:req.body.arbitrationId,
            answerId:req.body.answerId,
            userId:req.body.userId
        };
        await arbitration.vote(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};


var checkArbitration = async function (req, res) {
    try {
        var para_json = {
            ttime:req.body.ttime
        };
        await arbitration.checkArbitration(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

exports.arbitratedQuestion = arbitratedQuestion;
exports.arbitratedList = arbitratedList;
exports.submitArbitration = submitArbitration;
exports.arbitrationInfo = arbitrationInfo;
exports.vote = vote;
exports.checkArbitration = checkArbitration;