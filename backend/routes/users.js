const express = require("express");
const router = express.Router();
const data = require("../data");
const usersData = data.users;
let { ObjectId } = require("mongodb");

router.get("/leaderboard", async (req, res) => {
  try {
    let leaderboard = await usersData.getTopUsers();
    //console.log("FARTER", leaderboard);
    res.json(leaderboard);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

router.get("/:email", async (req, res) => {
  //console.log("gizzard");
  //console.log(req.params);
  if (!req.params.email) {
    res.status(400).json({ error: "email needed" });
    return;
  }
  let email = req.params.email;
  if (!email) {
    res.status(400).json({
      error: "Error: You must provide an email.",
    });
    return;
  } else if (typeof email != "string") {
    res.status(400).json({
      error: "Error: emails must be valid strings.",
    });
    return;
  } else if (email.trim().length == 0) {
    res.status(400).json({
      error: "Error: email must not be empty.",
    });
    return;
  }
  try {
    //console.log(email);
    user = await usersData.getUser(email);
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
  let googleAuth = getUserData.googleAuth;
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
    newUser = await usersData.createUser(username, email, googleAuth);
    res.json(newUser);
  } catch (e) {
    console.log(e);
    // res.status(400).json({ error: e });
  }
});

router.patch("/userStats", async (req, res) => {
  console.log("it's working!", req.body.email);
  const getUserData = req.body;
  let email = getUserData.email;
  let game_wpm = getUserData.game_wpm;
  let game_won = getUserData.game_won;
  try {
    updatedStats = await usersData.updateStats(email, game_wpm, game_won);
    res.json(updatedStats);
  } catch (e) {
    console.log(e);
  }
});


module.exports = router;
