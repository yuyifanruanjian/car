var mysql = require('mysql')
var dbconfig = require('./db_config.json')
var log4js = require('log4js');
var logger = log4js.getLogger('db');
logger.setLevel('DEBUG');

var dbconfigj = {
    "host":dbconfig.host,
    "port":dbconfig.port,
    "database":dbconfig.database,
    "user":dbconfig.user,
    "password":dbconfig.password
};


var sqlUpdate = async function(search){
    var sql = "update " + search.table +" ",sql_d = [],sql_temp = "",sql_where="";
    for(var s in search.wants){
        sql_temp += s +"=? , ";
        sql_d.push(search.wants[s]);
    }
    for(var s in search.conditions){
        sql_where += " and " + s +"=? ,";
        sql_d.push(search.conditions[s]);
    }
    sql += sql_temp? (" set "+sql_temp.substring(0,sql_temp.length-2)):"";
    sql += sql_where?( "where "+sql_where.substring(4,sql_where.length-1)):"";
    return {sql:sql,sqlData:sql_d};
};

var sqlSelect = async function(search){
    var sql = "select " + search.wants +" from "+ search.table + " ",sql_d = [],sql_temp = "";
    for(var condi in search.conditions){
        if(search.conditions[condi].length == 1){
            sql_temp += " and " + condi + " = ? "
            sql_d.push(search.conditions[condi][0])
        }else if(search.conditions[condi].length == 2){
            sql_temp += " and " + condi + " between ? and ? "
            sql_d.push(search.conditions[condi][0]);
            sql_d.push(search.conditions[condi][1]);
        }
    }
    sql += sql_temp? ("where"+sql_temp.substring(4,sql_temp.length-1)):"";
    if (search.page != null) {
        sql+=" limit "+search.page.limit+" offset "+search.page.offset*search.page.limit;
    }
    return {sql:sql,sqlData:sql_d};
};

var sqlDelete = async function(search){
    var sql = "delete from " + search.table + " ",sql_d = [],sql_temp = "";
    for(var condi in search.conditions){
        if(search.conditions[condi].length == 1){
            sql_temp += " and " + condi + " = ? "
            sql_d.push(search.conditions[condi][0])
        }else if(search.conditions[condi].length == 2){
            sql_temp += " and " + condi + " between ? and ? "
            sql_d.push(search.conditions[condi][0]);
            sql_d.push(search.conditions[condi][1]);
        }
    }
    sql += sql_temp ? ("where"+sql_temp.substring(4,sql_temp.length-1)):"";
    return {sql:sql, sqlData:sql_d};
};

var sqlInsert = async function(search){
    return {sql:"insert into " + search.table +" set ? ",sqlData:search.conditions};
};

exports.query = async function (sql, sql_d, callback) {
        var connection = mysql.createConnection(dbconfigj);
        connection.connect(async function (err) {
            if (err) {
                logger.error('数据库连接失败');
                throw err;
            }
            connection.query(sql, sql_d, async function (err, results, fields) {
                if (err) {
                    logger.error('数据操作失败');
                    throw err;
                }
                callback && callback(results, fields);
                connection.end(async function (err) {
                    if (err) {
                        logger.error('关闭数据库连接失败');
                        throw err;
                    }
                });
            });
        });
    };

exports.sqlUpdate = sqlUpdate;
exports.sqlSelect = sqlSelect;
exports.sqlInsert = sqlInsert;
exports.sqlDelete = sqlDelete;