const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const {getUserByEmail} = require('./helper.js');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use('/public/images', express.static('public/images'));
app.use(cookieSession({
  name: 'session',
  keys: ['user'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// security
const password = "1234";
const hashedPassword = bcrypt.hashSync(password, 10);

// function definitions
const generateRandomString = function() {
  let text = "";
  const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
  }
  return text;
};


const findByuserID = function(userID) {
  const urls = {};
  for (let keyOfURL in urlDatabase) {
    if (urlDatabase[keyOfURL].userID === userID) {
      urls[keyOfURL] = urlDatabase[keyOfURL].longURL;
    }
  }
  return urls;
};

//object definitions
//example of what the url database is supposed to look like 
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'userRandomID'
  },
};

// the users object
let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// GET routes
// redirecting the user to the long URL when they click the short URL
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
    return;
  }
  res.send("This tiny url does not exist");
});

// the page where the user can create a new tinu URL. If they are not logged in they get redirected to the login page
app.get("/urls/new", (req, res) => {
  let myUsername = req.session.user_id;
  if (!myUsername) {
    res.redirect('/login');
    return;
  }
  const templateVars = {user: {email: users[myUsername].email}};
  res.render("urls_new", templateVars);
});

// the page where the user can see their tiny URL and can edit it. A few permissions have been added to this page, e.g. the user sees different error messages depending on if they are trying to view a tiny URL that isn't theirs, they are not logged in or the tinyURL doesn't exist
app.get("/urls/:id", (req, res) => {
  let myLongURL = urlDatabase[req.params.id];
  const myUsername = req.session.user_id;
  const urls = findByuserID(myUsername);
  const userKeys = Object.keys(urls);
  const checkKeys = [];
  if (!myLongURL) {
    res.send("this shortURL does not exist!");
    return;
  }
  if (!myUsername) {
    res.send("You are not logged in");
    return;
  }
  for (let keys of userKeys) {
    if (keys === req.params.id) {
      checkKeys.push(keys);
    }
  }
  if (checkKeys.length === 0) {
    res.send("you don't own this ID!");
    return;
  }
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.session.user_id};
  res.render("urls_show", templateVars);
});

// this is the main page. I added an example tiny URL for every user just so that they can easily see what the purpose of the website is. This website also has a permission installed which redirects to an error page if the user is not logged in.
app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  if (!userID || !users[userID]) {
    // const templateVars = {urls: urlDatabase, user: userID};
    res.send('please log in or register first!');
    return;
  }
  let urls = findByuserID(userID);
  const templateVars = {urls: urls, user: user};
  res.render("urls_index", templateVars);
});

// the login page, redirects to the main page if the user was already logged in
app.get("/login", (req, res) => {
  req.session.user_id = "user";
  if (users[req.session.user_id]) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: undefined};
  res.render("login", templateVars);
});

// the register page, redirects to the main page if the user was already logged in
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: undefined};
  req.session = null;
  res.render("registration", templateVars);
});

// -------------------------------------------------

// POST ROUTES
// when a user deletes a short URL, it gets deleted from the url Database and the user is redirected to the main /urls page
app.post("/urls/:id/delete", (req, res) => {
  const deleted = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// when a user edits a short URL, the user is redirected to the main /urls page + see next POST route
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

// when a user edits a short URL, it gets updated in the urlDatabase here
app.post("/urls/:id/update", (req, res) => {
  const edited = req.body.updatedURL;
  urlDatabase[req.params.id].longURL = edited;
  res.redirect(`/urls`);
});

// the login page has a few permissions installed in case something goes wrong, like not typing in a name AND a password, the user not being registered yet or the credentials being incorrect. In those cases the user will be redirected to a html error page.
app.post("/login", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;
  const output = getUserByEmail(newEmail, users);
  if (newEmail === "" || newPass === "") {
    res.status(400);
    res.send("Please enter an email address AND a password");
    return;
  }
  if (output) {
    if (bcrypt.compareSync(newPass, output.password)) {
      req.session.user_id = "user".
        res.redirect('/urls');
      return;
    }
    res.status(403).send("Wrong credentials");
  }
  res.status(403).send("User not found");
});

// the registering process includes a hashing technique and some permission settings, like when someone tries to register a username that's already in our database or when one of the fields was left empty (no password or username)
app.post("/register", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;
  if (newPass !== "") {
    newPass = bcrypt.hashSync(req.body.password, 10);
  }
  if (newEmail === "" || newPass === "") {
    res.status(400);
    res.send("Please enter an email address AND a password");
    return;
  }
  if (getUserByEmail(newEmail, users)) {
    res.status(400).send("This email address is already in use!");
    return;
  }
  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: newEmail,
    password: newPass
  };
  req.session.user_id = randomID;
  res.redirect('/urls');
});

// the logout button will reset the cookies and redirect the user to /urls which will then redirect to the html error page saying the user is not logged in
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// adds a new longURL and shortURL to our urlDatabase and shows it on the main page
app.post("/urls", (req, res) => {
  let myUsername = req.session.user_id;
  if (!myUsername) {
    res.send('Please log in to create a tiny URL');
    return;
  }
  let newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userID: myUsername
  };
  res.redirect(`/urls/${newKey}`);
});


// start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});