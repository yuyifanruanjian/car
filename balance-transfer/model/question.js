'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Question');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");
var invoke = require('./../app/invoke-transaction');

var submitQuestion = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '提交失败'
        };
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'score',
                    table:'user',
                    conditions:{
                        id:[question.id]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results[0].score < question.score) {
                    response.message = '分值不足';
                    callback(null);
                } else {
                    var insert = {
                        table:'question',
                        conditions:{
                            userId:[question.id],
                            score:[question.score],
                            content:[question.content],
                            starttime:[question.starttime],
                            endtime:[question.endtime],
                            active:[1]
                        }
                    };
                    let sql = await db.sqlInsert(insert);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message == '分值不足') {
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update user set score=score-? where id=?';
                    sql.sqlData = [question.score, question.id];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message == '分值不足') {
                    callback(null);
                } else {
                    var queryq = {
                        wants:'id',
                        table:'question',
                        conditions:{
                            userId:[question.id],
                            score:[question.score],
                            content:[question.content],
                            starttime:[question.starttime],
                            endtime:[question.endtime],
                            active:[1]
                        }
                    };
                    let sql = await db.sqlSelect(queryq);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results3) {
                        response.success = true;
                        callback(err, results3);
                    });
                }
            }
        ], async function (err, results3) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '提交成功',
                        status: '200'
                    };
                    logger.debug('submit question seuccess');
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [question.id.toString(), '-'+question.score.toString(), "5", results3[0].id.toString()+'+'+question.content+'+'+question.starttime], "Jim", "Org1");
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

var questionList = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var sql = {};
        sql.sql = 'select question.id, name, content, starttime, endtime, question.score, active from question join user on (user.id=question.userId) where active=1 and userId not in (?)';
        sql.sqlData = [question.id];
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

var questionInfo = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        async.waterfall([
            // async function (callback) {
            //     var sql = {};
            //     sql.sql = 'update question set active=2 where id=? and endtime<=? and active=1';
            //     sql.sqlData = [question.questionId, question.ttime];
            //     db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
            //         callback(err);
            //     });
            // },
            async function (callback) {
                var queryq = {
                    wants:'question.content, question.score, question.starttime, question.endtime, question.active, user.name',
                    table:'question join user on (question.userId=user.id)',
                    conditions:{
                        'question.id':[question.questionId],

                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                    response.success = true;
                    callback(err, results1);
                });
            }
        ], async function (err, results1) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '获取成功',
                        status: '200',
                        payload: results1[0]
                    };
                    logger.debug('get question seuccess');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var answerList = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'answer.id, content, time, parentId, replyId, user.name, userId, active',
            table:'answer join user on (answer.userId=user.id)',
            conditions:{
                'questionId':[question.questionId],

            },
            order:'active desc, parentId asc, time asc'
        };
        let sql = await db.sqlSelect(queryq);
        db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
            if(err) {
                logger.error(err);
            } else {
                var json = {};
                if (results.length>=0) {
                    for (var i=0; i<results.length; i++) {
                        var row = results[i];
                        if (row.parentId == 0 && row.replyId == 0) {
                            json[row.id] = {
                                answerId: row.id,
                                content: row.content,
                                time: row.time,
                                active: row.active,
                                userId: row.userId,
                                name: row.name,
                                parentId: row.parentId,
                                replyId: row.replyId,
                                answers: {}
                            };
                        } else {
                            json[row.parentId].answers[row.id] = {
                                answerId: row.id,
                                content: row.content,
                                time: row.time,
                                active: row.active,
                                userId: row.userId,
                                name: row.name,
                                parentId: row.parentId,
                                replyId: row.replyId,
                            };
                        }
                    }
                    response = {
                        success: true,
                        message: '获取成功',
                        status: '200',
                        payload: JSON.stringify(json)
                    };
                    logger.debug('get question seuccess');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var answer = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '回复失败'
        };
        var insert = {
            table:'answer',
            conditions:{
                userId:[question.id],
                time:[question.ttime],
                content:[question.content],
                questionId:[question.questionId],
                parentId:[question.pid],
                replyId:[question.rid],
                active:[0]
            }
        };
        let sql = await db.sqlInsert(insert);
        db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
            if(err) {
                logger.error(err);
            } else {
                response = {
                    success: true,
                    message: '回复成功',
                    status: '200',
                };
                logger.debug('answer seuccess');
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var bestAnswer = async function (res, question) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '选取失败'
        };
        var ttime = new Date();
        var year = ttime.getFullYear();
        if (ttime.getMonth()+1 < 10) {
            var month = '0'+(ttime.getMonth()+1).toString();
        } else {
            var month = (ttime.getMonth()+1).toString();
        }
        if (ttime.getDate() < 10) {
            var day = '0'+ttime.getDate();
        } else {
            var day = ttime.getDate();
        }
        if (ttime.getHours() < 10) {
            var hour = '0'+ttime.getHours();
        } else {
            var hour = ttime.getHours();
        }
        if (ttime.getMinutes() < 10) {
            var minute = '0'+ttime.getMinutes();
        } else {
            var minute = ttime.getMinutes();
        }
        if (ttime.getSeconds() < 10) {
            var second = '0'+ttime.getSeconds();
        } else {
            var second = ttime.getSeconds();
        }
        var stime = ''+year+month+day+hour+minute+second;
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'user.id, question.score, question.content',
                    table:'question join user on (user.id=question.userId)',
                    conditions:{
                        'question.id':[question.questionId],
                        'user.id':[question.charId]

                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results.length==0) {
                    response.message = '用户不是问题提出者';
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update user set score=score+? where id=?';
                    sql.sqlData = [results[0].score, question.id];
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [question.id.toString(), results[0].score.toString(), "6", question.questionId.toString()+'+'+results[0].content+'+'+stime], "Jim", "Org1");
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results3) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message=='用户不是问题提出者') {
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update question set active=0 where id=?';
                    sql.sqlData = [question.questionId];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message=='用户不是问题提出者') {
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update answer set active=1 where id=?';
                    sql.sqlData = [question.answerId];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        response.success = true;
                        callback(err);
                    });
                }
            },
        ], async function (err, results1) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '选取成功',
                        status: '200',
                    };
                    logger.debug('select best answer success');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

exports.submitQuestion = submitQuestion;
exports.questionList = questionList;
exports.questionInfo = questionInfo;
exports.answerList = answerList;
exports.answer = answer;
exports.bestAnswer = bestAnswer;