'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Photo');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");
var invoke = require('./../app/invoke-transaction');

var submitPhoto = async function (res, photo) {
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
                    table:'photo',
                    conditions:{
                        photoUrl:[photo.photoUrl]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results.length > 0) {
                    response.message = '照片已经存在';
                    callback(null);
                } else {
                    if (photo.goodOrBad=='坏') {
                        var score = photo.score * (-1);
                    } else {
                        var score = photo.score;
                    }
                    var insert = {
                        table:'photo',
                        conditions:{
                            userId:[photo.id],
                            photoUrl:[photo.photoUrl],
                            carId:[photo.carId],
                            score:[score],
                            name:[photo.content],
                            ttime:[photo.ttime],
                        }
                    };
                    let sql = await db.sqlInsert(insert);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message == '照片已经存在') {
                    callback(null);
                } else {
                    var sql = {};
                    sql.sql = 'update user set score=score+? where id=?';
                    sql.sqlData = [photo.score, photo.id];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        callback(err);
                    });
                }
            },
            async function (callback) {
                if (response.message == '照片已经存在') {
                    callback(null);
                } else {
                    if (photo.goodOrBad=='坏') {
                        var score = photo.score * (-1);
                    } else {
                        var score = photo.score;
                    }
                    var queryq = {
                        wants:'id',
                        table:'photo',
                        conditions:{
                            userId:[photo.id],
                            photoUrl:[photo.photoUrl],
                            carId:[photo.carId],
                            score:[score],
                            name:[photo.content],
                            ttime:[photo.ttime],
                        }
                    };
                    let sql = await db.sqlSelect(queryq);
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                        response.success = true;
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
                    logger.debug('submit photo seuccess');
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [photo.id.toString(), photo.score.toString(), "1", results2[0].id.toString()+'+'+photo.photoUrl+'+'+photo.ttime], "Jim", "Org1");
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

var receivePunOrAward = async function (res, photo) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '修改失败'
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
                    wants:'userId',
                    table:'car',
                    conditions:{
                        carId:[photo.carId]
                    }
                };
                let sql = await db.sqlSelect(queryq);
                db.connection.query(sql.sql, sql.sqlData, async function(err, results) {
                    callback(err, results);
                });
            },
            async function (results, callback) {
                if (results.length > 0) {
                    var sql = {};
                    if (photo.goodOrBad=='坏') {
                        sql.sql = 'update car set score=score-? where carId=?';
                        await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyCarScore", [photo.carId, '-'+photo.score.toString(), "1", photo.id.toString()+'+'+photo.photoUrl+'+'+stime], "Jim", "Org1");
                    } else {
                        sql.sql = 'update car set score=score+? where carId=?';
                        await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyCarScore", [photo.carId, photo.score.toString(), "1", photo.id.toString()+'+'+photo.photoUrl+'+'+stime], "Jim", "Org1");
                    }
                    sql.sqlData = [photo.score, photo.carId];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        response.success = true;
                        callback(err, results, results1);
                    });
                } else {
                    if (photo.goodOrBad=='坏') {
                        var score = photo.score * (-1);
                    } else {
                        var score = photo.score;
                    }
                    var insert = {
                        table:'car',
                        conditions:{
                            userId:[0],
                            carId:[photo.carId],
                            score:[score]
                        }
                    };
                    let sql = await db.sqlInsert(insert);
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "CreateCarScore", [photo.carId], "Jim", "Org1");
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                        callback(err, results, results1);
                    });
                }
            },
            async function (results, results1, callback) {
                if (results.length > 0) {
                    var sql = {};
                    if (photo.goodOrBad=='坏') {
                        sql.sql = 'update user set score=score-? where id=?';
                        await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [results[0].userId.toString(), '-'+photo.score.toString(), "2", photo.id.toString()+'+'+photo.photoUrl+'+'+stime], "Jim", "Org1");
                    } else {
                        sql.sql = 'update user set score=score+? where id=?';
                        await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyUserScore", [results[0].userId.toString(), photo.score.toString(), "2", photo.id.toString()+'+'+photo.photoUrl+'+'+stime], "Jim", "Org1");
                    }
                    sql.sqlData = [photo.score, results[0].userId];
                    db.connection.query(sql.sql, sql.sqlData, async function(err, results2) {
                        response.success = true;
                        callback(err);
                    });
                } else {
                    await invoke.invokeChaincode(["peer0.org1.example.com","peer1.org1.example.com"], "mychannel", "mycc" , "ModifyCarScore", [photo.carId, photo.score.toString(), "1", photo.id.toString()+'+'+photo.photoUrl+'+'+stime], "Jim", "Org1");
                    response.success = true;
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
                        message: '修改成功',
                        status: '200',
                    };
                    logger.debug('receive pun or award seuccess');
                }
            }
            res.json(response);
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.json(response);
    }
};

var photoList = async function (res, photo) {
    try {
        var response = {
            success: false,
            status: '999',
            message: '获取失败'
        };
        var queryq = {
            wants:'photoUrl',
            table:'photo',
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

exports.submitPhoto = submitPhoto;
exports.receivePunOrAward = receivePunOrAward;
exports.photoList = photoList;