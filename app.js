const path = require('path');
const express = require('express'); //basic express server
const mongoose = require('mongoose'); //mongoose for mongodb
const dotenv = require('dotenv');
const morgan = require('morgan'); //logging middleware
const exphbs = require('express-handlebars').engine //handlebars templating engine
const methodOverride = require('method-override'); //method override middleware
const passport = require('passport'); //passport authentication middleware
const session = require('express-session'); //session middleware
const MongoStore = require('connect-mongo')(session); //session storage middleware
const connectDB = require('./config/db');


//load config
dotenv.config({
    path: './config/config.env'
})

//passport config
require('./config/passport')(passport);

//connect to mongoDB
connectDB()

const app = express()

//body parser middle ware
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json());

//method override middleware
app.use(methodOverride((req, res)=>{
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) //dev is the format of the logs
}

//handlebar Helpers
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
} = require('./helpers/hbs');

//handlebars templating engine
app.engine('.hbs', exphbs({
    helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
    },
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

//sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    //cookie: { secure: true }
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`))
