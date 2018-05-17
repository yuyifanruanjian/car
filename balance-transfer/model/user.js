'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('User');
logger.setLevel('DEBUG');
var db = require('./../proxy/db');


exports.User = async function User(user) {
    this.name = user.name;
    this.passwd = user.passwd;
    this.phone = user.phone;
    this.url = user.url;
};

var register = async function (user) {
    console.log("1");
    return 1;
};

exports.register = register;


var queryq = {
    wants:'id',
    table:'user',
    conditions:{
        name:['yyf']
    },
    page:{
        limit:1,
        offset:0
    }
};


async function f() {
    let sql = await db.sqlSelect(queryq);
    console.log(sql.sql);
    await db.query(sql.sql, sql.sqlData, async function (results, fields) {
        console.log(results[0].id);
    });
};

f();