const express = require('express');
var app = express();

require('./routes/main.js')(app);

app.set("views",__dirname + "/views");                                                                                                        
app.set("view engine", "ejs");                                                                                                                
app.engine("html",require("ejs").renderFile)

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log(`Express app listening on port ${port}`);
});

module.exports = server;
