const express = require('express');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');
const fs = require("fs");
const cookieSession = require('cookie-session');
const mongodb = require("mongodb");
const express_mongodb = require('express-mongo-db');
const config = require('./config.json');
const express_fileuploads = require('express-fileupload');

// Setup the express app
let app = express();

/**
 * Configure the express framework to use the
 * handlebars templating engine, and listen on
 * the correct port.
*/
app.engine('hbs', hbs.express4({partialsDir: __dirname + '/views/partials', defaultLayout: __dirname + '/views/layouts/main.hbs'}));
app.set('view engine', 'hbs');
app.use(bodyParser());
app.use(express_fileuploads());
app.use(express.static('static'));
app.listen(8080, () => {console.log(`=> Listening on port 8080`)});
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
 
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/**
 * Connect to the database.
*/
mongodb.connect(config.mongo_url, (err) => {
    if(err){
        console.log('=> Could not connect to mongodb.');
        throw err;
    }
    else{
        console.log('=> Connected to mongodb ' + config.mongo_url);
    }
});
app.use(express_mongodb(config.mongo_url));

/**
 * The homepage router.
*/
app.use('/', require('./routes/home.js'));

/**
 * Automatically load the routes from the 
 * routes folder.
*/
let files = fs.readdirSync(__dirname + '/routes');
for(let file in files){
    file = files[file]; 
    
    // Remove the .js from the end of the route name.
    let route_name = file.replace('.js', '');
    
    // Load the route into express.
    app.use(`/${route_name}`, require(`./routes/${file}`));
}