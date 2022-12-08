const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 8;

function checkUserCredentials(username, password, email) {
  if (!username || !password || !email) {
    throw "Error: You must provide a username, password, and email to create a new user.";
  } else if (
    typeof username != "string" ||
    typeof password != "string" ||
    typeof email != "string"
  ) {
    throw "Error: Username, password, and email must be valid strings.";
  } else if (
    username.trim().length == 0 ||
    password.trim().length == 0 ||
    email.trim().length == 0
  ) {
    throw "Error: Username, password, and email must be not be empty.";
  }
}

function checkUserCredentialsLogin(username, password) {
  if (!username || !password) {
    throw "Error: You must provide a username, and password to create an account.";
  } else if (typeof username != "string" || typeof password != "string") {
    throw "Error: Username, and password must be valid strings.";
  } else if (username.trim().length == 0 || password.trim().length == 0) {
    throw "Error: Username, and password must be not be empty.";
  }
}

async function createUser(username, password, email) {
  username = username.toLowerCase().trim();
  password = password.trim();
  email = email.toLowerCase().trim();

  checkUserCredentials(username, password, email);

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

async function checkUser(username, password) {
  username = username.toLowerCase();
  checkUserCredentialsLogin(username, password);

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

async function updateStats(username, game_wpm, game_won) {
  const usersCollection = await users();
  const userExists = await usersCollection.findOne({
    username: username,
  });

  let old_wpm = userExists.wpm;
  let new_wpm =
    (old_wpm * userExists.games_played + game_wpm) /
    (userExists.games_played + 1);

  let games_won_count = userExists.games_won;
  if (game_won === true) {
    games_won_count = games_won_count + 1;
  }

  const newStats = {
    wpm: new_wpm,
    games_played: userExists.games_played + 1,
    games_won: games_won_count,
  };

  const updatedData = await usersCollection.updateOne(
    { username: username },
    { $set: newStats }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: Sweet update was unsuccessful.";
  }
}

async function getTopUsers() {
  const usersCollection = await users();
  let usersList = await usersCollection.find({}).sort({ wpm: -1 }).toArray();

  if ((usersList.length = 0)) {
    throw "Error: No users found in database.";
  }

  let topUsers = [];
  usersList = usersList.slice(0, 50);
  usersList.forEach((element) => {
    topUsers.push({
      username: element.username,
      wpm: element.wpm,
      games_played: element.games_played,
      games_won: element.games_won,
    });
  });

  if (topUsers.length == 0) {
    throw "Error: No users found in database.";
  } else return topUsers;
}

//Delete user given username
async function deleteUser(username) {
  if (!username || typeof username != "string" || username.trim().length == 0) {
    throw "Error: You must provide a valid username to delete a user.";
  }

  const usersCollection = await users();
  const userExists = await usersCollection.findOne({
    username,
  });
  if (!userExists) {
    throw "Error: User does not exist.";
  }

  const deleteInfo = await usersCollection.deleteOne({ username });
  if (deleteInfo.deletedCount === 0) {
    throw "Error: Could not delete user.";
  }

  return true;
}

module.exports = {
  createUser,
  checkUser,
  updateStats,
  getTopUsers,
  deleteUser,
};
