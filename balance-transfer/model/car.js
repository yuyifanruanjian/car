'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Car');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");
var invoke = require('./../app/invoke-transaction');

var register = async function (res, car) {
    try {
        var i = 0;
        var response = {
            success: false,
            status: '999',
            message: '注册失败'
        };
        async.eachSeries(car.carList,
            async function (item, cb) {
                async.waterfall([
                    async function (callback) {
                        var queryq = {
                            wants:'carId',
                            table:'car',
                            conditions:{
                                carId:[item.id]
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
                            var insert = {
                                table:'car',
                                conditions:{
                                    carId:[item.id],
                                    score:[item.score],
                                    userId: [car.id]
                                }
                            };
                            let sql = await db.sqlInsert(insert);
                            await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "CreateCarScore", [item.id], "Jim", "Org1");
                            db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                                callback(err);
                            });
                        }
                    }
                    ], async function (err) {
                    cb(err);
                });
            },
            async function (err) {
                if(err) {
                    logger.error(err);
                    res.json(response);
                } else {
                    response = {
                        success: true,
                        status: '200',
                        message: '注册成功'
                    };
                    logger.debug('car register success');
                    res.json(response);
                }
            }
        );
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

var carBinding = async function (res, car) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '绑定失败'
        };
        async.waterfall([
            async function (callback) {
                var queryq = {
                    wants:'userId, score',
                    table:'car',
                    conditions:{
                        carId:[car.carId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results[0].userId != 0) {
                    response.message = '车辆已经绑定';
                    callback(null);
                } else {
                    var sql = {};
                    car.score = results[0].score;
                    if (results[0].score >= 0) {
                        sql.sql = 'update user set score=score+? where id=?';
                        sql.sqlData = [results[0].score, car.id];
                    } else {
                        sql.sql = 'update user set score=score-? where id=?';
                        sql.sqlData = [results[0].score*(-1), car.id];
                    }
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message == '车辆已经绑定') {
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update car set userId=? where carId=?';
                    sql.sqlData = [car.id, car.carId];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        response.success = true;
                        callback(err);
                    });
                }
            }
        ], async function (err) {
            if(err) {
                logger.error(err);
            } else {
                if (response.success == true) {
                    response = {
                        success: true,
                        message: '绑定成功',
                        status: '200'
                    };
                    logger.debug('submit photo seuccess');
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
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [car.id.toString(), car.score.toString(), "8", car.carId+'+'+stime], "Jim", "Org1");
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

var carMessage = async function (res, car) {
    try {
        let results = await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "GetCarScoreInfo", [car.id.toString()], "Jim", "Org1");
        logger.info(results);
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
        logger.error('Failed to insert user: %s with error: %s', car.id, error.toString());
        res.json(response);
    }
};

exports.register = register;
exports.carBinding = carBinding;
exports.carMessage = carMessage;

