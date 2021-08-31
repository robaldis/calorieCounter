const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function (app) {
    const isAuth = function(req, res, next) {
        if (req.session.isAuth) {
            next();
        } else {
            res.redirect('/login');
        }
    };

    function isUsernameInDatabase(username) {
        db.query("SELECT name FROM users WHERE name = '" + username +"'", function(err, results) {
            if (results.length === 0) {
                return false;
            } else {
                return true;
            }
        });
    }

    app.get('/', function (req, res) {
        res.render("home.html");
    });

    app.get('/about', function (req, res) {
        res.send("ok");
    });

    app.get('/signup', function (req, res) {
        res.render("signup.html", {err:""});
        req.session.isAuth = true;
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
                            req.session.isAuth = true;
                            req.session.username = req.body.username;
                            res.redirect('/');
                        }
                    });
                } else {
                    res.render("signup.html", {err:"User not created, username taken"});
                }
            });

        });

    });

    app.get('/login', function (req, res) {
        res.render("login.html", {err:""});
    });

    app.post('/login', function (req, res) {
        db.query(`SELECT name, password FROM users WHERE name = '${req.body.username}'`, function(err, results) {
            if (err) {
                console.log(err);
                res.render("login.html", {err:"Something went wrong try again"});
            }
            // Comapre the passwords
            bcrypt.compare(req.body.password, results[0].password, function (err, passComp) {
                if (results[0].username == req.body.name && passComp) {
                    req.session.isAuth = true;
                    req.session.username = results[0].name;
                    res.redirect('/');
                } else {
                    res.render("login.html", {err:"Username or password not correct"});
                }
            });
        });
    });

    app.get('/account', isAuth, function(req, res) {
        res.render('account.html', {err:""});
    }) ;

    app.post('/delteAccount', isAuth, function(req, res) {
    });

    app.post('/changeusername', isAuth, function(req, res) {
        if (!isUsernameInDatabase(req.body.newUsername)) {
            console.log(req.session);
            if (req.body.username != req.session.username) {
                res.render('account.html', {err:"Not correct username"});
                return;
            }
            db.query(`UPDATE users SET name='${req.body.newUsername}' WHERE name='${req.body.username}'`, function(err, results) {
                if (err) {
                    console.log(err);
                    res.render('account.html', {err:"Something went wrong"});
                } else {
                    res.render('account.html', {err:"username updated"});
                    req.session.username = req.body.newUsername
                }
            });
        }
        else {
            res.render('account.html', {err:"Username already taken"});


        }
    });

    app.post('/logout', isAuth, function(req,res) {
        req.session.destroy(function (err) {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    });

    app.post('/changepassword', function(req, res) {
        db.query(`SELECT name, password FROM users WHERE name = '${req.session.username}'`, function(err, results) {
            bcrypt.compare(req.body.oldPassword, results[0].password, function (err, passComp) {
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    console.log(req.body.password);
                    db.query(`UPDATE users SET password='${hash}' WHERE name='${req.session.username}'`, function(err, results) {
                        if (err) {
                            console.log(err);
                            res.render('account.html', {err:"Something went wrong"});
                        } else {
                            res.render('account.html', {err:"password updated"});
                        }
                    });
                });
            });
        });
    });

}
