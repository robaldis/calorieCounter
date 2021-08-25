const express = require('express');
const mysql = require('mysql');
require('dotenv').config();


var app = express();

require('./routes/main.js')(app);


var mysql_user = process.env.MYSQL_USER;
var mysql_host = process.env.MYSQL_HOST;
var mysql_password = process.env.MYSQL_PASSWORD;


const db = mysql.createConnection({
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    database:"calorieCounter",
    insecureAuth: true
});

db.connect((err)=>{                                                                                                                           
    if (err) {                                                                                                                                
        throw err;                                                                                                                            
    }                                                                                                                                         
    console.log("Connected to database");                                                                                                     
});                                                                                                                                           
global.db = db; 


app.set("views",__dirname + "/views");                                                                                                        
app.set("view engine", "ejs");                                                                                                                
app.engine("html",require("ejs").renderFile)

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log(`Express app listening on port ${port}`);
});

module.exports = server;
