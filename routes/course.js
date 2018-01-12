const router = require('express').Router();
const ObjectId = require('mongodb').ObjectId;

/**
 * Route used to bookmark a given
 * course.
*/
router.post('/bookmark', (req, res) => {
    if(req.session.loggedin && req.body.course_id){
        /**
         * Method used to get the users bookmarked courses.
        */
        const get_courses = new Promise((resolve, reject) => {
            req.db.collection('users').find({
                username: req.session.username
            }).toArray((err, user) => {
                if(err) throw err;
                else{
                    // Check if a valid user was found.
                    if(user.length > 0){
                        user = user[0];
                        
                        /**
                         * Return an empty array if the user has no
                         * bookmarked courses.
                        */
                        if(user.bookmaked_courses){
                            resolve(user.bookmaked_courses);
                        }
                        else{
                            // Return an empty array.
                            resolve(new Array());
                        }
                    }
                    else{
                        // Invalid user.
                        res.redirect('/');
                    }
                }
            });
        });
        
        // Append the course to the users bookmarked courses.
        get_courses.then((courses) => {
            courses.push(req.body.course_id);
            
            // Update the users object to include this course.
            req.db.collection('users').update({
                username: req.session.username
            }, {
                $set: {
                    "bookmaked_courses": courses
                }
            });
            
            // Redirect the user to the bookmarked courses page.
            res.redirect('/course/bookmarked');
        });
    }
    else{
        res.redirect('/');
    }
});

/**
 * Route used to dispalay the bookmarked
 * courses of a user.
*/
router.get('/bookmarked', (req, res) => {
    if(req.session.loggedin){
        /**
         * Method used to get the users
         * bookmarked courses.
        */
        const get_bookmarked_courses = new Promise((resolve, reject) => {
            req.db.collection('users').find({
                username: req.session.username
            }).toArray((err, user) => {
                if(err) throw err;
                else{
                    // Check that the user is valid.
                    if(user.length > 0){
                        
                        // Only return the courses, if they exist.
                        if(user[0].bookmaked_courses){
                            resolve(user[0].bookmaked_courses);
                        }
                        else{
                            resolve([]);
                        }
                    }
                    else{
                        // Invalid user.
                        res.redirect('/');
                    }
                }
            });
        }); 
        
        /**
         * Method used to get a course from
         * its ID, that is provided from the 
         * users bookmarked_courses object.
         * @param course_id The Object ID of the course.
        */
        const get_course = (course_id) => {
            return new Promise((resolve, reject) => {
                req.db.collection('courses').find({
                    _id: ObjectId(course_id)
                }).toArray((err, course) => {
                    if(err) throw err;
                    else{
                        // Check that the course is valid
                        if(course.length > 0){
                            // Return the found course.
                            resolve(course[0]);
                        }
                        else{
                            reject('Invalid Course ID');
                        }
                    }
                });       
            });
        };
        
        // Check if there are any bookmarked courses.
        get_bookmarked_courses.then((courses) => {
            // Loop through the courses ID's and get the full objects from the db
            let bookmaked_courses = new Array();
            for(course in courses){
                course = courses[course];
                
                // Get the course info, and push to the courses array.
                get_course(course).then((the_course) => {
                    bookmaked_courses.push(the_course);
                });
            }
            
            if(courses.length > 0){
                res.render('course/bookmarked', {
                    title: "Bookmarked Courses",
                    courses: bookmaked_courses,
                    no_courses: false
                });
            }
            else{
                // No courses. 
                res.render('course/bookmarked', {
                    title: "Bookmarked Courses",
                    no_courses: true
                });
            }
        })
        
    }
    else{
        res.redirect('/');
    }
});

/**
 * Route used to show the information
 * about a given course.
*/
router.get('/view/:course_id', (req, res) => {
    if(req.session.loggedin){
        if(req.params.course_id){
            let course_id = ObjectId(req.params.course_id);
            
            // Fetch the course info from the database.
            req.db.collection('courses').find({
                _id: course_id
            }).toArray((err, course) => {
                if(err) throw err;
                else{
                    // Check that the course exists
                    if(course.length > 0){
                        // Select the first course from the course array.
                        course = course[0];
                        
                        res.render('course/view', {
                            title: "View Course :: " + course.name,
                            course: course
                        });
                    }
                    else{
                        // Invalid course. 
                        res.redirect('/');
                    }
                }
            });
        }
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;