const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
let { ObjectId } = require('mongodb');

router.post('/', async (req, res) => {           
    const getUserData = req.body;
    let username = getUserData.username;
    let password = getUserData.password;
    let email = getUserData.email;
    if (!username || !password || !email) {
        res.status(400).json({error: "Error: You must provide a username, password, and email to create a new user."});
      } else if (
        typeof username != "string" ||
        typeof password != "string" ||
        typeof email != "string"
      ) {
        res.status(400).json({error: "Error: Username, password, and email must be valid strings."});
      } else if (
        username.trim().length == 0 ||
        password.trim().length == 0 ||
        email.trim().length == 0
      ) {
        res.status(400).json({error: "Error: Username, password, and email must not be empty."});
      }
    try {
        newUser = await usersData.create(username,password,email);
        res.json(newUser);
    } catch (e) {
        res.status(400).json({error: e });
    }
});

router.patch('/profilePic', async (req, res) => {
//TODO check if user is currently signed in
    console.log("found it");
    const getUserData = req.body;
    if (!getUserData.username && !getUserData.profilePic) {
        res.status(400).json({error: 'You must supply a username and profile picture'});
        return;
    }
    let username = getUserData.username;
    let password = getUserData.password;
    let email = getUserData.email;
    if (!username || !password || !email) {
        res.status(400).json({error: "Error: You must provide a username, password, and email to create a new user."});
    } else if (
        typeof username != "string" ||
        typeof password != "string" ||
        typeof email != "string"
    ) {
        res.status(400).json({error: "Error: Username, password, and email must be valid strings."});
    } else if (
        username.trim().length == 0 ||
        password.trim().length == 0 ||
        email.trim().length == 0
    ) {
      res.status(400).json({error: "Error: Username, password, and email must not be empty."});
    }
    try{
        updatedUser = await usersData.update(username, password, email);
        res.json(updatedUser);
    } catch (e){
        res.status(400).json({error: e});
    }
});

module.exports = router;