'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('User');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');
var async = require("async");


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
    var response = {
        success: false,
        status: '999',
        message: '注册失败'
    };
    try {
        let sql = await db.sqlInsert(insert);
        async.eachSeries([sql], async function(item, callback) {
            db.connection.query(item.sql, item.sqlData, async function(err, results) {
                if(err) {
                    callback(err);
                    res.send(response);
                } else {
                    logger.debug("insert success");
                    callback();
                }
            });
        }, async function(err) {
            if(err) {
                logger.error(err);
                res.send(response);
            } else {
                logger.debug("SQL all success");
            }
        });
    } catch(error) {
        logger.error('Failed to insert user: %s with error: %s', user.name, error.toString());
        res.send(response);
    }
    try {
        var queryq = {
            wants:'id',
            table:'user',
            conditions:{
                name:[user.name],
                passwd: [user.passwd]
            }
        };
        let sql = await db.sqlSelect(queryq);
        var counts = {};
        async.forEachOf({1:sql}, async function(value, key, callback) {
            db.connection.query(value.sql, value.sqlData, async function(err, results) {
                if(err) {
                    callback(err);
                    res.send(response);
                } else {
                    counts['id'] = results[0]['id'];
                    callback();
                }
            });
        }, async function(err, results) {
            if(err) {
                logger.error(err);
                res.send(response);
            } else {
                var response = {
                    message : '注册成功',
                    token : token,
                    payload: {counts}
                };
                logger.debug(counts);
                res.json(response);
            }
        });
    } catch(error) {
        logger.error('Failed to get user id: %s with error: %s', user.name, error.toString());
        res.send(response);
    }

};

exports.register = register;

