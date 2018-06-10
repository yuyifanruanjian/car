'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('BookController');
logger.setLevel('DEBUG');
var book = require('../model/book');


var submitBook = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            bookUrl:req.body.bookUrl,
            name:req.body.name,
            score:req.body.score,
            ttime:req.body.ttime,
        };
        await book.submitBook(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var bookList = async function (req, res) {
    try {
        var para_json = {
            id: req.body.id,
            idList:JSON.parse(req.body.idList)
        };
        await book.bookList(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

var buyBook = async function (req, res) {
    try {
        var para_json = {
            id:req.body.id,
            bookId:req.body.bookId
        };
        await book.buyBook(res, para_json);
    } catch(error) {
        logger.error('Failed to get registered user: %s with error: %s', this.body.id, error.toString());
        return 'failed '+error.toString();
    }
};

exports.submitBook = submitBook;
exports.bookList = bookList;
exports.buyBook = buyBook;