const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

const {
  getUserByEmail,
  generateRandomString,
  getUrlsByUser,
} = require("./helpers");

const { AppError } = require("./classes/AppError");
const { User } = require("./classes/User");

///// DATABASES /////
const urlDatabase = {};
const users = {};

//////// MIDDLEWARE ////////
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(methodOverride("_method"));

///// ROUTES /////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userURLs = getUrlsByUser(urlDatabase, req.session.user_id);
  const templateVars = {
    urls: userURLs,
    user: users[req.session.user_id],
  };
  res.render("urls/urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    throw new AppError(403, "Please login or sign up to create new URL")
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls/urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls/urls_show", templateVars);
});

app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = req.session.user_id 
  if(!user){
    throw new AppError(403, "Please login to update your URL")
  }
  if (user !== urlDatabase[shortURL].userID) {
    throw new AppError(401, "This URL does not belong to you! Update your own URLs!")
  } 
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
  
});

app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session.user_id 
  if (user !== urlDatabase[shortURL].userID) {
    throw new AppError(401, "This URL does not belong to you! Delete your own URLs!")
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("users/users_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError(403, "Invalid email address and/or password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/registration", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("users/user_registration", templateVars);
});

app.post("/registration", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    throw new AppError(400, "Please enter a valid email address and password");
  }
  if (getUserByEmail(users, email)) {
    throw new AppError(400, `Email address ${email} already in use`);
  }
  const id = generateRandomString(6);
  users[id] = new User(id, email, hashedPassword);
  req.session.user_id = id;
  res.redirect("/urls");
});

app.all("*", (req, res, next) => {
  next(new AppError(404, "Sorry, this page isn't available :("));
});

///// ERROR HANDLER MIDDLEWARE /////
app.use((err, req, res, next) => {
  const { status = 500, message = "Uh oh! Something went wrong" } = err;
  const templateVars = {
    user: users[req.session.user_id],
    status: status,
    message: message,
  };
  console.log(status);
  console.log(message);
  res.status(status).render("error", templateVars);
});

///// APP LISTENING /////
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!🦄`);
});
