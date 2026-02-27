if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsmate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');



const listings = require('./Routes/listing.js');
const reviews = require('./Routes/review.js');
const userRouter = require('./Routes/user.js');



const dburl = process.env.ATLASDB_URL;

main()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dburl);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
    console.log("Session store error", e);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

/*app.get('/', (req, res) => {
    res.send('Hello World');
});*/



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());// initialize passport
app.use(passport.session());// use passport to manage sessions


passport.use(new LocalStrategy(User.authenticate()));// use local strategy for authentication
passport.serializeUser(User.serializeUser());// how to store user in session
passport.deserializeUser(User.deserializeUser());// how to get user from session

app.use((req, res, next) => {// middleware to set flash messages in res.locals
    res.locals.success = req.flash('success');
    console.log(res.locals.success);
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user||null;
    next();
});

/*app.get('/demouser', async (req, res) => {
    let user = new User({
        email: "student@example.com",
        username: "student"
    });
    const registeredUser = await User.register(user, 'mypassword');
    res.send(registeredUser);
});*/


app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);
app.use('/', userRouter);

/*app.get('/newListing', async (req, res) => {
    let newListing = new Listing({
        title: 'Sample Listing',
        description: 'This is a sample listing description.',  
        price: 100,
        location: 'Sample Location',
        country: 'Sample Country'
    });

    await newListing.save();
    console.log('New listing created');
    res.send('New listing created');  
});*/



app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { statuscode = 500, message = 'Something went wrong' } = err;
    res.status(statuscode).render("error.ejs", {message});
    //res.status(statuscode).send(message);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});