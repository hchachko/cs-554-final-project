import React, {useEffect, useState, useRef} from 'react';
import io from 'socket.io-client';
import { v4 } from 'uuid';


function RacePublic() {
    const [playerName, setPlayerName] = useState(`player ${v4()}`); // Your player
    const [room, setRoom] = useState('');   // Use for telling the server who to send your real-time typing progress to (the rest of the room) 
    const [players, setPlayers] = useState([]); // Other players

    const socket = useRef();

    useEffect(() => {
        socket.current = io("http://localhost:4000");

        socket.current.emit("join_public", playerName);

        socket.current.on("joined", (existingPlayers, room) => { // response from this client joining the lobby
            console.log(`RoomID joined: ${room}`);
            console.log(`Players already in at time of joining:`);
            console.log(existingPlayers);
            setPlayers([ ...players, ...existingPlayers ]);
            setRoom(room);
        });


        return () => {
            socket.current.off('joined');
            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        socket.current.on("new_player_joined", (newPlayer) => { // response of other clients joining after this client
            console.log(`New Player Joined: ${newPlayer}`);
            setPlayers([ ...players, newPlayer ]);
            console.log(players);
        });

        socket.current.on("player_left", (playerSocket) => { // response of other clients leaving the lobby (remove them from the list)
            let copyPlayers = [ ...players ];
            let leavingPlayerIndex = copyPlayers.findIndex((p) => p.socketId === playerSocket);
            copyPlayers.splice(leavingPlayerIndex, 1);
            setPlayers(copyPlayers);
        });

        return () => {
            socket.current.off('new_player_joined');
            socket.current.off('player_left');
        };
    }, [players]);

    // current placein for organizing players in the lobby on frontend - will adjust to reflect proper styling when we get there
    let i = 0;
    const playerJSX =
    players && players.length > 0 &&
    players.map((p) => {
        i++
        return (
            <div key={i}>
                <h3>{p.name}</h3>
                <p>Your typing here</p>
            </div>
        )
    });

    return (
        <div>
            <h2>Public Race in Room: {room}</h2>
            <div>
                <h3>{playerName}</h3>
                <div>
                    this is where opponents will type
                </div>
            </div>
            {playerJSX && playerJSX}
        </div>
    )
}

export default RacePublic;