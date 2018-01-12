const router = require('express').Router();
const ObjectId = require('mongodb').ObjectId;

/**
 * The homepage route.
*/
router.get('/', (req, res) => {
    /**
     * Redirect the user to the login page
     * if they are not logged in.
    */
    if(!req.session.loggedin){
        res.redirect('/account/login');
    }
    else{
        /**
         * Method used to check if the user has 
         * enrolled to any courses.
         * 
        */
        const has_courses = new Promise((resolve, reject) => {
            req.db.collection('users').find({
                username: req.session.username
            }).toArray((err, user) => {
                if(err) throw err;
                else{
                    // Check if a user was found.
                    if(!user.length > 0) throw "No User found.";
                    
                    // Check if the user has any courses.
                    user = user[0];
                    if(user.courses && user.courses.length > 0){
                        resolve(true);
                    }
                    else{
                        resolve(false);
                    }
                }
            });
        });
        
        // Load up a list of courses.
        req.db.collection('courses').find().toArray((err, courses) => {
            if(err) throw err;
            else{
                res.render('dashboard/home', {
                    title: "Your Courses",
                    courses: courses,
                    is_teacher: req.session.is_teacher
                    //has_courses: has_courses
                });  
            }
        });
    }
});

module.exports = router;