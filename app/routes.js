module.exports = function (app, passport, db) {
    // db is the connection where we can find everything
    // normal routes ===============================================================
    const { ObjectId } = require('mongodb')
    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('order.ejs');
    });

    app.get('/index', function (req, res) {
        res.render('index.ejs');
    });


    const orderCollection = db.collection('orders')

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        orderCollection.find().toArray()
            .then(results => {
                let notCompleted = results.filter(element => element.completed === false)
                let completed = results.filter(element => element.completed === true)
                res.render('profile.ejs', { user: req.user, orders: notCompleted, done: completed})
            })
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // message board routes ===============================================================

    app.post('/newOrder', (req, res) => {
        orderCollection.insertOne({
            name: req.body.name,
            coffee: req.body.coffee,
            size: req.body.size,
            temp: req.body.temp,
            cream: req.body.cream,
            flavor: req.body.flavor,
            completed: false,
            barista: ''
        }, (err, result) => {
            if (err) return console.log(err)
            console.log('saved to database')
            res.redirect('/')
        })
    })

    app.put('/orderComplete', (req, res) => {
        orderCollection.findOneAndUpdate({ _id: ObjectId(req.body._id) }, {
            $set: {
                completed: true,
                barista: req.body.barista
            }
        }, {
            sort: { _id: -1 },
            upsert: false
        }, (err, result) => {
            if (err) return res.send(err)
            res.send(result)
        })
    })

    // app.put('/messagesDown', (req, res) => {
    //   db.collection('messages')
    //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    //     $set: {
    //       thumbUp:req.body.thumbUp - 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

    app.delete('/orderDelete', (req, res) => {
        console.log(req.body._id)
        orderCollection.findOneAndDelete({ _id: ObjectId(req.body._id) }, (err, result) => {
            if (err) return res.send(500, err)
            res.send('Order deleted!')
        })
    })
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) => dont touch, it works==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
