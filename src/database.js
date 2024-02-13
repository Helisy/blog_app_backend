if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const mysql = require('mysql2/promise');
var db = null;

module.exports = function () {
    if(!db) {
        db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DB,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return db;
};