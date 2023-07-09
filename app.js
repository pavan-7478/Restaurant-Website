require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const findOrCreate = require("mongoose-findorcreate");
const { nextTick } = require("process");
 
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);
 
app.use(passport.initialize());
app.use(passport.session());
 
mongoose.set("strictQuery", true);
 
mongoose.connect(
  "mongodb://127.0.0.1:27017/userDB",
  {
    useNewUrlParser: true,
  },
  console.log("connected to mongoDB")
);
 
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String  
});
 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
 
const User = new mongoose.model("User", userSchema);
 
passport.use(User.createStrategy());
 
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});
 
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
 

app.get("/", function (req, res) {
  res.render("home");
});
 

 
app.get("/login", function (req, res) {
  res.render("login");
});
 
app.get("/register", function (req, res) {
  res.render("register");
});
 
app.get("/secrets", function (req, res) {
 res.render("secrets");
  
});

app.get("/about", function(req,res){
res.render("about");
});

app.get("/bookatable", function(req,res){
  res.render("bookatable");
});

app.get("/submit", function(req,res){
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.render("/login");
  }
});
 
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return nextTick(err);
    }
    res.redirect("/");
  });
});
app.get("/thankyou", function(req,res){
  res.render("thankyou");
});
app.get("/menu", function(req,res){
res.render("menu");
});
app.get("/shop", function(req,res){
res.render("shop");
});
app.get("/tnc", function(req,res){
res.render("tnc");
});
 
app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});
 
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

  app.post("/submit", function (req, res) {
    console.log(req.user);
    User.findById(req.user)
      .then(foundUser => {
        if (foundUser) {
          foundUser.secret = req.body.secret;
          return foundUser.save();
        }
        return null;
      })
      .then(() => {
        res.redirect("/secrets");
      })
      .catch(err => {
        console.log(err);
      });
});

 app.post("/bookatable", function(req,res){
const user=new User({
  username:req.body.name,
  phone:req.body.phoneno,
});
res.redirect("/thankyou");
 });
app.listen("3000", function () {
  console.log("Connected at port 3000");
});
 