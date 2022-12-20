import React, { useState, useEffect, useContext } from "react";
import SignOutButton from "./SignOutButton";
import { AuthContext } from "../firebase/Auth";
import { Card } from "@mui/material";
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

function Account() {
  const { currentUser } = useContext(AuthContext);
  const [accountData, setAccountData] = useState({}); //useState({_id: "", username: "", email: "", profilePic: "", wpm: 0, games_played: 0, games_won: 0, admin: false});
  useEffect(() => {
    const handleMongo = async (e) => {
      if (currentUser && currentUser._delegate && currentUser._delegate.email) {
        console.log("This username is: " + currentUser._delegate.email);
        try {
          const { data } = await axios.get(
            "http://localhost:4000/user/" + currentUser._delegate.email
          );
          setAccountData(data);
        } catch (e) {
          console.log(e);
        }
      } else {
        //TODO do something if current user can't be found
      }
    };
    handleMongo();
  }, [currentUser]);

  async function updateProfilePic (e) {
    try {
      e.preventDefault();
      let formData = new FormData();
      formData.append("file", fileData);
      formData.append("fileName", fileData.name);
      formData.append("email", currentUser._delegate.email);
      console.log("This is what's being sent", formData);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post("http://localhost:4000/user/profilePic", formData, config);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  }

  const classes = useStyles();
  const [showForm, setShowForm] = useState(false);
  const [fileData, setFileData] = useState({ imageURL: "" });
  const handleChange = (e) => {
    setFileData(e.target.files[0]);
  };
  function ProfilePicButtonChange() {
    if (showForm === false) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {currentUser._delegate.displayName}
          </Typography>
          {accountData && accountData.profilePic && (
            <img
              src={
                "http://localhost:4000/uploads/" +
                accountData.profilePic.originalname
              }
              alt="Profile"
              />
            )}
            {showForm && (
              <div>
                <form onSubmit={updateProfilePic}>
                  <br/>
                  <label>Image URL:&nbsp;</label>
                  <input
                    onChange={(e) => handleChange(e)}
                    id = 'imageURL'
                    name = 'file'
                    placeholder = 'Image link...'
                    type="file"
                    accept="image/*"
                    required
                  />
                  <br/>
                  <br/>
                  <button type="Submit">Confirm</button>
                  <button type="Button" onClick={ProfilePicButtonChange}>Cancel</button>
                <br/>
              </form>
              </div>
            ) }
            <br/>
          {!showForm && <button onClick={ProfilePicButtonChange}>Upload Profile Picture</button>}
          <Typography variant="body2" color="text.secondary">
            Email: {currentUser._delegate.email}
          </Typography>
        </CardContent>
        <SignOutButton className={classes.button} />
      </Card>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            User Stats
          </Typography>
          {accountData && (
            <ul>
              <li>Games Played: {accountData.games_played}</li>
              <li>
                Characters Per Second (CPM):{" "}
                {Math.round(accountData.wpm * 100) / 100}
              </li>
              <li>Games Won: {accountData.games_won}</li>
            </ul>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

export default Account;
