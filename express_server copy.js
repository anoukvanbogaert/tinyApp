const express = require('express');
const app = express();
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use('/public/images', express.static('public/images'));
app.use(cookieParser())


// function definitions
const generateRandomString = function() {
  let text = ""
  const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < 6; i++) {
    text += possibilities.charAt(Math.floor(Math.random() * possibilities.length))
  }

  return text
}


const findURLbyuserID = function(userID) {
  const urls = {}
  for (let keyOfURL in urlDatabase) {

    if (urlDatabase[keyOfURL].userID === userID) {
      urls[keyOfURL] = urlDatabase[keyOfURL].longURL
    }

  }
  return urls
}


const findUserEmail = function(email, users) {
  for (let userID in users) {

    if (email === users[userID].email) {
      return users[userID];
    }

  }
};


//object definitions
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

// Post definitions
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
  urlDatabase[req.params.id].longURL = edited
  res.redirect(`/urls`)
})


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


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
})


app.post("/urls", (req, res) => {
  console.log("this is the req body", req.body); // Log the POST request body to the console
  let myUsername = req.cookies["user_id"]
  if (!myUsername) {
    res.send('Please log in to create a tiny URL')
    return
  }

  let newKey = generateRandomString()
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userID: myUsername
  };
  res.redirect(`/urls/${newKey}`);
});


// Get definitions


app.get("/u/:id", (req, res) => {
  console.log(req.params.id)
  // const templateVars = {username: req.cookies["username"]};
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
    return
  }
  res.send("This tiny url does not exist")
});

app.get("/urls/new", (req, res) => {
  let myUsername = req.cookies["user_id"]
  if (!myUsername) {
    res.redirect('/login')
    return
  }
  const templateVars = {user: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let myLongURL = urlDatabase[req.params.id];
  if (myLongURL) {
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.cookies["user_id"]};
    res.render("urls_show", templateVars);
  }
  res.send("this shortURL does not exist!")
});

app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"]

  if (!userID) {
    const templateVars = {urls: urlDatabase, user: userID}
    res.send('please log in or register first!');
    return;
  }


  //use myUsername to find user in users object
  //with the user, grab the email inside that user object
  let user = users[userID]

  findURLbyuserID(userID)

  console.log(urls)

  const templateVars = {urls: urls, user: user};
  res.render("urls_index", templateVars);   // urls_index needs to be an .ejs file in the views folder
});

app.get("/login", (req, res) => {
  let myUsername = req.cookies["user_id"]
  if (myUsername) {
    res.redirect('/urls')
    return
  }
  const templateVars = {user: undefined};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let myUsername = req.cookies["user_id"]
  if (myUsername) {
    res.redirect('/urls')
    return
  }
  const templateVars = {user: undefined};
  res.render("registration", templateVars).clearCookie["user_id"]
});

// start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});