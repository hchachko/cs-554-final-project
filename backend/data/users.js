const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 8;

function checkUserCredentials(username, email) {
  if (!username || !email) {
    throw "Error: You must provide a username and email to create a new user.";
  } else if (typeof username != "string" || typeof email != "string") {
    throw "Error: Username, and email must be valid strings.";
  } else if (username.trim().length == 0 || email.trim().length == 0) {
    throw "Error: Username, and email must not be empty.";
  }
}

function checkUserCredentialsLogin(username) {
  if (!username) {
    throw "Error: You must provide a username to create an account.";
  } else if (typeof username != "string") {
    throw "Error: Username must be valid strings.";
  } else if (username.trim().length == 0) {
    throw "Error: Username must be not be empty.";
  }
}

async function createUser(username, email) {
  username = username.toLowerCase().trim();
  email = email.toLowerCase().trim();

  checkUserCredentials(username, email);

  console.log("POP");
  const usersCollection = await users();

  const duplicateUser = await usersCollection.findOne({
    email: email,
  });

  if (duplicateUser) {
    throw "Error: An account already exists for this email.";
  }

  let newUser = {
    username: username,
    email: email,
    profilePic: null,
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

async function getUser(username) {
  username = username.toLowerCase();
  checkUserCredentialsLogin(username);

  const usersCollection = await users();

  const userExists = await usersCollection.findOne({
    username: username,
  });

  if (!userExists) {
    throw "Error User credentials not found.";
  }
  return userExists;
}

async function updateProfilePic(email, profilePic) {
  if (arguments.length != 2) throw "updateProfilePic(email, profilePic)";
  if (typeof email != "string" || typeof profilePic != "string")
    throw "Non-string input(s) detected";
  email = email.trim().toLowerCase();
  profilePic = profilePic.trim();
  if (email.length == 0 || profilePic.length == 0)
    throw "Empty string input(s) detected";

  const usersCollection = await users();
  const userExists = await usersCollection.findOne({
    email: email,
  });

  let oldProfilePic = userExists.profilePic;

  const newProfilePic = {
    profilePic: profilePic,
  };

  const updatedData = await usersCollection.updateOne(
    { email: email },
    { $set: newProfilePic }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: User update was unsuccessful.";
  }
}

async function updateStats(username, game_wpm, game_won) {
  if (arguments.length != 3) throw "updateStats(username, game_wpm, game_won)";
  if (
    typeof username != "string" ||
    typeof game_wpm != "number" ||
    typeof game_won != "number"
  )
    throw "Non-string and/or non-number input(s) detected.";
  updateStats(username, game_wpm, game_won);
  username = username.trim().toLowerCase();
  if (username.length == 0) throw "Detected empty string input";
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
    throw "Error: User update was unsuccessful.";
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
  getUser,
  createUser,
  checkUser,
  updateProfilePic,
  updateStats,
  getTopUsers,
  deleteUser,
};
