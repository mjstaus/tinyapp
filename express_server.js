const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// Body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req object under the key body.//
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require("bcrypt");

///// HELPER FUNCTIONS /////
////////////////////////////
const { getUserByEmail } = require("./helpers")

//Generate random string of x number alphanumeric characters
const generateRandomString = (x) => {
  return Math.random().toString(36).slice(x + 1);
};

//Searches for urls associated with inputed user_id
const urlsForUser = (id) => {
  const userURLS = {};
  for (let object in urlDatabase) {
    if (urlDatabase[object].userID === id) {
      userURLS[object] = urlDatabase[object];
    }
  } return userURLS;
};

///// OBJECTS /////
//////////////////
const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "user1"},
  "9sm5xK": {longURL: "http://www.google.com", userID: ""}
};
class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}
const users = {};

///// ROUTES /////
/////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: userURLs,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("users_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email address and/or password");
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
  res.render("user_registration", templateVars);
});

app.post("/registration", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res.status(400).send("Please enter a valid email address and password");
  }
  if (getUserByEmail(users, email)) {
    res.status(400).send(`Email address ${email} already in use`);
  }
  const id = generateRandomString(6);
  users[id] = new User(id, email, hashedPassword);
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!🦄`);
});
