const router = require('express').Router();

router.get('/', (req,res) => {
    res.end('hello world.'); 
});

/**
 * Create a logout function.
*/
router.get('/logout', (req, res) => {
    if(req.session.loggedin){
        req.session.loggedin = false;
        req.session.user = null;
    }
    
    // Take the user back to the login page.
    res.redirect('/');
});

/**
 * Used to display the user registration
 * page.
*/
router.get('/register', (req, res) => {
    // Check that the user is not already loggedin.
    if(req.session.loggedin){
        res.redirect('/');
    }
    else{
        /**
         * Get the list of schools, and render
         * the view.
        */
        req.db.collection('schools').find().toArray((err, schools) => {
            if(err) throw err;
            else{
                res.render('account/register', {
                    title: "Account Registration",
                    schools: schools
                });     
            }
        });
    }
});

/**
 * Used to authenticate a user
 * based on the data submitted
 * through the login form.
*/
router.post('/login', (req, res) => {
    // Check that the user is not already loggedin
    if(req.session.loggedin){
        res.redirect('/');
    }
    else{
        // Check that everything has been submitted.
        if(req.body.username && req.body.password){
            let username = req.body.username;
            let password = req.body.password;
            
            req.db.collection('users').find({
                username: username,
                password: password
            }).toArray((err, docs) => {
                if(err) throw err;
                else{
                    // Check if a user was found.
                    if(docs.length > 0){
                        // Check if the user is a teacher.
                        if(docs[0].is_teacher){
                            req.session.is_teacher = true;
                        }
                        
                        // User found.
                        req.session.loggedin = true;
                        req.session.username = username;
                        
                        // Take the user to their dashboard
                        res.redirect('/');
                    }
                    else{
                        // Bad login request.
                        res.redirect('/account/login?login_error=true');
                    }
                }
            });
        }
    }
});

/**
 * The login page.
*/
router.get('/login', (req, res) => {
    /**
     * Redirect the user if they are 
     * already loggedin.
    */
    if(req.session.loggedin){
        res.redirect('/');
    }
    else{
        res.render('account/login', {
            title: "Account Login",
            login_error: (req.query.login_error == 'true')
        });
    }
})

module.exports = router;