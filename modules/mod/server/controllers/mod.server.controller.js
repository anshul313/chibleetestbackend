var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/mod.server.model');

var methods = {};

exports.modRegister = function(req, res, next) {
<<<<<<< HEAD
    console.log('hello');
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
=======
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
>>>>>>> 09cf269aac4d8a52f59f5bd6ccd00781183d7f97

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(user);
                }
            });
        });

        // req.flash('success_msg', 'You are registered and can now login');

        // res.redirect('/users/login');
    }
}

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }
            User.comparePassword(password, user.password, function(err,
                isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
var sess;
exports.modLogin = function(req, res, next) {
    sess = req.session;
    console.log('session thing :  ', sess);
    passport.authenticate('local', function(err, user, info) {

<<<<<<< HEAD
        if (err || !user) {
            res.status(422).send(info);
=======
    if (err || !user) {
      res.status(422).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
>>>>>>> 09cf269aac4d8a52f59f5bd6ccd00781183d7f97
        } else {
            sess.email = user.email;
            // console.log('user  :  ', user);
            // Remove sensitive data before login
            user.password = undefined;

            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(user);
                }
            });
        }
    })(req, res, next);
}

/**
 * Signout
 */
exports.modLogout = function(req, res) {
    req.session.destroy();
    req.logout();
    res.json({
        'message': 'You are logged out'
    });
};