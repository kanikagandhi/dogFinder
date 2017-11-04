module.exports = function(app, io, mongo, passport) {
    
    app.get('/', home);
    app.get('/home', home);

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', {
            isLoggedIn: req.isAuthenticated()
        }); 
    });

    // process the login form
    app.post('/login', function(req, res) {
        mongo.connect(app.get('mongoUrl'), function(err, db) {
            if (err) throw err;
            db.collection("netcode_users").findOne({
                username: req.fields.Username,
                password: req.fields.Password
            }, function(err, result) {
                if (err) throw err;
                if(result == null) {
                    req.flash('alert alert-danger','<b>Sorry!</b> Incorrect login information.');
                    res.render('login',{
                        isLoggedIn: req.isAuthenticated()
                    });
                } else {
                    req.login(result, function() {
                        req.username = result.username;
                        console.log(req.username);
                        res.redirect('/');
                    });
                }
                db.close();
            });
        });
    });

    app.get('/register', function(req, res) {
        res.render('register', {
            isLoggedIn: req.isAuthenticated()
        });
    });

    app.post('/register', function(req, res) {
        mongo.connect(app.get('mongoUrl'), function(err, db) {
            if (err) throw err;
            var username = req.fields.Username;
            var password = req.fields.Password;
            if(password != req.fields.ConfirmPassword) {
                    req.flash('alert alert-warning','Passwords do not match');
                    res.render('register', {
                       isLoggedIn: req.isAuthenticated()
                   });
                return;
            }
            db.collection("netcode_users").findOne({username:username},function(err,result) {

                if(result == null) {
                db.collection("netcode_users").insertOne({
                    username: username,
                    password: password,
                    followers: {}
                }, function(err, result) {
                    if (err) throw err;
                    req.login(result.insertedId, function(err) {
                        res.redirect('/');
                    })
                    db.close();
                });
               } else {
                   req.flash('alert alert-danger','<b>Sorry!</b> That username is already taken.');
                   res.render('register', {
                       isLoggedIn: req.isAuthenticated()
                   });
               }
            })

        });
    });

        obj = req.user;
        delete obj.password;
        res.render('profile', {
            user : obj,
            OtherAccount : false,
            isLoggedIn : req.isAuthenticated(),
            query_var: req.query.id
        });

    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
