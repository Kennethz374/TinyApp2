const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//The body-parser library will convert the request body from a Buffer into string that we can read.
//It will then add the data to the req(request) object under the key body.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//for randomID Purpose
const randomstring = require("randomstring");
const cookieParser = require('cookie-parser');//need to be replaced
const cookieSession = require('cookie-session');
app.use(cookieParser());
app.use(cookieSession({
  name: 'userId',
  keys: ['keysssss'],
}));

const bcrypt = require('bcrypt');
const { findIdByEmail } = require("./helpers");
//----------------------------------------Database-------------------------
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    hashedPassword: "123sjdfaidqpwijfaf"
  },
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
//--------------------------matching function find urls that match user ID
const UrlOfId = function(userID, database) {
  let userProfile = {};
  for (let shorUrl in database) {
    if (urlDatabase[shorUrl].userID === userID) {
      userProfile[shorUrl] = urlDatabase[shorUrl];
    }
  }
  return userProfile;
};
//function for generating id
const generateRandomString = function() {
  return randomstring.generate(6);
};
//if email is found return true, else false
const FoundEmail = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};
//---------------------------------------------------------------------------
//1st added route, main page that shows all the short urls and long urls (like the urlDB)
app.get("/urls", (req, res) => {
  let user = null;
  if (users[req.session.userId]) {
    user = users[req.session.userId].email;
  } else {
    res.redirect("/login");//should print message
  }
  let templateVars = { urls: UrlOfId(req.session.userId, urlDatabase), user}; //pass down the DB to ejs
  res.render("urls_index", templateVars);
});

//3rd route added, above second one to prevent js mis-interpret new as a short url; A form to display and create new urls
app.get("/urls/new", (req, res) => {
  let user = null;
  if (users[req.session.userId]) {
    user = users[req.session.userId].email;
  } else {
    res.redirect("/login");//added else statement if cookies is empty means not login, redirect to login
  }
  let templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

//2nd added Route page that displays a single url with its shortened url
app.get("/urls/:shortURL", (req, res) => {
  let user = null;
  if (urlDatabase[req.params.shortURL].userID === req.session.userId) {
    user = users[req.session.userId].email;
    let templateVars = { "shortURL": req.params.shortURL, "longURL": urlDatabase[req.params.shortURL].longURL, user};
    res.render("urls_show", templateVars); //pass down the info short and original urls to ejs
  } else {
    res.send("User needs to login or Url does not belong to User, please create a new one");
  }
});

//4th routes to added to received form submition from urls/new
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); //generate id
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userId}; //add data to database
  res.redirect(`/urls/${shortURL}`);
});
//5th routes added to redirect client to it's long url by clickint on the short url
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;//can't access req.body.longURL
    res.redirect(longURL);
  } else {
    res.send("Sorry!! The shortURL does not exist");
  }
});
//6th route added for delete function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId !== urlDatabase[req.params.shortURL].userID) {
    res.send("You can't delete the shortURL because you are not the owner");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});
//7th route post edit/change ulrDB to id/shortURL and redirect to main page
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId !== urlDatabase[req.params.shortURL].userID) {
    res.send("You can't Edit the shortURL because you are not the owner");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect(`/urls`);
  }
});
//8th route for register new account
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.userId]};
  res.render("urls_registration", templateVars);
});
//9th route to handle submittion of register
app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.send("StatusCode Error 400; Something is Broken"); //could impove by res with ejs
  } if (FoundEmail(req.body.email)) {
    res.send("StatusCode Error 400; You've been registered");//could improve by res with ejs
  } else {
    let Id = generateRandomString();
    users[Id] = {id: Id, email: req.body.email, hashedPassword: bcrypt.hashSync(req.body.password, 10), password: req.body.password};
    req.session.userId = Id;
    res.redirect("/urls");
  }
});
//10th route
app.post("/login", (req, res) => {
  if (FoundEmail(req.body.email) && bcrypt.compareSync(req.body.password, users[findIdByEmail(req.body.email, users)].hashedPassword)) {
    req.session.userId = findIdByEmail(req.body.email, users);
    res.redirect("/urls");
  } else {
    res.send("error code 403, Account does not exist please try again");
  }
});
//11th route
app.post("/logout", (req, res) => {
  req.session.userId = null; //set logout
  res.redirect('/login');
});
//12 routes
app.get("/login", (req, res) => {
  res.render("urls_login", {user: users[req.session.userId]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});