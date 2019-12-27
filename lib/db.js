var mysql = require('mysql');
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'open'
  })
  
  db.connect();
  module.exports = db;