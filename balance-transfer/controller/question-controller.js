'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('QuestionController');
logger.setLevel('DEBUG');
var question = require('../model/question');


var submitQuestion = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            content:req.body.content,
            score:req.body.score,
            starttime:req.body.starttime,
            endtime:req.body.endtime
        };
        await question.submitQuestion(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var questionList = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id
        };
        await question.questionList(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var questionInfo = async function (req, res) {
    try {
        var para_json = {
            questionId:req.body.questionId,
            ttime:req.body.ttime
        };
        await question.questionInfo(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var answerList = async function (req, res) {
    try {
        var para_json = {
            questionId:req.body.questionId
        };
        await question.answerList(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var answer = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            questionId:req.body.questionId,
            rid:req.body.rid,
            pid:req.body.pid,
            content:req.body.content,
            ttime:req.body.ttime
        };
        await question.answer(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var bestAnswer = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            questionId:req.body.questionId,
            answerId:req.body.answerId,
            charId:req.body.charId
        };
        await question.bestAnswer(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

exports.submitQuestion = submitQuestion;
exports.questionList = questionList;
exports.questionInfo = questionInfo;
exports.answerList = answerList;
exports.answer = answer;
exports.bestAnswer = bestAnswer;