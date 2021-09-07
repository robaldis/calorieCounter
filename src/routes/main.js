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
        var meals = [];
        // Get all meals
        db.query(`SELECT * FROM meals`, function(err,result) {
            if (err) {
                res.render("home.html", {"err": "could not get data", "meals": []});
                return;
            }
            meals = result;
            res.render("home.html", {"err": "", "meals": meals});
        });
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

    app.get('/createMeal', function (req, res) {
        res.render('createMeal.html', {err:""});
        var ingredients = [];
        var calories;
        for (var i = 0; i< req.body.ingredientNames; i++) {
            var id = addIngredient(req.body.ingredientNames[i], req.body.ingredientCalories[i]);
            ingredients.push(id);
            calories += int(req.body.ignredientCalories[i]);
        }

        addMeal(req.body.mealName, calories, ingredients);
    });

    app.post('/createMeal', async function (req, res) {
        // Add all of the ingredients
        var ingredientIds = [];
        var totCalories = 0;
        
        // Add all the ingredients
        for (var i = 0; i < req.body.ingredientName.length; i++) {
            console.log("something");
            try {
                let row = await addIngredient(req.body.ingredientName[i], req.body.ingredientCalories[i]);
                ingredientIds.push(row[0]);
                console.log(parseInt(row[2]));
                totCalories += parseInt(row[2]);
            } catch(err) {
                console.log(err);
                res.render('createMeal.html', {err:"Something went wrong try again"});
                return;
            }
        }

        // Add meal to database
        try {
            mealId = await addMeal(req.body.mealName, totCalories);
        } catch(err) {
            console.log(err);
            res.render('createMeal.html', {err:"name taken"});
            return
        }


        // Add to junction table
        try {
            await linkIngredientsToMeal(mealId, ingredientIds);
            res.render('createMeal.html', {err:"Meal added"});
        } catch (err) {
            res.render('createMeal.html', {err:"somthing went wrong, not all ingredients have been added"});
        }
    });

    app.get('/meal', function(req, res) {
        // Get the meal that is being requested
        // Get all the ingredients that are associated with that meal
        var name = req.query.name
        db.query(`SELECT * FROM meals WHERE name='${name}';`, function (err, result) {
            console.log(result);
            if (err) {
                res.render('meal.html', {err:"Could not get meal", meal:{name:"", calories:""}, ingredients:[]});
                return;
            }
            db.query(`SELECT ingredients.name, ingredients.calories 
                FROM meal_ingredients  
                JOIN meals on meal_ingredients.meal_id = meals.id 
                JOIN ingredients on meal_ingredients.ingredient_id  = ingredients.id
                WHERE meal_id = '${result[0].id}'`, function (err, ings) {
                    console.log(ings);
                if (err) {
                    console.log(err);
                }

                res.render('meal.html', {err:"", meal:{name:result[0].name, calories:result[0].calories}, ingredients:ings});
            });

        });



    });
}

function addMeal(name, calories) {
    // name: String
    // calories: String
    // ingredients: List<ingredientIds>

    console.log(name);
    console.log(calories);
    var id;
    return new Promise( function(resolve, reject) {
        db.query(`SELECT * FROM meals WHERE name = '${name}';`, function (err, result) {
            if (err) {
                reject(err);
            } else {
                if (result.length == 0) {
                    // Add new
                    db.query(`INSERT INTO meals (name, calories) VALUES ('${name}', ${calories});`, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(result)
                            id = result.insertId;
                            resolve([id,name,calories]);
                        }
                    });

                } else {
                    reject("name taken");
                }
            }
        });
    });
}

function addIngredient(name, calories) {
    var id;

    return new Promise(function (resolve, reject) {
        // Does the ingredient already exist
        // if so then update calorie count
        db.query(`SELECT * FROM ingredients WHERE name = '${name}';`, function (err, ingredient) {
            if (err) {
                reject("Failed");
            } else {
                if (ingredient.length == 0) {
                    // Add a new one
                    db.query(`INSERT INTO ingredients (name, calories) VALUES ('${name}', ${parseInt(calories)});`, function (err, result) {
                        if (err) {
                            reject("Failed");
                        } else {
                            console.log("Adding a new one")
                            console.log(result)
                            id = result.insertId
                            resolve([id, name, calories])
                        }
                    });
                } else {
                    // Update
                    db.query(`UPDATE ingredients SET calories=${parseInt(calories)} WHERE name='${name}'`, function(err, result) {

                        if (err) {
                            reject("Failed");
                        } else {
                            id = ingredient[0].id;
                            console.log(id);
                            resolve([id, name, calories])
                        }
                    });
                }
            }
        });
    });
}

function linkIngredientsToMeal(meal, ingredients) {
    console.log(ingredients.length);
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < ingredients.length; i++) {
            console.log("The loop to add all the things inside junction table is runnign");
            db.query(`INSERT INTO meal_ingredients (meal_id, ingredient_id) VALUES (${parseInt(meal[0])}, ${ingredients[i]});`, function (err, result) {
                console.log(err);
                if (err) {
                    reject(err);
                }
            });
        }
        resolve();
    });
}
