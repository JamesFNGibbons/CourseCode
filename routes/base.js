const router = require('express').Router();

/**
 * Used to display the my-base page.
 * which is an overview of the base.
*/
router.get('/my-base', (req, res) => {
    if(req.session.loggedin){
        /**
         * Method used to get the teachers
         * details, from the base ID.
        */
        const get_teacher = (base_id) => {
            return new Promise((resolve, reject) => {
                req.db.collection('users').find({
                    base_id: base_id
                }).toArray((err, teacher) => {
                    if(err) throw err;
                    else{
                        // Check if the teacher is valid
                        if(teacher.length > 0){
                            resolve(teacher[0]);
                        }
                        else{
                            reject('Invalid teacher. ');
                        }
                    }
                });
            }); 
        };
        
        /**
         * Method used to get the users base ID.
        */
        const get_base_id = new Promise((resolve, reject) => {
            req.db.collection('users').find({
                username: req.session.username,
            }).toArray((err, user) => {
                if(err) throw err;
                else{
                    // Check if the user is valid
                    if(user.length > 0){
                        let base_id = user[0].base_id;
                        resolve(base_id);
                    }
                    else{
                        reject("Invalid user.");
                    }
                }
            });
        });
        
        get_base_id.then((base_id) => {
            get_teacher(base_id).then((teacher) => {
               res.render('base/my-base', {
                   title: "My Base",
                   teacher: teacher,
                   is_managing_teacher: (req.session.username == teacher.username)
               }); 
            });
        })
        
    }
    else{
        res.redirect('/');
    }
});

/**
 * Redirect the user if they have
 * not yet joined a base.
*/
router.get('/', (req, res) => {
    if(req.session.loggedin){
        // Get the users info
        req.db.collection('users').find({
            username: req.session.username
        }).toArray((err, user) => {
            if(err) throw err;
            else{
                // Check that the user is valid
                if(user.length > 0){
                    if(user[0].base_id){
                        res.redirect('/base/my-base');
                    }
                    else{
                        // No base.
                        res.redirect('/base/join-base');
                    }
                }
                else{
                    // Not valid
                    res.redirect('/');
                }
            }
        });
    }
    else{
        res.redirect('/');
    }
});

/**
 * Used to display the join base
 * page.
*/
router.get('/join-base', (req, res) => {
    if(req.session.loggedin){
        /**
         * Method used to get the users details
         * from their username stored in the session.
        */
        let get_user = new Promise((resolve, reject) => {
            req.db.collection('users').find({
                username: req.session.username
            }).toArray((err, user) => {
                if(err) throw err;
                else{
                    // Check that the user is valid
                    if(user.length > 0){
                        // return the found user.
                        resolve(user[0]);
                    }
                    else{
                        reject("Invalid User.");
                    }
                }
            })
        });
        
        // Check that the user is not already part of a base
        get_user.then((user) => {
            if(user.base){
                // Take the user to their own base page.
                res.redirect('/base/my-base');
            }
            else{
                // Render the view
                res.render('base/join-base', {
                    title: "Join A Base",
                    user: user
                });
            }
        });
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;