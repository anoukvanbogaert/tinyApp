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

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.post("/login", (req, res) => {
  let username = req.body.username
  console.log(username)
  res.cookie('username', username)
  res.redirect('/urls')
});

app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
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
  let myUsername = req.cookies["username"]
  const templateVars = {urls: urlDatabase, username: myUsername};
  res.render("urls_index", templateVars);   // urls_index needs to be an .ejs file in the views folder
});


app.get("/u/:id", (req, res) => {
  // const templateVars = {username: req.cookies["username"]};
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  // const templateVars = {username: req.cookies["username"]};
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n"); // getting hello, responding with hello world 
// });




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});