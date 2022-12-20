const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const bcrypt = require("bcryptjs");
const saltRounds = 8;
var im = require("imagemagick");

function checkUserCredentials(username, email) {
  if (!username || !email) {
    throw "Error: You must provide a username and email to create a new user.";
  } else if (typeof username != "string" || typeof email != "string") {
    throw "Error: Username, and email must be valid strings.";
  } else if (username.trim().length == 0 || email.trim().length == 0) {
    throw "Error: Username, and email must not be empty.";
  }
}

function checkUserCredentialsLogin(email) {
  if (!email) {
    throw "Error: You must provide a email to create an account.";
  } else if (typeof email != "string") {
    throw "Error: Username must be valid strings.";
  } else if (email.trim().length == 0) {
    throw "Error: Username must be not be empty.";
  }
}

async function createUser(username, email, googleAuth) {
  username = username.toLowerCase().trim();
  email = email.toLowerCase().trim();
  console.log("poopy fart", googleAuth);

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
    googleAuth: googleAuth,
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

async function getUser(email) {
  email = email.toLowerCase();
  checkUserCredentialsLogin(email);

  const usersCollection = await users();

  const userExists = await usersCollection.findOne({
    email: email,
  });

  if (!userExists) {
    throw "Error User credentials not found.";
  }
  return userExists;
}

async function updateProfilePic(file, email, fileName) {
  if (arguments.length != 3) throw "updateProfilePic(file, email, fileName)";
  console.log(file);
  if (typeof email != "string" || typeof fileName != "string")
    throw "Non-valid input(s) detected";
  email = email.trim().toLowerCase();
  fileName = fileName.trim();
  if (email.length == 0 || fileName.length == 0)
    throw "Empty string input(s) detected";

  const usersCollection = await users();
  const userExists = await usersCollection.findOne({
    email: email,
  });
  //TODO make sure the image is being properly stored in mongo then try rendering it via a get call
  //You can test this by uploading an image to the account page, then the oputput  (resized by image magick) will appear in the uploads folder in the backend
  //TY Bemin :)
  let oldProfilePic = userExists.file;
  if (oldProfilePic == file) return "No changes needed!";
  const newProfilePic = {
    profilePic: file,
  };

  const updatedData = await usersCollection.updateOne(
    { email: email },
    { $set: newProfilePic }
  );
  //TODO make it so uploading the same image doesn't error out
  /*if (updatedData.modifiedCount == 0) {
    throw "Error: User update was unsuccessful.";
  }*/
}

async function updateStats(email, game_wpm, game_won) {
  if (arguments.length != 3) throw "updateStats(email, game_wpm, game_won)";
  if (
    typeof email != "string" ||
    typeof game_wpm != "number" ||
    typeof game_won != "boolean"
  )
    throw "Non-string and/or non-number input(s) detected.";
  if (email.length == 0) throw "Detected empty string input";
  const usersCollection = await users();
  const userExists = await usersCollection.findOne({
    email: email,
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
    { email: email },
    { $set: newStats }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: User update was unsuccessful.";
  }
}

async function getTopUsers() {
  const usersCollection = await users();
  let usersList = await usersCollection.find({}).sort({ wpm: -1 }).toArray();

  if (usersList.length === 0) {
    throw "Error: No users found in database.";
  }
  console.log("poop", usersList);

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

  return topUsers;
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

function resizeImage(imagePath, width, height) {
  im.convert(
    [imagePath, "-resize", `${width}x${height}`, imagePath],
    function (err, stdout) {
      if (err) throw err;
      console.log("stdout:", stdout);
    }
  );
}

module.exports = {
  getUser,
  createUser,
  checkUser,
  updateProfilePic,
  updateStats,
  getTopUsers,
  deleteUser,
  resizeImage,
};
