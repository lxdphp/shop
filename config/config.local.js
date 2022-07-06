const pg = require('pg')

// 数据库配置
var config = {
    user: "postgres",
    host: 'localhost',
    database: "public",
    password: "123456",
    port: 5432,

    // 扩展属性
    max: 20, // 连接池最大连接数
    idleTimeoutMillis: 3000, // 连接最大空闲时间 3s
}

// 创建连接池
var pool = new pg.Pool(config)


var PG = function(){
    console.log("准备向****数据库连接...");
};
 
PG.prototype.getConnection = function(){
    pool.connect(function (err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        pool.query('SELECT NOW() AS "theTime"', function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            console.log("hbdfxt数据库连接成功...");
        });
    });
};
module.exports = pool