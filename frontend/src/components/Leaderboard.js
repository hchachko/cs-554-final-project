import React, { useState, useEffect, useContext } from "react";
import SignOutButton from "./SignOutButton";
import { AuthContext } from "../firebase/Auth";
import { Card, CardMedia } from "@mui/material";
import { Grid, CardContent, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import axios from "axios";
const useStyles = makeStyles({
  card: {
    maxWidth: 345,
    height: "60%",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 20,
    // border: "1px solid black",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);",
    backgroundColor: "white",
    margin: "2.5%",
  },
  grid: {
    flexGrow: 1,
    flexDirection: "row",
  },
  media: {
    height: "100%",
    width: "100%",
  },
});

function Leaderboard() {
  const classes = useStyles();
  const [leaderboardData, setLeaderboardData] = useState();

  useEffect(() => {
    const handleMongo = async (e) => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/user/leaderboard"
        );
        console.log("test ", data);
        setLeaderboardData(data);
        console.log(leaderboardData);
      } catch (e) {
        console.log(e);
      }
    };
    handleMongo();
  }, []);

  return (
    leaderboardData && (
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            CPM Leaderboard
          </Typography>
          <ol>
            {leaderboardData.map((user) => {
              return (
                <div>
                  <li>{user.username}</li>
                  WPM (Words Per Minute): {user.wpm}
                  <br />
                  Games Played: {user.games_played}
                  <br />
                  Games Won: {user.games_won}
                  <br />
                </div>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    )
  );
}

export default Leaderboard;
