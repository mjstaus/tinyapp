//Retrieve user object from database by email
const getUserByEmail = (database, email) => {
  for (let data in database) {
    if (email === database[data]["email"]) return database[data];
  } return undefined;
};

//Generate random string of x number alphanumeric characters
const generateRandomString = (x) => {
  return Math.random().toString(36).slice(x + 1);
};

//Searches for urls associated with inputed user_id
const getUrlsByUser = (database, id) => {
  const userURLS = {};
  for (let object in database) {
    if (database[object].userID === id) {
      userURLS[object] = database[object];
    }
  } return userURLS;
};

module.exports = { getUserByEmail, generateRandomString, getUrlsByUser};