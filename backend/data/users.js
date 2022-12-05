const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 8;

async function createUser(username, password, email) {
  username = username.toLowerCase().trim();
  password = password.trim();
  email = email.toLowerCase().trim();

  const usersCollection = await users();

  const duplicateUser = await usersCollection.findOne({
    username: username,
  });

  if (duplicateUser) {
    throw "Error: An account already exists for this username.";
  }

  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    username: username,
    password: hash,
    email: email,
    wpm: 0,
    games_played: 0,
    games_won: 0,
    admin: false,
  };

  const insertInfo = await usersCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) throw "Error: could not add user.";

  return newUser;
}

//Check if user already exists for login
async function checkUser(username, password) {
  checkLoginCredentials(username, password);

  username = username.toLowerCase();

  const usersCollection = await users();

  const userExists = await usersCollection.findOne({
    username: username,
  });

  if (!userExists) {
    throw "Error User credentials not found.";
  }

  const compare = await bcrypt.compare(password, userExists.password);

  if (!compare) {
    throw "Error User credentials not found.";
  } else {
    return userExists;
  }
}

module.exports = {
  createUser,
  checkUser,
};
