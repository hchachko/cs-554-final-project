import React, {useEffect, useState, useRef} from 'react';
import io from 'socket.io-client';
import { v4 } from 'uuid';


function RacePublic() {
    const [playerName, setPlayerName] = useState(`player ${v4()}`); // Your player
    const [room, setRoom] = useState('');   // Use for telling the server who to send your real-time typing progress to (the rest of the room) 
    const [players, setPlayers] = useState([]); // Other players
    const [soloState, setSoloState] = useState(true); // False when there are other players in the game - if player plays themselves, game will not count for wins
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(undefined);
    const [countdownDisplay, setCountdownDisplay] = useState(undefined);
    const [raceQuote, setRaceQuote] = useState(undefined);
    const [raceInput, setRaceInput] = useState(''); // User input to compare against the quote at the inputIndex to determine whether user is hitting correct keys or not
    const [inputIndex, setInputIndex] = useState(0); // Index of where the user is in the race
    const [inputStatus, setInputStatus] = useState(true); // Check inputStatus each time user input changes. True while the user inputs correct characters, false otherwise
    const [charsSinceFalse, setCharsSinceFalse] = useState(0); // After 5 characters since inputting a false character, user is forced to backspace and correct their mistake in order to continue
    const [correctChars, setCorrectChars] = useState('');
    const [incorrectChars, setIncorrectChars] = useState('');
    const [nextChar, setNextChar] = useState('');
    const [regularChars, setRegularChars] = useState('');

    const socket = useRef();

    // useEffect for initial state setup upon joining room and handling disconnect
    useEffect(() => {
        socket.current = io("http://localhost:4000");

        socket.current.emit("join_public", playerName);

        socket.current.on("joined", (existingPlayers, room, quote) => { // response from this client joining the lobby
            console.log(`RoomID joined: ${room}`);
            console.log(`Players already in at time of joining:`);
            console.log(existingPlayers);
            setRaceQuote(quote);
            setNextChar(quote[0]);
            setRegularChars(quote.slice(1));
            if (existingPlayers.length > 0) {
                setPlayers([ ...existingPlayers ]);
            }
            console.log(players.length);
            if (players.length > 0) {
                soloState(false);
            } 
            setRoom(room);
        });

        return () => {
            socket.current.off('joined');
            socket.current.disconnect();
        };
    }, []);

    // useEffect for modifying states dependent on players leaving/joining the lobby
    useEffect(() => {
        socket.current.on("countdown", (count) => { // response of either a new client joining to initiate countdown, or other clients joining to add to countdown
            setCountdown({count: count});
        });

        socket.current.on("new_player_joined", (newPlayer) => { // response of other clients joining after this client
            console.log(`New Player Joined: ${newPlayer.name}`);
            if (soloState === true) {
                setSoloState(false);
            }
            setPlayers([ ...players, newPlayer ]);
        });

        socket.current.on("player_left", (playerSocket) => { // response of other clients leaving the lobby (remove them from the list)
            let copyPlayers = [ ...players ];
            let leavingPlayerIndex = copyPlayers.findIndex((p) => p.socketId === playerSocket);
            copyPlayers.splice(leavingPlayerIndex, 1);
            if (gameStarted === false && players.length === 1) {
                setSoloState(true);
            }
            setPlayers(copyPlayers);
        });

        return () => {
            socket.current.off('new_player_joined');
            socket.current.off('player_left');
            socket.current.off('countdown');
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
                    socket.current.emit("gameStart", room);
                    setGameStarted(true);
                } 
            }, 1000);
        }

        return () => {
            if (countdown !== undefined) {
                clearInterval(interval);
            }
        }
    }, [countdown]);

    // useEffect for analyzing user the client's race input
    useEffect(() => {

        function runUseEffect() {
            let i = inputIndex;
            let csf = charsSinceFalse;
            if (csf === 0) { // check changes before any incorrect characters
                if (i < raceInput.length) { // user typed ( not backspace )
                    if (raceQuote[i] === raceInput[i]) { // if character is correct
                        setNextChar(raceQuote[i + 1]);
                        setRegularChars(regularChars.slice(1));
                        setCorrectChars(correctChars + raceQuote[i]);
                    }
                    else { // character is incorrect
                        setCharsSinceFalse(1);
                        setNextChar(raceQuote[i + 1]);
                        setRegularChars(regularChars.slice(1));
                        setIncorrectChars(incorrectChars + raceQuote[i]);
                    }
                    setInputIndex(i + 1);
                }
                else { // user backspaced
                    console.log('before incorrect branch backspace');
                    setCorrectChars(correctChars.slice(0,-1));
                    setNextChar(raceQuote[i - 1]);
                    setRegularChars(raceQuote[i] + regularChars);
                    setInputIndex(i - 1);
                }
            }
            else { // check all changes after an incorrect character
                if (i > raceInput.length) { // user backspaced 
                    console.log('incorrect branch backspace');
                    setCharsSinceFalse(csf - 1);
                    setIncorrectChars(incorrectChars.slice(0,-1));
                    setNextChar(raceQuote[i - 1])
                    setRegularChars(raceQuote[i] + regularChars);
                    setInputIndex(i - 1);

                }
                if (i < raceInput.length) { // user continued to type incorrectly ( not backspace ) 
                    setCharsSinceFalse(csf + 1);
                    setNextChar(raceQuote[i + 1]);
                    setRegularChars(regularChars.slice(1));
                    setIncorrectChars(incorrectChars + raceQuote[i]);
                    setInputIndex(i + 1);
                }
            }
    
        }

        if (gameStarted) {
            runUseEffect();
        }
    }, [raceInput]);

    // current placein for organizing players in the lobby on frontend - will adjust to reflect proper styling when we get there
    let i = 0;
    const playerJSX =
    players && players.length > 0 &&
    players.map((p) => {
        i++
        return (
            <div key={i}>
                <h3>{p.name}</h3>
                <p>Opponents typing here</p>

            </div>
        )
    });

    const handleChange = (e) => {
        setRaceInput(e.target.value);
    };


    const maxLength = raceQuote && {
        maxLength: raceQuote.length
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
            <h2>{gameStarted ? "Type!" : (countdownDisplay ? `Race starting in: ${countdownDisplay}` : "Getting game countdown...")}</h2>
            <div>
                <h3>{playerName}</h3>
                <div>
                    this is where you will type
                </div>
                <div>
                    <span id='correct-chars'>{correctChars && correctChars}</span>
                    <span id='incorrect-chars'>{incorrectChars && incorrectChars}</span>
                    <span id='next-char'>{nextChar && nextChar}</span>
                    <span id='regular-chars'>{regularChars && regularChars}</span>
                </div>
                <input type="text" onChange={handleChange} { ...maxLength } ></input>
            </div>
            {playerJSX && playerJSX}
        </div>
    )
}

export default RacePublic;