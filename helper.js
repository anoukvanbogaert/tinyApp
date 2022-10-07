const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (email === users[userID].email) {
      let user = users[userID];
      return user
    }
  }
};

module.exports = {
  getUserByEmail
}