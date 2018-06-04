'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Arbitration');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");

var arbitratedQuestion = async function (res, arbitration) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        async.waterfall([
            async function (callback) {
                var sql = {};
                sql.sql = 'update question set active=2 where endtime<? and active=1 and userId=?';
                sql.sqlData = [arbitration.ttime, arbitration.id];
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err);
                });
            },
            async function (callback) {
                var queryq = {
                    wants:'distinct question.id',
                    table:'question join answer on (answer.questionId=question.id) join user on (user.id=answer.userId)',
                    conditions:{
                        'user.id':[arbitration.id]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results0) {
                    callback(err, results0);
                });
            },
            async function (results0, callback) {
                var sql = {};
                sql.sql = 'update question set active=2 where endtime<? and active=1 and id in (';
                sql.sqlData = [arbitration.ttime];
                for (var i=0; i<results0.length; i++) {
                    sql.sql+='?,';
                    sql.sqlData.push(results0[i].id);
                }
                sql.sql=sql.sql.substring(0, sql.sql.length-1)+')';
                console.log(sql);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err);
                });
            },
            async function (callback) {
                var queryq = {
                    wants:'question.id, name, content, starttime, endtime, question.score, active',
                    table:'question join user on (user.id=question.userId)',
                    conditions:{
                        userId:[arbitration.id],
                        'question.active':[2]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                    callback(err, results1);
                });
            },
            async function (results1, callback) {
                var queryq = {
                    wants:'distinct question.id, question.content, question.starttime, question.endtime, question.score, question.active, user.name',
                    table:'question join answer on (answer.questionId=question.id) join user on (user.id=answer.userId)',
                    conditions:{
                        'user.id':[arbitration.id],
                        'question.active':[2]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                    response.success = true;
                    callback(err, results1, results2);
                });
            },
        ], async function (err, results1, results2) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '获取成功',
                        status: '200',
                        payload: results1.concat(results2)
                    };
                    logger.debug('success');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var arbitratedList = async function (res, arbitration) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'distinct question.id, question.content, question.starttime, question.endtime, question.score, question.active, user.name',
            table:'question join arbitration on (arbitration.questionId=question.id) join user on (user.id=question.userId)',
            conditions:{
                'question.active':[2]
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
                logger.debug('success');
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var submitArbitration = async function (res, arbitration) {
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
                    table:'arbitration',
                    conditions:{
                        questionId:[arbitration.questionId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results0) {
                    callback(err, results0);
                });
            },
            async function (results0, callback) {
                if (results0.length>0) {
                    response = {
                        success: true,
                        message: '存在仲裁',
                        status: '200',
                        payload: results0[0].id
                    };
                    callback();
                } else {
                    var insert = {
                        table: 'arbitration',
                        conditions: {
                            userId: [arbitration.id],
                            starttime: [arbitration.starttime],
                            endtime: [arbitration.endtime],
                            questionId: [arbitration.questionId],
                            active: [1]
                        }
                    };
                    let sql = await db.sqlInsert(insert);
                    db.connection.query(sql.sql, sql.sqlData, async function (err, results) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.success==true) {
                    callback(null);
                }
                var queryq = {
                    wants:'id',
                    table:'arbitration',
                    conditions:{
                        userId:[arbitration.id],
                        starttime:[arbitration.starttime],
                        endtime:[arbitration.endtime],
                        questionId:[arbitration.questionId],
                        active:[1]
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
                if (response.success == true && response.message!='存在仲裁') {
                    response = {
                        success: true,
                        message: '提交成功',
                        status: '200',
                        payload: results1[0].id
                    };
                    logger.debug('success');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var arbitrationInfo = async function (res, arbitration) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'question.content, question.score, question.userId, question.id, arbitration.active',
                    table:'question join arbitration on (arbitration.questionId=question.id)',
                    conditions:{
                        'arbitration.id':[arbitration.arbitrationId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results0) {
                    callback(err, results0);
                });
            },
            async function (results0, callback) {
                var queryq = {
                    wants:'userId, answerId',
                    table:'vote',
                    conditions:{
                        'vote.arbitrationId':[arbitration.arbitrationId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results0, results);
                });
            },
            async function (results0, results, callback) {
                var queryq = {
                    wants:'answer.content, user.name, answer.userId, answer.id',
                    table:'answer join question on (question.id=answer.questionId) join user on (answer.userId=user.id)',
                    conditions:{
                        'question.id':[results0[0].id]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                    response.success = true;
                    callback(err, results0, results, results1);
                });
            },
        ], async function (err, results0, results, results1) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    var result = {};
                    for (var i=0; i<results.length; i++) {
                        if (result.hasOwnProperty(results[i].answerId)) {
                            result[results[i].answerId].vids.push(results[i].userId);
                        } else {
                            result[results[i].answerId] = {
                                vids:[results[i].userId]
                            };
                        }
                    }
                    response = {
                        success: true,
                        message: '获取成功',
                        status: '200',
                        payload: {
                            question: results0[0],
                            vote: JSON.stringify(result),
                            answer:JSON.stringify(results1)
                        }
                    };
                    logger.debug('success');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var vote = async function (res, arbitration) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '投票失败'
        };
        var insert = {
            table: 'vote',
            conditions: {
                arbitrationId:arbitration.arbitrationId,
                answerId:arbitration.answerId,
                userId:arbitration.userId
            }
        };
        let sql = await db.sqlInsert(insert);
        db.connection.query(sql.sql, sql.sqlData, async function (err, results) {
            if(err) {
                logger.error(err);
            } else {
                response = {
                    success: true,
                    message: '投票成功',
                    status: '200'
                };
                logger.debug('vote success');
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

var checkArbitration = async function (res, arbitration) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '检测失败'
        };
        async.waterfall([
            async function (callback) {
                var sql = {};
                sql.sql = 'select score, arbitration.id, arbitration.questionId from arbitration join question on (question.id=arbitration.questionId) where arbitration.active=1 and arbitration.endtime<?';
                sql.sqlData = [arbitration.ttime];
                db.connection.query(sql.sql, sql.sqlData, async function(err, results0) {
                    callback(err, results0);
                });
            },
            async function (results0, callback) {
                var results = {};
                if (results0.length==0) {
                    res.json(response);
                } else {
                    async.eachSeries(results0, async function (item, cb) {
                        var sql = {};
                        sql.sql = 'select answerId, userId from vote where arbitrationId=?';
                        sql.sqlData = [item.id];
                        db.connection.query(sql.sql, sql.sqlData, async function (err, results1) {
                            if (err) {
                                cb(err);
                            } else {
                                var a = {};
                                for (var i=0; i<results1.length; i++) {
                                    if(a.hasOwnProperty(results1[i].answerId)) {
                                        a[results1[i].answerId]++;
                                    } else {
                                        a[results1[i].answerId]=1;
                                    }
                                }
                                results[item.questionId] = {
                                    results: a,
                                    score: item.score
                                };
                                cb();
                            }
                        });
                    },
                    async function (err) {
                        var results1 = {};
                        async.forEachOf(results, async function (value, key, cb) {
                                var maxA = 0;
                                var maxV = -1;
                                for (var i in value.results) {
                                    if (value.results[i] > maxV) {
                                        maxA = i;
                                        maxV = value.results[i];
                                    }
                                }
                                if (maxV == -1 || maxV == 0) {
                                    results1[key] = {
                                        answerId: key,
                                        count: -1,
                                        score: value.score / 2
                                    }
                                } else {
                                    results1[key] = {
                                        answerId: maxA,
                                        count: maxV,
                                        score: value.score
                                    }
                                }
                                var sql = {};
                                sql.sql = 'update question set active=0 where id=?';
                                sql.sqlData = [key];
                                db.connection.query(sql.sql, sql.sqlData, async function (err, results2) {
                                    cb();
                                });
                            },
                            async function (err) {
                                async.forEachOf(results1, async function (value, key, cb) {
                                        var sql = {};
                                        if (value.count == -1) {
                                            sql.sql = 'select userId from question where id=?';
                                            sql.sqlData = [key];
                                        } else {
                                            sql.sql = 'select userId from answer where id=?';
                                            sql.sqlData = [value.answerId];
                                        }
                                        db.connection.query(sql.sql, sql.sqlData, async function (err, results3) {
                                            results1[key].userId = results3[0].userId;
                                            cb();
                                        });
                                    },
                                    async function (err) {
                                        async.forEachOf(results1, async function (value, key, cb) {
                                                var sql = {};
                                                sql.sql = 'update user set score=score+? where id=?';
                                                sql.sqlData = [value.score, value.userId];
                                                db.connection.query(sql.sql, sql.sqlData, async function (err, results4) {
                                                    cb(err);
                                                });
                                            },
                                            async function (err) {
                                                async.forEachOf(results1, async function (value, key, cb) {
                                                        var sql = {};
                                                        if (value.count!=-1) {
                                                            sql.sql = 'update answer set active=1 where id=?';
                                                            sql.sqlData = [value.answerId];
                                                            db.connection.query(sql.sql, sql.sqlData, async function(err, results5) {
                                                                cb();
                                                            });
                                                        } else {
                                                            cb(err);
                                                        }
                                                    },
                                                    async function (err) {
                                                        var sql = {};
                                                        sql.sql = 'update arbitration set active=0 where active=1 and endtime<?';
                                                        sql.sqlData = [arbitration.ttime];
                                                        db.connection.query(sql.sql, sql.sqlData, async function(err, results0) {
                                                            response.message='检测成功';
                                                            response.status='200';
                                                            response.success=true;
                                                            res.json(response);
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
                }
            },
        ], async function (err) {
            if(err) {
                logger.error(err);
            } else {
                logger.debug('success');
            }
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.phone, error.toString());
        res.json(response);
    }
};

exports.arbitratedQuestion = arbitratedQuestion;
exports.arbitratedList = arbitratedList;
exports.submitArbitration = submitArbitration;
exports.arbitrationInfo = arbitrationInfo;
exports.vote = vote;
exports.checkArbitration = checkArbitration;