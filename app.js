if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require('express-mongo-sanitize');

const MongoDBStore = require("connect-mongo")(session);

const users = require("./routes/users")
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl).then(() => {
console.log("mongoDB connection open")
})
.catch (err => {
console.log("Error", err)
})
const app = express();

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "secret";

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(error){
    console.log("Sore error", error)
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})


app.use("/", users);
app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)

app.get("/", (req,res)=>{
    res.render("home");
});


app.all("*", (req, res, next)=>{
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
})