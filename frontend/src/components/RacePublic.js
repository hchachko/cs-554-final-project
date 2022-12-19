import React, { useEffect, useState, useRef, useContext } from "react";
import { NavLink } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "../firebase/Auth";
import { v4 } from "uuid";
import axios from "axios";

function RacePublic() {
  const [playerName, setPlayerName] = useState(`${v4()}`); // Your player
  const [room, setRoom] = useState(""); // Use for telling the server who to send your real-time typing progress to (the rest of the room)
  const [players, setPlayers] = useState([]); // Other players
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [soloState, setSoloState] = useState(true); // False when there are other players in the game - if player plays themselves, game will not count for wins
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdown, setCountdown] = useState(undefined);
  const [countdownDisplay, setCountdownDisplay] = useState(undefined);
  const [raceQuote, setRaceQuote] = useState(undefined);
  const [raceInput, setRaceInput] = useState(""); // User input to compare against the quote at the inputIndex to determine whether user is hitting correct keys or not
  const [inputIndex, setInputIndex] = useState(0); // Index of where the user is in the race
  const [charsSinceFalse, setCharsSinceFalse] = useState(0); // After a few characters since inputting a false character, user is forced to backspace and correct their mistake in order to continue
  const [correctChars, setCorrectChars] = useState("");
  const [incorrectChars, setIncorrectChars] = useState("");
  const [nextChar, setNextChar] = useState("");
  const [regularChars, setRegularChars] = useState("");
  const [opponentInput, setOpponentInput] = useState([]);
  const [indexOfLastEmit, setIndexOfLastEmit] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const { currentUser } = useContext(AuthContext);

  const socket = useRef();

  //Timer to calculate wpm
  useEffect(() => {
    let interval = null;

    if (isActive && isPaused === false) {
      interval = setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  // useEffect for initial state setup upon joining room and handling disconnect
  useEffect(() => {
    socket.current = io("http://localhost:4000");

    socket.current.emit("join_public", playerName);

    socket.current.on("joined", (existingPlayers, room, quote) => {
      // response from this client joining the lobby
      console.log(`RoomID joined: ${room}`);
      console.log(`Players already in at time of joining:`);
      console.log(existingPlayers);
      setRaceQuote(quote);
      console.log("poopopop", raceQuote);
      setNextChar(quote[0]);
      setRegularChars(quote.slice(1));
      if (existingPlayers.length > 0) {
        setPlayers([...existingPlayers]);
        let emptyObjects = [];
        for (let i = 0; i < existingPlayers.length; i++) {
          emptyObjects.push({
            correctChars: "",
            incorrectChars: "",
            regularChars: quote,
          });
        }
        setOpponentInput([...emptyObjects]);
        setSoloState(false);
      }
      setRoom(room);
    });

    return () => {
      socket.current.off("joined");
      socket.current.disconnect();
    };
  }, []);

  // useEffect for modifying states dependent on players leaving/joining the lobby
  useEffect(() => {
    socket.current.on("countdown", (count) => {
      // response of either a new client joining to initiate countdown, or other clients joining to add to countdown
      setCountdown({ count: count });
    });

    socket.current.on("new_player_joined", (newPlayer, quote) => {
      // response of other clients joining after this client
      console.log(`New Player Joined: ${newPlayer.name}`);
      if (soloState === true) {
        setSoloState(false);
      }
      setPlayers([...players, newPlayer]);
      setOpponentInput([
        ...opponentInput,
        { correctChars: "", incorrectChars: "", regularChars: quote },
      ]);
    });

    socket.current.on("player_left", (playerSocket) => {
      // response of other clients leaving the lobby (remove them from the list)
      let copyPlayers = [...players];
      let leavingPlayerIndex = copyPlayers.findIndex(
        (p) => p.socketId === playerSocket
      );
      copyPlayers.splice(leavingPlayerIndex, 1);
      if (gameStarted === false && players.length === 1) {
        setSoloState(true);
      }
      setPlayers(copyPlayers);
      let copyOpponentInput = [...opponentInput];
      copyOpponentInput.splice(leavingPlayerIndex, 1);
      setOpponentInput(copyOpponentInput);
    });

    return () => {
      socket.current.off("new_player_joined");
      socket.current.off("player_left");
      socket.current.off("countdown");
    };
  }, [players]);

  // useEffect for displaying/decrementing countdown
  useEffect(() => {
    let interval;
    if (countdown !== undefined) {
      let counter = countdown.count;
      interval = setInterval(() => {
        setCountdownDisplay(counter);
        counter--;
        if (counter === -1) {
          clearInterval(interval);
          socket.current.emit("game_start", room);
          setGameStarted(true);
          handleReset();
          handleStart();
        }
      }, 1000);
    }

    return () => {
      if (countdown !== undefined) {
        clearInterval(interval);
      }
    };
  }, [countdown]);

  // useEffect for analyzing user the client's race input
  useEffect(() => {
    function runUseEffect() {
      let i = inputIndex;
      let csf = charsSinceFalse;
      if (csf === 0) {
        // check changes before any incorrect characters
        if (i < raceInput.length) {
          // user typed ( not backspace )
          if (raceQuote[i] === raceInput[i]) {
            // if character is correct
            setNextChar(raceQuote[i + 1]);
            setRegularChars(regularChars.slice(1));
            setCorrectChars(correctChars + raceQuote[i]);
            if (raceQuote[i] === " " && i > indexOfLastEmit) {
              socket.current.emit(
                "new_input",
                playerName,
                room,
                i - indexOfLastEmit
              );
              setIndexOfLastEmit(i);
            }
            if (raceInput.length === raceQuote.length) {
              console.log("race finished");
              socket.current.emit(
                "new_input",
                playerName,
                room,
                i - indexOfLastEmit + 1
              );
              setGameFinished(true);
            }
          } else {
            // character is incorrect
            setCharsSinceFalse(1);
            setNextChar(raceQuote[i + 1]);
            setRegularChars(regularChars.slice(1));
            setIncorrectChars(incorrectChars + raceQuote[i]);
          }
          setInputIndex(i + 1);
        } else {
          // user backspaced
          console.log("before incorrect branch backspace");
          setCorrectChars(correctChars.slice(0, -1));
          setNextChar(raceQuote[i - 1]);
          setRegularChars(raceQuote[i] + regularChars);
          setInputIndex(i - 1);
        }
      } else {
        // check all changes after an incorrect character
        if (i > raceInput.length) {
          // user backspaced
          console.log("incorrect branch backspace");
          setCharsSinceFalse(csf - 1);
          setIncorrectChars(incorrectChars.slice(0, -1));
          setNextChar(raceQuote[i - 1]);
          setRegularChars(raceQuote[i] + regularChars);
          setInputIndex(i - 1);
        }
        if (i < raceInput.length) {
          // user continued to type incorrectly ( not backspace )
          console.log("continued to be incorrect");
          setCharsSinceFalse(csf + 1);
          setNextChar(raceQuote[i + 1]);
          setRegularChars(regularChars.slice(1));
          setIncorrectChars(incorrectChars + raceQuote[i]);
          setInputIndex(i + 1);
        }
      }
    }

    if (gameStarted && !gameFinished) {
      runUseEffect();
    }
  }, [raceInput]);

  // useEffect for receiving other players' race input
  useEffect(() => {
    socket.current.on("opponent_input", (player, wordLength) => {
      let oppIndex = players.findIndex((p) => p.name === player);
      let copyOppInput = [...opponentInput];
      let modifiedInput = copyOppInput[oppIndex];

      modifiedInput.correctChars += modifiedInput.regularChars.slice(
        0,
        wordLength
      );
      modifiedInput.regularChars = modifiedInput.regularChars.slice(wordLength);

      copyOppInput[oppIndex] = modifiedInput;
      setOpponentInput(copyOppInput);
    });

    return () => {
      socket.current.off("opponent_input");
    };
  }, [opponentInput]);

  // useEffect for telling the server that you finished the race
  useEffect(() => {
    //timer stop
    handlePauseResume();
    function runUseEffect() {
      socket.current.emit("game_finish", playerName, room);
    }

    if (gameFinished) {
      runUseEffect();
    }

    if (raceQuote) {
      console.log("This is skiddy speaking", time);
      console.log(raceQuote.length);
    }

    //function for updating stats of player
    const handleStats = async (e) => {
      if (raceQuote) {
        if (
          finishedPlayers.includes(currentUser._delegate.displayName) &&
          finishedPlayers.indexOf(currentUser._delegate.displayName) === 0
        ) {
          try {
            const { data } = await axios.patch(
              "http://localhost:4000/user/userStats",
              {
                email: currentUser._delegate.email,
                game_wpm: raceQuote.length / (time / 1000),
                game_won: true,
              }
            );
          } catch (e) {
            console.log(e);
          }
        } else {
          try {
            const { data } = await axios.patch(
              "http://localhost:4000/user/userStats",
              {
                email: currentUser._delegate.email,
                game_wpm: raceQuote.length / (time / 1000),
                game_won: false,
              }
            );
          } catch (e) {
            console.log(e);
          }
        }
      }
    };
    handleStats();
  }, [gameFinished]);

  // useEffect for listening in on player's finishing their race in order to get the place with which they finished
  useEffect(() => {
    socket.current.on("race_place", (playerName) => {
      setFinishedPlayers([...finishedPlayers, playerName]);
    });

    return () => {
      socket.current.off("race_place");
    };
  }, [finishedPlayers]);

  // current placein for organizing players in the lobby on frontend - will adjust to reflect proper styling when we get there
  let i = 0;
  const playerJSX =
    players &&
    players.length > 0 &&
    players.map((p) => {
      i++;
      return (
        <div key={i}>
          <h3>{p.name}</h3>
          <h3>
            {finishedPlayers.includes(p.name) &&
              (finishedPlayers.indexOf(p.name) === 0
                ? `${finishedPlayers.indexOf(p.name) + 1}st place!`
                : finishedPlayers.indexOf(p.name) === 1
                ? `${finishedPlayers.indexOf(p.name) + 1}nd place!`
                : finishedPlayers.indexOf(p.name === 2)
                ? `${finishedPlayers.indexOf(p.name) + 1}rd place!`
                : `4th place!`)}
          </h3>
          <div>
            <span id="correct-chars">
              {opponentInput[i - 1].correctChars &&
                opponentInput[i - 1].correctChars}
            </span>
            <span id="incorrect-chars">
              {opponentInput[i - 1].incorrectChars &&
                opponentInput[i - 1].incorrectChars}
            </span>
            <span id="regular-chars">
              {opponentInput[i - 1].regularChars &&
                opponentInput[i - 1].regularChars}
            </span>
          </div>
        </div>
      );
    });

  const handleKeyDown = (e) => {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39) {
      // if user presses left, up, or right arrow, don't do anything
      e.preventDefault();
    } else {
      e.target.selectionStart = e.target.value.length; // make sure any key press happens at the front of the input
      const key = e.key;
      if (key.length === 1 && charsSinceFalse < 5) {
        setRaceInput(e.target.value + key);
      } else if (key === "Backspace") {
        setRaceInput(e.target.value.slice(0, -1));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
  };

  const maxLength = raceQuote && {
    maxLength: raceQuote.length,
  };
  if (charsSinceFalse === 5) {
    maxLength.maxLength = raceInput.length;
  }
  if (raceQuote && !gameStarted) {
    maxLength.maxLength = 0;
  }

  return (
    <div>
      <h2>Public Race in Room: {room}</h2>
      <br />
      <h2>
        {gameStarted
          ? "Type!"
          : countdownDisplay
          ? `Race starting in: ${countdownDisplay}`
          : "Getting game countdown..."}
      </h2>
      <div>
        <h3>{playerName}</h3>
        <h3>
          {finishedPlayers.includes(playerName) &&
            (finishedPlayers.indexOf(playerName) === 0
              ? `${finishedPlayers.indexOf(playerName) + 1}st place!`
              : finishedPlayers.indexOf(playerName) === 1
              ? `${finishedPlayers.indexOf(playerName) + 1}nd place!`
              : finishedPlayers.indexOf(playerName === 2)
              ? `${finishedPlayers.indexOf(playerName) + 1}rd place!`
              : `4th place!`)}
        </h3>
        <div>
          <span id="correct-chars">{correctChars && correctChars}</span>
          <span id="incorrect-chars">{incorrectChars && incorrectChars}</span>
          <span id="next-char">{nextChar && nextChar}</span>
          <span id="regular-chars">{regularChars && regularChars}</span>
        </div>
        <input
          type="text"
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          {...maxLength}
        ></input>
      </div>
      {playerJSX && playerJSX}
      {gameFinished && (
        <NavLink to="/game/">
          <button>New Game</button>
        </NavLink>
      )}
    </div>
  );
}

export default RacePublic;
