const router = require('express').Router();
const ObjectId = require('mongodb').ObjectId;

/**
 * Used to display the teacher registration page.
*/
router.get('/register', (req, res) => {
    // Check that the user is not already loggedin.
    if(req.session.loggedin){
        res.redirect('/');
    }
    else{
        res.render('teacher/register', {
            title: "Teacher Registration"
        });
    }
});

/**
 * Route used to register a new teacher.
*/ 
router.post('/register', (req, res) => {
    if(!req.session.loggedin){
        /**
         * Method used to check if an email
         * is already in use.
        */
        const email_in_use = (email) => {
            return new Promise((resolve, reject) => {
                req.db.collection('users').find({
                    email: email
                }).toArray((err, users) => {
                    if(err) throw err;
                    else{
                        // Check if the email is used
                        resolve((users.length > 0));
                    }
                });
            });  
        };
        
        /**
         * Method used to check if a school is 
         * currently being used.
        */
        const school_exists = (school) => {
          return new Promise((resolve, reject) => {
              req.db.collection('schools').find({
                name: school   
              }).toArray((err, schools) => {
                  if(err) throw err;
                  else{
                      // Check if the school exists
                      resolve((schools.length > 0));
                  }
              });
          });  
        };
        
        // Create the school if it does not exist.
        school_exists(req.body.school).then((exists) => {
            if(!exists){
                req.db.collection('schools').insert({
                    name: req.body.school
                }, (err) => {
                    if(err) throw err;
                });
            }
        }); 
        
        /**
         * Create the user only if the email
         * is not already in use.
        */
        email_in_use(req.body.email).then((exists) => {
            if(exists){
                res.redirect('/teacher/register?email_exists=true');
            }
            else{
                req.db.collection('users').insert({
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.email,
                    school: req.body.school,
                    password: req.body.password,
                    is_teacher: true,
                    base_id: Math.floor(Math.random()*90000) + 10000,
                }, (err) => {
                    if(err) throw err;
                    else{
                        // Log the user in
                        req.session.loggedin = true;
                        req.session.username = req.body.email;
                        
                        // Take the new teacher to the teachers center.
                        res.redirect('/teacher');
                    }
                });
            }
        })
    }
    else{
        res.redirect('/');
    }
});

/**
 * Route used to check if the user is a teacher.
*/
router.get('/', (req, res) => {
    /**
     * Load up students who are members of
     * the teachers base.
    */
    const get_students = (base_id) => {
        return new Promise((resolve, reject) => {
            req.db.collection('users').find({
                base_id: base_id
            }).toArray((err, students) => {
                if(err) throw err;
                else{
                    resolve(students);
                }
            });
        });
    };
    
    /**
     * Method used to get an array of publushed
     * couses by a given teacher.
    */
    const get_courses = (teacher_id) => {
        return new Promise((resolve, reject) => {
            req.db.collection('courses').find({
                author: ObjectId(teacher_id)
            }).toArray((err, courses) => {
                if(err) throw err;
                else{
                    resolve(courses);
                }
            });
        });
    };
    
    /**
     * Method used to get the teachers user 
     * info.
    */
    const get_user = new Promise((resolve, reject) => {
        req.db.collection('users').find({
            username: req.session.username
        }).toArray((err, user) => {
            if(err) throw err;
            else{
                // Check if the user is valid
                if(user.length > 0){
                    resolve(user[0]);
                }
                else{
                    reject('Invalid user.');
                }
            }
        });
    });
    
    if(req.session.loggedin){
        if(req.session.is_teacher){
            get_user.then((user) => {
                get_students(user.base_id).then((students) => {
                    res.render("teacher/overview", {
                        title: "Teacher Overview",
                        user: user,
                        students: students
                    });  
                });
            });
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;