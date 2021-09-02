const bcrypt = require("bcrypt");
const saltRounds = 10;

// Check if the current user is signed in
function isAuth(req, res, next) {
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
};

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render("home.html");
    });

    app.get('/about', function (req, res) {
        res.render("about.html");
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
        // Check if all the data has been filled in
        if (req.body["username"] == "" && req.body["password"] == "") {
            res.render("signup.html", {err: "All fields must be filled"});
            return;
        }
        // hash the password
        bcrypt.hash(req.body["password"], saltRounds, function(err, hash){ 
            // Check if there is already a username in the database
            // put it all in the database
            if (isUsernameInDatabase(req.body.username)) {
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


    app.get('/login', function (req, res) {
        res.render("login.html", {err:""});
    });

    app.post('/login', function (req, res) {
        db.query(`SELECT name, password FROM users WHERE name = '${req.body.username}'`, function(err, results) {
            if (err) {
                console.log(err);
                res.render("login.html", {err:"Something went wrong try again"});
            }
            if (results.length == 0) {
                // No user in the database
                res.render("login.html", {err:"No user in the database"});
                return;
            }
            // Comapre the password that the user entered to the one in the 
            // database
            bcrypt.compare(req.body.password, results[0].password, function (err, passComp) {
                if (results[0].username == req.body.name && passComp) {
                    // Password matched, log user in
                    req.session.isAuth = true;
                    req.session.username = results[0].name;
                    res.redirect('/');
                } else {
                    // Password incorrect
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
        // Make sure the new username isnt taken
        if (!isUsernameInDatabase(req.body.newUsername)) {
            // Make sure they are editing their own username
            if (req.body.username != req.session.username) {
                res.render('account.html', {err:"Not correct username"});
                return;
            }
            // Update username
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
            // newUsername is already in the database
            res.render('account.html', {err:"Username already taken"});
        }
    });


    app.post('/logout', isAuth, function(req,res) {
        // Log the user out
        req.session.destroy(function (err) {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    });


    app.post('/changepassword', function(req, res) {
        if (req.body.password != req.body.repassword) {
            res.render('account.html', {err:"New passwords do not match"});
            return;
        }
        db.query(`SELECT name, password FROM users WHERE name = '${req.session.username}'`, function(err, results) {
            // Compare the old password with the current password so not anyone 
            // can overwirte
            bcrypt.compare(req.body.oldPassword, results[0].password, function (err, passComp) {
                // Hash the new function
                if (passComp) {
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
                } else {
                    res.render('account.html', {err:"Old password did not match"});
                }
            });
        });
    });
}
