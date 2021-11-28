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

const emailLookup = (object, email) => { 
  for (property in object) {
    if (email === object[property]["email"]) return object[property];
  }return undefined;
}

//Searches for urls associated with inputed user_id
const urlsForUser = (id) => {
  const userURLS = {}
  for(object in urlDatabase){
    if(urlDatabase[object].userID === id){
      userURLS[object] = urlDatabase[object]
    }
  }return userURLS
}

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
const users = {
  user1: {
    id: "user1",
    email: "mjstaus@gmail.com",
    password: "password",
  }
}

///// ROUTES /////
/////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.cookies["user_id"])
  const templateVars = {
    urls: userURLs,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  console.log(urlDatabase)
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if(!users[req.cookies["user_id"]]){
    res.redirect("/login")
  };
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = req.body.longURL
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("users_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(users, email)
  if(!user || user.password !== password){
    res.status(403).send("Invalid email address and/or password")
  }
  res.cookie("user_id", user.id).redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.get("/registration", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("user_registration", templateVars);
});

app.post("/registration", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  console.log('users:', users)
  console.log("email:", email)
  console.log("email lookup:", emailLookup(users, email))
  if(!email || !password){
    res.status(400).send("Please enter a valid email address and password")
  }
  if(emailLookup(users, email)){
    res.status(400).send(`Email address ${email} already in use`)
  }
  const id = generateRandomString(6);
  users[id] = new User(id, email, password);
  console.log(users)
  res.cookie("user_id", id).redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!🦄`);
});
