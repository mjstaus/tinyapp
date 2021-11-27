const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// Body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req object under the key body.//
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


///// HELPER FUNCTIONS /////
////////////////////////////
//Generate random string of x number alphanumeric characters
const generateRandomString = (x) => {
  return Math.random().toString(36).slice(x + 1);
};

const emailLookup = (object, email) => { //Searches for email in object - returns true if email is present
  for (property in object) {
    if (email === object[property]["email"]) return true;
    return false;
  }
}

///// OBJECTS /////
//////////////////
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}
const users = {}

///// ROUTES /////
/////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username).redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.get("/registration", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("user_registration", templateVars);
});

app.post("/registration", (req, res) => {
  if(!req.body.email || !req.body.password){
    res.status(400).send("Please enter a valid username and password")
  }
  if(emailLookup(users, req.body.email)){
    res.status(400).send(`Email address ${req.body.email} already in use`)
  }
  const id = generateRandomString(6);
  users[id] = new User(id, req.body.email, req.body.password);
  console.log(users)
  res.cookie("user_id", id).redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!🦄`);
});
