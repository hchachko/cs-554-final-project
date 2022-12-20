const cors = require("cors");
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const { v4 } = require("uuid");
const configRoutes = require("./routes");
const bp = require("body-parser");
app.use(bp.json());
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
app.use(upload.none())
app.use(bp.urlencoded({ extended: true }));
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.post("/profilePic", upload.single('file'), async (req, res) => {
  console.log("Running /profilePic");
  const getUserData = req.body;
  console.log(req.file);
  console.log(getUserData);
  if (!getUserData.email || !getUserData.profilePic) {
    res
      .status(400)
      .json({ error: "You must supply a email and profile picture" });
    return;
  }
  let email = getUserData.email;
  let profilePic = getUserData.profilePic;
  console.log(profilePic);
  if (typeof email != "string" || typeof profilePic != "object") {
    res
      .status(400)
      .json({ error: "Error: Email and profilePic must be valid types." });
    return;
  } else if (email.trim().length == 0) {
    res
      .status(400)
      .json({ error: "Error: Email and profilePic must not be empty." });
    return;
  }
  try {
    updatedUser = await usersData.updateProfilePic(email, profilePic);
    res.json(updatedUser);
  } catch (e) {
    console.log(e);
  }
});

configRoutes(app);

server.listen(4000, () => {
  console.log(`backend listening on *:${4000}`);
});


// public rooms for now, possibly adding private rooms later if it's not too much of a hassle
let rooms = [];
/*  room structure 
    {
        id: The string of a UUID of the room to be used for emitting data to room participants,
        players: [ { name, email, socketId } ]  The names/emails/socketId's of all players in the room, used for displaying names and logic in sending info between clients/posting stat changes to the database
        playerCount: The Number of players currently in the room, used for gauging when rooms are full or not (currently full at 4 players)
        inProgess: Boolean that determines whether current room's game is in progress and whether it's joinable
        quote: String of quote that racers will be typing. Pull random quote from database upon room's creation
        genre: String of genre of race. Genre will determine what set of quotes to grab from in database. Users will select desired genre before searching for game, and if they're the player that creates a room, their genre is applied to the room
    }
*/

io.on("connection", (socket) => {
    console.log("new client connected: ", socket.id);

    socket.on("join_public", (playerName, playerEmail) => {
        if (rooms.length > 0) { // if there are already public rooms, hit this condition to join one 
            let allRoomsFull = true;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].inProgress || rooms[i].playerCount === 4) {
                    continue;
                }
                // if there are any rooms with space, join it
                rooms[i].playerCount++;
                rooms[i].players = [ ...rooms[i].players, {displayName: playerName, email: playerEmail, socketId: socket.id} ];
                socket.join(rooms[i].id);
                socket.emit("joined", rooms[i].players.slice(0, -1), rooms[i].id, rooms[i].quote);
                socket.to(rooms[i].id).emit("new_player_joined", rooms[i].players[rooms[i].players.length - 1], rooms[i].quote);
                io.in(rooms[i].id).emit("countdown", 6); // set lobby countdown back to 6 each time someone joins
                allRoomsFull = false; // set to false to let the next if-statement know that the user got into a room
                break;
            }

            if (allRoomsFull === true) { // all rooms are full, create a new one
                let room = {
                    id: `${v4()}`,
                    players: [ {displayName: playerName, email: playerEmail, socketId: socket.id} ],
                    playerCount: 1,
                    inProgress: false,
                    quote: `A day may come, when the courage of men fails, when we forsake our friends and break all bonds of Fellowship, but it is not this day!`
                };
                rooms.push(room);
                socket.join(room.id);
                socket.emit("joined", [], room.id, room.quote);
                socket.emit("countdown", 6); // seconds
            }
        }
        else { // create new room if there aren't any to join
            let room = {
                id: `${v4()}`,
                players: [ {displayName: playerName, email: playerEmail, socketId: socket.id} ],
                playerCount: 1,
                inProgress: false,
                quote: `A day may come, when the courage of men fails, when we forsake our friends and break all bonds of Fellowship, but it is not this day!`
            };
            rooms.push(room);
            socket.join(room.id);
            socket.emit("joined", [], room.id, room.quote);
            socket.emit("countdown", 6); // seconds
        }
        console.log("Rooms: ");
        console.log(rooms);
    });

    // when a public game starts, this is called so that more players aren't able to queue into the room
    socket.on("game_start", (roomId) => {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id === roomId && rooms[i].inProgress === false) {
                rooms[i].inProgress = true;
            }
        }
    });

    // hits whenever a player makes a successful input - relays the input back to all other clients
    socket.on("new_input", (playerEmail, room, wordLength) => {
        socket.to(room).emit("opponent_input", playerEmail, wordLength);
    });

    // when a client finishes the race, this is called to relay that client's name back to the entire room which lets each client who came in what place by checking the order of the players' names sent to the client
    socket.on("game_finish", (playerEmail, roomId) => {
        io.to(roomId).emit("race_place", playerEmail);
    });

  socket.on("send_wpm", (playerEmail, room, wpm) => {
    socket.to(room).emit("receive_wpm", playerEmail, wpm);
  });

  // on disconnect, remove them from the rooms const and check if they're the last one to disconnect -
  // if they are, delete the room itself as it will no longer be used.
  socket.on("disconnecting", () => {
    // have to get all rooms of current socket because the game lobby isn't the only room,
    // socket.io puts each socket in their own room at time of their conception
    const socketRooms = socket.rooms.values();
    console.log(
      "socketRooms of current socket (Probably one that is given upon socket's conception and another that is the typing room):"
    );
    console.log(socketRooms);
    let leavingRoomIndex = null;
    for (room of socketRooms) {
      // socketRooms is a set, not an array, must iterate like a set
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].id === room) {
          leavingRoomIndex = j;
          break;
        }
      }
      if (leavingRoomIndex !== null) {
        break;
      }
    }

    let roomStillAlive = true;
    console.log(`Index of room that client left: ${leavingRoomIndex}`);
    rooms[leavingRoomIndex].playerCount--;
    if (rooms[leavingRoomIndex].playerCount === 0) {
      // delete room if last player is leaving
      rooms.splice(leavingRoomIndex, 1);
      roomStillAlive = false;
    } else {
      // otherwise remove the player from the room's information & tell other room members that the player left
      let playerIndex = rooms[leavingRoomIndex].players.findIndex(
        (p) => p.socketId === socket.id
      );
      rooms[leavingRoomIndex].players.splice(playerIndex, 1);
      socket.to(rooms[leavingRoomIndex].id).emit("player_left", socket.id);
    }

    console.log(`Rooms after disconnect:`);
    console.log(rooms);
    if (roomStillAlive) {
      console.log("players still in the room after last disconnect:");
      console.log(rooms[leavingRoomIndex].players);
    }
  });
});
