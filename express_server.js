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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//function for generating id
const generateRandomString = function() {
  return randomstring.generate(6);
}

//1st added route, main page that shows all the short urls and long urls (like the urlDB)
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase }; //pass down the DB to ejs 
  res.render("urls_index", templateVars);
});

//3rd route added above second one to prevent js mis-interpret new as a short url; A form to display and create new urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//2nd added Route page that displays a single url with its shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { "shortURL": req.params.shortURL, "longURL": urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars); //pass down the info short and original urls to ejs
});

//4th routes to added to received form submition from urls/new
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); //generate id
  urlDatabase[shortURL] = req.body.longURL; //add data to database
  res.redirect(`/urls/${shortURL}`);
});
//5th routes added to redirect client to it's long url by clickint on the short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];//can't access req.body.longURL
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});