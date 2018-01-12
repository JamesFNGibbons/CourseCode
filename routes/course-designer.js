const router = require('express').Router();

/**
 * Route used to delete the unsaved course
 * in the session and start again.
*/
router.get('/delete-unsaved', (req, res) => {
    if(req.session.unsaved_course){
        delete req.session.unsaved_course;
    }
    
    res.redirect('/course-designer/continue');
});

/**
 * Route used to check if there is a
 * partially saved course.
*/
router.get('/', (req, res) => {
    if(req.session.loggedin){
        // Check if their is an unsaved course.
        if(req.session.unsaved_course){
            res.render('course-designer/step1', {
                title: "Course Designer",
                has_unsaved_cousrse: true
            });
        }
        else{
            // Create the unsaved course object
            req.session.unsaved_course = {};
            req.session.unsaved_course.designer = {};
            
            // Ensure the user stays on the first step.
            req.session.unsaved_course.designer.step = 1;
            
            res.render('course-designer/step1', {
                title: "Course Designer",
                has_unsaved_cousrse: false
            });
        }
    }
    else{
        res.redirect('/');
    }
});

/**
 * Used to load the correct view for the
 * step.
*/
router.get('/step/:step', (req, res) => {
    if(req.session.loggedin){
        if(req.session.unsaved_course){
            res.render(`course-designer/step${req.params.step}`, {
                title: "Course Designer",
                course: req.session.unsaved_course
            });
        }
        else{
            res.render(`course-designer/step${req.params.step}`, {
                title: "Course Designer"
            });
        }
    }
    else{
        res.redirect('/');
    }
});

/**
 * Route used to complete step 1 of
 * the course designer. 
*/
router.post('/step/1', (req, res) => {
    if(req.session.loggedin){
        /**
         * Method used to upload and return
         * the URL of the thumbnail image.
        */
        const upload_thumbnail = new Promise((resolve, reject) => {
            if(req.files.thumbnail){
                // Get the file extension
                let file = req.files.thumbnail;
                let file_ext = '.' + file.name.split('.')[1];
                
                // Generate a random file name for the thumbnail.
                let filename = '';
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 5; i++){
                    filename += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                
                // Append the file extension to the file name
                filename += file_ext;
                
                // Upload the new file into the uploads folder.
                file.mv(`${__dirname}/../static/uploads/thumbnails/${filename}`, (err) => {
                    if(err) throw err;
                    else{
                        // Return the path to the new thumbnail file.
                        resolve(`/uploads/thumbnails/${filename}`);
                    }
                });
            }
        });
        
        /** 
         * Generate the empty topics objects
         * based on the number of topics submitted.
        */
        let topics = [];
        for(let i = 0; i < req.body.topics; i++){
            topics.push({});
        }
        
        upload_thumbnail.then((thumbnail) => {
            /**
             * The inital course object. We will keep the designer
             * sub object, as this contains information about the
             * users progress through the course designer. This will
             * be removed later, when the course is published.
            */
            let designer = req.session.unsaved_course.designer;
                designer.step = 2;
            
            let course = {
                name: req.body.name,
                short_desc: req.body.description,
                topics: topics,
                thumbnail: thumbnail,
                designer: designer
            };
            
            // Append the new course to the unsaved_course session object
            req.session.unsaved_course = course;
            res.redirect('/course-designer/step/2');
        });

    }
    else{
        res.redirect('/');
    }
});

/**
 * Route used if the user would like 
 * to continue editing an unsaved 
 * course.
*/
router.get('/continue', (req, res) => {
    if(req.session.loggedin){
        // Check if there is an unsaved course
        if(req.session.unsaved_course){
            res.redirect(`/course-designer/step/${req.session.unsaved_course.designer.step}`);
        }
        else{
            res.redirect('/course-designer');
        }
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;