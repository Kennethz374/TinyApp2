const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//main page that shows all the short urls and long urls (like the urlDB)
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase }; //pass down the DB to ejs 
  res.render("urls_index", templateVars);
});
//2nd Route
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars); //pass down the info short and original urls to ejs
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});