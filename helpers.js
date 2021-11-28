const getUserByEmail = (database, email) => {
  for (let data in database) {
    if (email === database[data]["email"]) return database[data];
  } return undefined;
};

module.exports = { getUserByEmail }