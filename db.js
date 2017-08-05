var mysql = require('mysql');

var data;

var con = mysql.createConnection({
  host: "localhost",
  user: "pacs",
  password: "pacs",
  database: "pacsdb"
});

con.connect(function(err) {
    if (err) throw err;
});

module.exports = con;