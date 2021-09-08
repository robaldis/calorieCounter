const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const MySqlStore = require('express-mysql-session')(session);
require('dotenv').config();


var mysql_user = process.env.MYSQL_USER;
var mysql_host = process.env.MYSQL_HOST;
var mysql_password = process.env.MYSQL_PASSWORD;

var options = { 
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    database:"calorieCounter",
    insecureAuth: true
}

const db = mysql.createConnection(options);

var app = express();
var sessionStore = new MySqlStore(options, db);

app.use(express.urlencoded({extended:true}));
app.use(session({key:'temp', 
    secret: 'temp', 
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

require('./routes/main.js')(app);



db.connect((err)=>{                                                                                                                           
    if (err) {                                                                                                                                
        throw err;                                                                                                                            
    }                                                                                                                                         
    console.log("Connected to database");                                                                                                     
});                                                                                                                                           

global.db = db; 


app.set("views",__dirname + "/views");                                                                                                        
app.use(express.static(__dirname + "/scripts"));                                                                                                        
app.set("view engine", "ejs");                                                                                                                
app.engine("html",require("ejs").renderFile)

var server = app.listen(5000, function () {
    var port = server.address().port;
    console.log(`Express app listening on port ${port}`);
});

module.exports = server;
