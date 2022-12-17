const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.users;
let { ObjectId } = require("mongodb");

router.get("/:username", async (req, res) => {
  if (!req.params.username) {
    res.status(400).json({error: 'username needed' });
    return;
  }
  let username = req.params.username;
  if (!username) {
    res.status(400).json({
      error:
        "Error: You must provide a username.",
    });
    return;
  } else if (typeof username != "string") {
    res.status(400).json({
      error: "Error: Username must be valid strings.",
    });
    return;
  } else if (username.trim().length == 0) {
    res.status(400).json({
      error: "Error: Username must not be empty.",
    });
    return;
  }
  try {
    console.log(username);
    user = await usersData.getUser(username);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

router.post("/", async (req, res) => {
  const getUserData = req.body;
  console.log(req.body);
  let username = getUserData.username;
  let email = getUserData.email;
  if (!username || !email) {
    res.status(400).json({
      error:
        "Error: You must provide a username, and email to create a new user.",
    });
    return;
  } else if (typeof username != "string" || typeof email != "string") {
    res.status(400).json({
      error: "Error: Username, and email must be valid strings.",
    });
    return;
  } else if (username.trim().length == 0 || email.trim().length == 0) {
    res.status(400).json({
      error: "Error: Username, and email must not be empty.",
    });
    return;
  }
  try {
    newUser = await usersData.createUser(username, email);
    res.json(newUser);
  } catch (e) {
    console.log(e);
    // res.status(400).json({ error: e });
  }
});

router.patch("/profilePic", async (req, res) => {
  //TODO change from checking email to username
  console.log("found it");
  const getUserData = req.body;
  if (!getUserData.email || !getUserData.profilePic) {
    res
      .status(400)
      .json({ error: "You must supply a email and profile picture" });
    return;
  }
  let email = getUserData.email;
  let profilePic = getUserData.profilePic;
  console.log(profilePic);
  if (!email || !profilePic) {
    res.status(400).json({
      error:
        "Error: You must provide a email and profilePic.",
    });
    return;
  } else if (
    typeof email != "string" || typeof profilePic != "string"
  ) {
    res.status(400).json({
      error: "Error: Email and profilePic must be valid string.",
    });
    return;
  } else if (
    email.trim().length == 0 || profilePic.trim().length == 0
  ) {
    res.status(400).json({
      error: "Error: Email and profilePic must not be empty.",
    });
    return;
  }
  try {
    updatedUser = await usersData.updateProfilePic(email, profilePic);
    res.json(updatedUser);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
