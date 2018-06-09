'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('User');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");
var invoke = require('./../app/invoke-transaction');


var register = async function (res, token, user) {
    var insert = {
        table:'user',
        conditions:{
            name:[user.name],
            passwd:[user.passwd],
            phone:[user.phone],
            url:[user.url],
            score:[user.score]
        }
    };
    try {
        var response = {
            success: false,
            status: '999',
            message: '手机号已经注册'
        };
        let sql = await db.sqlInsert(insert);
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'id',
                    table:'user',
                    conditions:{
                        phone:[user.phone]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results.length > 0) {
                    callback(null);
                } else {
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
                }
                var queryq = {
                    wants:'id',
                    table:'user',
                    conditions:{
                        phone:[user.phone],
                        passwd: [user.passwd]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                    callback(err, results2);
                });
            }
        ], async function (err, results2) {
            if(err) {
                logger.error(err);
                response.message = '注册失败';
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '注册成功',
                        token: token,
                        status: '200',
                        payload: results2[0]
                    };
                    logger.debug(results2[0]);
                    invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "CreateUserScore", [results2[0].id.toString()], "Jim", "Org1");
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        response = {
            success: false,
            status: '999',
            message: '注册失败'
        };
        res.json(response);
    }
};

var login = async function (res, token, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '登录失败'
        };
        var queryq = {
            wants:'id',
            table:'user',
            conditions:{
                phone:[user.phone],
                passwd: [user.passwd]
            }
        };
        let sql = await db.sqlSelect(queryq);
        db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
            if(err) {
                logger.error(err);
            } else {
                response = {
                    success: true,
                    message: '登录成功',
                    token: token,
                    status: '200',
                    payload: results[0]
                };
                logger.debug(results[0]);
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var userInfo = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var counts = {};
        var sqls = {};
        var queryq = {
            wants:'name, score, url',
            table:'user',
            conditions:{
                id:[user.id]
            }
        };
        sqls[1] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'count(*)',
            table:'photo',
            conditions:{
                userId:[user.id]
            }
        };
        sqls[2] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'count(*)',
            table:'question',
            conditions:{
                userId:[user.id]
            }
        };
        sqls[3] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'count(*)',
            table:'book',
            conditions:{
                userId:[user.id]
            }
        };
        sqls[4] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'count(*)',
            table:'arbitration',
            conditions:{
                userId:[user.id]
            }
        };
        sqls[5] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'photoUrl',
            table:'photo',
            conditions:{
                userId:[user.id]
            },
            page:{
                limit:1,
                offset:0
            },
            order:'ttime desc'
        };
        sqls[6] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'content, score',
            table:'question',
            conditions:{
                userId:[user.id]
            },
            page:{
                limit:1,
                offset:0
            },
            order:'starttime desc'
        };
        sqls[7] = await db.sqlSelect(queryq);
        var queryq = {
            wants:'book.name as bname, user.name as uname, ttime, book.score',
            table:'book join user on (user.id=book.userId)',
            conditions:{
                userId:[user.id]
            },
            page:{
                limit:1,
                offset:0
            },
            order:'ttime desc'
        };
        sqls[8] = await db.sqlSelect(queryq);
        async.forEachOf(sqls, async function (value, key, cb) {
            db.connection.query(value.sql, value.sqlData, async function(err, results) {
                if (err) {
                    cb(err);
                } else {
                    counts[key] = results;
                    cb();
                }
            });
        }, async function (err) {
            if(err) {
                logger.error(err);
            } else {
                console.log(counts);
                response = {
                    success: true,
                    message: '获取成功',
                    status: '200',
                    payload: {
                        username: counts[1][0].name,
                        score: counts[1][0].score,
                        url: counts[1][0].url,
                        photonum: counts[2][0]['count(*)'],
                        questionnum: counts[3][0]['count(*)'],
                        booknum: counts[4][0]['count(*)'],
                        arbitrationnum: counts[5][0]['count(*)'],
                        photo: counts[6],
                        question: counts[7],
                        book:counts[8]
                    }
                };
                logger.debug('select success');
            }
            res.json(response);
        })

    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.id, error.toString());
        res.json(response);
    }
};

var minePhoto = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'name, photoUrl, carId, score',
            table:'photo',
            conditions:{
                userId:[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var myCarPhoto = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'photo.name, photoUrl, photo.carId, photo.score',
            table:'photo join car using (carId) join user on (user.id=car.userId)',
            conditions:{
                'user.id':[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var mineQuestion = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'question.id, name, content, starttime, endtime, question.score, active',
            table:'question join user on (user.id=question.userId)',
            conditions:{
                userId:[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var answerQuestion = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'distinct question.id, question.content, question.starttime, question.endtime, question.score, question.active, user.name',
            table:'question join answer on (answer.questionId=question.id) join user on (user.id=answer.userId)',
            conditions:{
                'user.id':[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var mineBook = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'distinct book.id, user.name as uname, book.name as bname, bookUrl, ttime, book.score, active',
            table:'book join user on (user.id=book.userId)',
            conditions:{
                userId:[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var mineArbitration = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'distinct arbitration.id, user.name, question.content, question.score, arbitration.starttime, arbitration.endtime, arbitration.active',
            table:'arbitration join user on (user.id=arbitration.userId) join question on (arbitration.questionId=question.id)',
            conditions:{
                'arbitration.userId':[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var votedArbitration = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'distinct arbitration.id, user.name, question.content, question.score, arbitration.starttime, arbitration.endtime, arbitration.active',
            table:'arbitration join user on (user.id=arbitration.userId) join question on (arbitration.questionId=question.id) join vote on (arbitration.id=vote.arbitrationId)',
            conditions:{
                'vote.userId':[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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

var userName = async function (res, user) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'name, url',
            table:'user',
            conditions:{
                id:[user.id]
            }
        };
        let sql = await db.sqlSelect(queryq);
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
        logger.error('Failed to insert user: %s with error: %s', user.id, error.toString());
        res.json(response);
    }
};

var userMessage = async function (res, user) {
    try {
        var results = invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "GetUserScoreInfo", [user.id.toString()], "Jim", "Org1");
        var response = {
            success: true,
            message: '获取成功',
            status: '200',
            payload: results
        };
        res.json(response);
    } catch(error) {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        logger.error('Failed to insert user: %s with error: %s', user.id, error.toString());
        res.json(response);
    }
};

exports.register = register;
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