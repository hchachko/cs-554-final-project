import React, { useEffect, useState, useRef, useContext} from "react";
import { NavLink, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "../firebase/Auth";
import axios from "axios";
import useInterval from './useInterval';

function RacePublic() {
  const { currentUser } = useContext(AuthContext);

  const location = useLocation();

  const [thisPlayer, setThisPlayer] = useState({displayName: currentUser._delegate.displayName, email: currentUser._delegate.email}); // Your player
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
  const [numCorrect, setNumCorrect] = useState(0);
  const [numIncorrect, setNumIncorrect] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [oppWordsPerMinute, setOppWordsPerMinute] = useState([]); // words per minute of other players to display
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [haveNotPostedStats, setHaveNotPostedStats] = useState(true);
  const [noGenreSelected, setNoGenreSelected] = useState(false);

  const socket = useRef();

  // useEffect for initial state setup upon joining room and handling disconnect
  useEffect(() => {
    socket.current = io("http://localhost:4000");

    function initializeSocketConnection() {
      socket.current.emit("join_public", thisPlayer.displayName, thisPlayer.email, location.state.genre);
    };

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
        let opponentInputObjects = [];
        let opponentWpm = [];
        for (let i = 0; i < existingPlayers.length; i++) {
          opponentInputObjects.push({
            correctChars: "",
            incorrectChars: "",
            regularChars: quote,
          });
          opponentWpm.push(0);
        }
        setOpponentInput([...opponentInputObjects ]);
        setOppWordsPerMinute([ ...opponentWpm ]);
        setSoloState(false);
      }
      setRoom(room);
    });

    // if user tries to go to route /game/public without going through /game and selecting a genre,
    // they will not be conneted and must go back to select a genre
    if (location.state === null) {
      setNoGenreSelected(true);
    }
    else if (location.state.genre) {
      initializeSocketConnection();
    }

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
      console.log(`New Player Joined - displayName: ${newPlayer.displayName}, email: ${newPlayer.email}`);
      if (soloState === true) {
        setSoloState(false);
      }
      setPlayers([...players, newPlayer]);
      setOpponentInput([
        ...opponentInput,
        { correctChars: "", incorrectChars: "", regularChars: quote },
      ]);
      setOppWordsPerMinute([ ...oppWordsPerMinute, 0 ]);
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
      let copyOppWpm = [...oppWordsPerMinute];
      copyOppWpm.splice(leavingPlayerIndex, 1);
      setOppWordsPerMinute(copyOppWpm);
    });

    return () => {
      socket.current.off("new_player_joined");
      socket.current.off("player_left");
      socket.current.off("countdown");
    };
  }, [players, gameStarted]);

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
      let nc = numCorrect;
      let nic = numIncorrect;
      if (csf === 0) {
        // check changes before any incorrect characters
        if (i < raceInput.length) {
          // user typed ( not backspace )
          if (raceQuote[i] === raceInput[i]) {
            // if character is correct
            setNextChar(raceQuote[i + 1]);
            setRegularChars(regularChars.slice(1));
            setCorrectChars(correctChars + raceQuote[i]);
            if (i === nc) {
              setNumCorrect(nc + 1);
            }
            if (raceQuote[i] === " " && i > indexOfLastEmit) {
              socket.current.emit(
                "new_input",
                thisPlayer.email,
                room,
                i - indexOfLastEmit
              );
              setIndexOfLastEmit(i);
            }
            if (raceInput.length === raceQuote.length) {
              console.log("race finished");
              socket.current.emit(
                "new_input",
                thisPlayer.email,
                room,
                i - indexOfLastEmit + 1
              );
              setGameFinished(true);
            }
            setInputIndex(i + 1);
          } else {
            // character is incorrect
            setCharsSinceFalse(1);
            setNextChar(raceQuote[i + 1]);
            setRegularChars(regularChars.slice(1));
            setIncorrectChars(incorrectChars + raceQuote[i]);
            setNumIncorrect(nic + 1);
            setInputIndex(i + 1);
          }
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
          if (i < raceQuote.length) { setRegularChars(raceQuote[i] + regularChars);}
          setInputIndex(i - 1);
        }
        if (i < raceInput.length) {
          // user continued to type incorrectly ( not backspace )
          console.log("continued to be incorrect");
          setCharsSinceFalse(csf + 1);
          setNextChar(raceQuote[i + 1]);
          setRegularChars(regularChars.slice(1));
          setIncorrectChars(incorrectChars + raceQuote[i]);
          setNumIncorrect(nic + 1);
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
    socket.current.on("opponent_input", (playerEmail, wordLength) => {
      let oppIndex = players.findIndex((p) => p.email === playerEmail);
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
      socket.current.emit("game_finish", thisPlayer.email, room);
    }

    if (gameFinished) {
      runUseEffect();
    }
  }, [gameFinished]);

  // useEffect for listening in on player's finishing their race in order to get the place with which they finished
  useEffect(() => {
    const handleStats = async (e) => {
      //function for updating stats of player
      let accuracy = numCorrect / (numCorrect + numIncorrect);
      let adjustedNumCorrect = numCorrect * accuracy;
      let numberOfWords = adjustedNumCorrect / 5;
      let wpm =  (numberOfWords / (time / 60000)).toFixed(2);
      if (isNaN(wpm)) { wpm = 0 }
      socket.current.emit("send_wpm", thisPlayer.email, room, wpm);
      setWordsPerMinute(wpm);
      if (
        finishedPlayers.includes(thisPlayer.email) &&
        finishedPlayers.indexOf(thisPlayer.email) === 0
      ) {
        console.log('first');
        try {
          const { data } = await axios.patch(
            "http://localhost:4000/user/userStats",
            {
              email: thisPlayer.email,
              game_wpm: wpm,
              game_won: true,
            }
          );
          setHaveNotPostedStats(false);
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log('not first');
        try {
          const { data } = await axios.patch(
            "http://localhost:4000/user/userStats",
            {
              email: thisPlayer.email,
              game_wpm: wpm,
              game_won: false,
            }
          );
        } catch (e) {
          console.log(e);
        }
      }
    };

    if (!soloState && haveNotPostedStats && gameFinished) {
      handleStats();
    }

    socket.current.on("race_place", (playerEmail) => {
      setFinishedPlayers([ ...finishedPlayers, playerEmail ]);
    });

    return () => {
      socket.current.off("race_place");
    };
  }, [finishedPlayers]);

  // useEffect for receiving and updating words per minute from other clients
  useEffect(() => {
    socket.current.on("receive_wpm", (playerEmail, wpm) => {
      let oppIndex = players.findIndex((p) => p.email === playerEmail);
      let copyOppWpm = [ ...oppWordsPerMinute ];
      copyOppWpm[oppIndex] = wpm;
      setOppWordsPerMinute(copyOppWpm);
    });
    
    return () => {
      socket.current.off('receive_wpm');
    }
  }, [oppWordsPerMinute]);

  //Timer to keep track of time for wpm
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

  useInterval(() => {
    let accuracy = numCorrect / (numCorrect + numIncorrect);
    let adjustedNumCorrect = numCorrect * accuracy;
    let numberOfWords = adjustedNumCorrect / 5;
    let wpm =  (numberOfWords / (time / 60000)).toFixed(2);
    if (isNaN(wpm)) { wpm = 0 }
    socket.current.emit("send_wpm", thisPlayer.email, room, wpm);
    setWordsPerMinute(wpm);
  }, isActive && !isPaused ? 3000 : null);

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

  // current placein for organizing players in the lobby on frontend - will adjust to reflect proper styling when we get there
  let i = 0;
  const playerJSX =
    players &&
    players.length > 0 &&
    players.map((p) => {
      i++;
      return (
        <div key={i}>
          <h3>{p.displayName}</h3>
          <h3>
            {finishedPlayers.includes(p.email) &&
              (finishedPlayers.indexOf(p.email) === 0
                ? `${finishedPlayers.indexOf(p.email) + 1}st place!`
                : finishedPlayers.indexOf(p.email) === 1
                ? `${finishedPlayers.indexOf(p.email) + 1}nd place!`
                : finishedPlayers.indexOf(p.email === 2)
                ? `${finishedPlayers.indexOf(p.email) + 1}rd place!`
                : `4th place!`)}
          </h3>
          <p>{oppWordsPerMinute[i - 1]} WPM</p>
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
      if (inputIndex < raceQuote.length && key.length === 1 && charsSinceFalse < 5) {
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

  if (noGenreSelected) {
    return (
      <div>
        <h2>It appears that you have not selected a genre to queue from the 'Find a Game' page.</h2>
        <p>Go back and selected a genre to be put into a live game!</p>
        <NavLink to="/game/"><button>Go Back</button></NavLink>
      </div>
    )
  }
  else {
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
          <h3>{thisPlayer.displayName}</h3>
          <h3>
            {finishedPlayers.includes(thisPlayer.email) &&
              (finishedPlayers.indexOf(thisPlayer.email) === 0
                ? `${finishedPlayers.indexOf(thisPlayer.email) + 1}st place!`
                : finishedPlayers.indexOf(thisPlayer.email) === 1
                ? `${finishedPlayers.indexOf(thisPlayer.email) + 1}nd place!`
                : finishedPlayers.indexOf(thisPlayer.email === 2)
                ? `${finishedPlayers.indexOf(thisPlayer.email) + 1}rd place!`
                : `4th place!`)}
          </h3>
          {soloState && <p>Your stats will not be updated unless you play against another player!</p>}
          <p>{wordsPerMinute} WPM</p>
          <div>
            <span id="correct-chars">{correctChars && correctChars}</span>
            <span id="incorrect-chars">{incorrectChars && incorrectChars}</span>
            <span id="next-char">{nextChar && nextChar}</span>
            <span id="regular-chars">{regularChars && regularChars}</span>
          </div>
          <label htmlFor="userText">Type here:&nbsp;</label>
          <input
            id = "userText"
            type="text"
            autoComplete="off"
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
}

export default RacePublic;
