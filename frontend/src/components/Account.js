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

function Account () {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const [accountData, setAccountData] = useState({}); //useState({_id: "", username: "", email: "", profilePic: "", wpm: 0, games_played: 0, games_won: 0, admin: false});
  useEffect(() => {
    const handleMongo = async (e) => {
      if (currentUser && currentUser._delegate && currentUser._delegate.displayName) {
        console.log("This username is: "+ currentUser._delegate.displayName);
        try {
          const { data } = await axios.get("http://localhost:4000/user/"+currentUser._delegate.displayName);
          console.log("test ", data);
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
  console.log("Account: ",accountData);
  const classes = useStyles();
  const [buttonValue, setButtonValue] = useState("Edit Profile Pic");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({imageURL: ''});
  const handleChange = (e) => {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    console.log(formData);
  };
  function ProfilePicButtonChange (){
    if (buttonValue === "Edit Profile Pic"){
      setButtonValue("Cancel");
      setShowForm(true);
    }
    else {
      setButtonValue("Edit Profile Pic");
      setShowForm(false);
    }
  }
  async function updateProfilePic () {
    try {
      const { data } = await axios.patch("http://localhost:4000/user/profilePic", {
        email: currentUser._delegate.email,
        profilePic: formData.imageURL
      });
      console.log("Profile Pic Call", data);
    } catch (e) {
      console.log(e);
    }
  }
  if (showForm) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {currentUser._delegate.displayName}
          </Typography>
          {currentUser && (
            <CardMedia
              component="img"
              alt="No User Image"
              height="140"
              image={currentUser._delegate.photoURL}
              className={classes.media}
            />
          )}
            <br/>
            <label>Image URL:&nbsp;</label>
            <input
              onChange={(e) => handleChange(e)}
              id = 'imageURL'
              name = 'imageURL'
              placeholder = 'Image link...'
            />
            <br/>
            <br/>
            <button onClick={updateProfilePic}>Confirm</button>
            <button onClick={ProfilePicButtonChange}>{buttonValue}</button>
          <br/>
          <Typography variant="body2" color="text.secondary">
            Email: {currentUser._delegate.email}
          </Typography>
        </CardContent>
        <SignOutButton className={classes.button} />
      </Card>
    </Grid>
  );
  } else {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Card className={classes.card} variant="outlined">
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {currentUser._delegate.displayName}
            </Typography>
            {accountData && accountData.profilePic && (
              <img 
              src= {accountData.profilePic}
              alt="Profile"
              />
            )}
            <br/>
            <button onClick={ProfilePicButtonChange}>{buttonValue}</button>
            <Typography variant="body2" color="text.secondary">
              Email: {currentUser._delegate.email}
            </Typography>
          </CardContent>
          <SignOutButton className={classes.button} />
        </Card>
      </Grid>
    );
  }
}

export default Account;
