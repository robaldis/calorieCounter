const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render("home.html");
    });

    app.get('/about', function (req, res) {
        res.send("ok");
    });

    app.get('/signup', function (req, res) {
        res.render("signup.html", {err:""});
    });

    app.post('/signup', function (req, res) {

        // Check if the passwords match
        if (req.body["password"] != req.body["repassword"]) {
            res.render("signup.html", {err: "Passwords do not match"});
            return;
        }
        // Check if there data is there
        if (req.body["username"] == "" && req.body["password"] == "") {
            res.render("signup.html", {err: "All fields must be filled"});
            return;
        }

        // hash password
        bcrypt.hash(req.body["password"], saltRounds, function(err, hash){ 
            
            // Check if there is already a username in the database
            // put it all in the database
            db.query("SELECT name FROM users WHERE name = '" + req.body["username"] +"'", function(err, results) {
                if (results.length === 0) {
                    sqlquery = `INSERT INTO users (name, password) VALUES ('${req.body["username"]}', '${hash}');`
                    db.query(sqlquery, function(err, result) {
                        if (err) {
                            console.log(err);
                            res.render("signup.html", {err:"Something went wrong, user not created"});
                        } else {
                            res.render("signup.html", {err:"User created"});
                        }
                    });
                } else {
                    res.render("signup.html", {err:"User not created, username taken"});
                }
            });
        });

    });
}
