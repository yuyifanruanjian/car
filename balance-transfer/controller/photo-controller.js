'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('PhotoController');
logger.setLevel('DEBUG');
var photo = require('../model/photo');



var submitPhoto = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            photoUrl:req.body.photoUrl,
            carId:req.body.carId,
            goodOrBad:req.body.goodOrBad,
            score:req.body.score,
            content:req.body.content,
            ttime:req.body.ttime,
        };
        await photo.submitPhoto(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var receivePunOrAward = async function (req, res) {
    try {
        var para_json = {
            carId:req.body.carId,
            goodOrBad:req.body.goodOrBad,
            score:req.body.score
        };
        await photo.receivePunOrAward(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var photoList = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id
        };
        await photo.photoList(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

exports.submitPhoto = submitPhoto;
exports.receivePunOrAward = receivePunOrAward;
exports.photoList = photoList;