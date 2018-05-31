'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Car');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");

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
                            var update = {
                                table:'car',
                                wants: {
                                    score:item.score
                                },
                                conditions:{
                                    carId:item.id
                                }
                            };
                            let sql = await db.sqlUpdate(update);
                            db.connection.query(sql.sql, sql.sqlData, async function(err, results1) {
                                callback(err);
                            });
                        } else {
                            var insert = {
                                table:'car',
                                conditions:{
                                    carId:[item.id],
                                    score:[item.score],
                                    userId: car.id
                                }
                            };
                            let sql = await db.sqlInsert(insert);
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

exports.register = register;
