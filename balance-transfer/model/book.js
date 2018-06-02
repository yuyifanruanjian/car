'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Book');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");


var submitBook = async function (res, book) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '提交失败'
        };
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'id',
                    table:'book',
                    conditions:{
                        bookUrl:[book.bookUrl]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results.length > 0) {
                    response.message = '教程已经存在'
                    callback(null);
                } else {
                    var insert = {
                        table:'book',
                        conditions:{
                            userId:[book.id],
                            bookUrl:[book.bookUrl],
                            score:[book.score],
                            name:[book.name],
                            ttime:[book.ttime],
                            active:[1]
                        }
                    };
                    let sql = await db.sqlInsert(insert);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        response.success = true;
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.success == false) {
                    callback(null);
                } else {
                    var queryq = {
                        wants:'id',
                        table:'book',
                        conditions:{
                            userId:[book.id],
                            bookUrl:[book.bookUrl],
                            score:[book.score],
                            name:[book.name],
                            ttime:[book.ttime],
                            active:[1]
                        }
                    };
                    let sql = await db.sqlSelect(queryq);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                        callback(err, results2);
                    });
                }
            }
        ], async function (err, results2) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '提交成功',
                        status: '200',
                        payload: results2[0]
                    };
                    logger.debug('submit book seuccess');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

var bookList = async function (res, book) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var sql = {};
        sql.sql = 'select distinct book.id, user.name as uname, book.name as bname, bookUrl, ttime, book.score, active from book join user on (user.id=book.userId) where active=1 and userId not in (';
        sql.sqlData = []
        for (var i in book.id){
            sql.sql+='?,';
            sql.sqlData.push(book.id[i]);
        }
        sql.sql=sql.sql.substring(0,sql.sql.length-1)+')';
        db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
            if(err) {
                logger.error(err);
            } else {
                response = {
                    success: true,
                    message: '获取成功',
                    status: '200',
                    payload: results
                };
                logger.debug(results);
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var buyBook = async function (res, book) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '购买失败'
        };
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'userId, score',
                    table:'book',
                    conditions:{
                        id:[book.bookId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                var queryq = {
                    wants:'score',
                    table:'user',
                    conditions:{
                        id:[book.id]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                    callback(err, results, results1);
                });
            },
            async function (results, results1, callback) {
                console.log(results[0]);
                console.log(results1[0]);
                if (results1[0].score >= results[0].score) {
                    async.eachSeries([{sql:'update user set score=score+? where id=?', sqlData:[results[0].score, results[0].userId]},
                        {sql:'update user set score=score-? where id=?', sqlData:[results[0].score, book.id]}],
                        async function (item, cb) {
                            console.log(item);
                            db.connection.query(item.sql, item.sqlData, async function(err, results2) {
                                response.success = true;
                                cb(err);
                            });
                        },
                        async function (err) {
                            callback(err);
                        });
                } else {
                    response.message = '用户积分不足';
                    callback(null);
                }
            }
        ], async function (err) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '购买成功',
                        status: '200',
                    };
                    logger.debug('buy book seuccess');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

exports.submitBook = submitBook;
exports.bookList = bookList;
exports.buyBook = buyBook;