const express = require('express');
const app = express();
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use('/public/images', express.static('public/images'));
app.use(cookieParser())

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let text = ""
  let possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    text += possibilities.charAt(Math.floor(Math.random() * possibilities.length))
  }
  return text
}

const findUserEmail = function(email, users) {
  for (let userID in users) {
    if (email === users[userID].email) {
      return users[userID]
    }
  }
}

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

app.post("/login", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;

  if (newEmail === "" || newPass === "") {
    res.status(400)
    res.send("Please enter an email address AND a password")
    return
  }

  const output = findUserEmail(newEmail, users)

  if (output) {
    if (newPass === output.password) {
      res.cookie('user_id', output.id).redirect('/urls');
      return
    }
    res.status(403).send("Wrong credentials")
  }
  res.status(403).send("User not found")
});

app.get("/login", (req, res) => {
  const templateVars = {user: undefined};
  res.render("login", templateVars);
});


app.post("/register", (req, res) => {
  let newEmail = req.body.email;
  let newPass = req.body.password;

  if (newEmail === "" || newPass === "") {
    res.status(400)
    res.send("Please enter an email address AND a password")
    return
  }

  if (findUserEmail(newEmail, users)) {
    res.status(400).send("This email address is already in use!")
    return
  }

  let randomID = generateRandomString();

  users[randomID] = {
    id: randomID,
    email: newEmail,
    password: newPass
  };

  res.cookie('user_id', randomID).redirect('/urls');

});

app.get("/register", (req, res) => {
  const templateVars = {user: undefined};
  res.render("registration", templateVars);
  res.clearCookie["user_id"]
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
})

app.post("/urls", (req, res) => {
  console.log("this is the req body", req.body); // Log the POST request body to the console
  let newKey = generateRandomString()
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("This item has been deleted!");
  const deleted = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`)
})

app.post("/urls/:id/edit", (req, res) => {
  console.log("You've been redirected!");
  const id = req.params.id
  res.redirect(`/urls/${id}`)
})

app.post("/urls/:id/update", (req, res) => {
  const edited = req.body.updatedURL;
  urlDatabase[req.params.id] = edited
  res.redirect(`/urls`)
})

app.get("/urls", (req, res) => {
  let myUsername = req.cookies["user_id"]
  if (!myUsername) {
    const templateVars = {urls: urlDatabase, user: myUsername}
    res.render("urls_index", templateVars);
    return;
  }
  //use myUsername to find user in users object
  //with the user, grab the email inside that user object
  let user = users[myUsername]
  const templateVars = {urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);   // urls_index needs to be an .ejs file in the views folder
});


app.get("/u/:id", (req, res) => {
  // const templateVars = {username: req.cookies["username"]};
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n"); // getting hello, responding with hello world 
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});