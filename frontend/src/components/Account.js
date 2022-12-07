import React, { useState, useContext } from "react";
import SignOutButton from "./SignOutButton";
import { AuthContext } from "../firebase/Auth";
import { Card, CardMedia } from "@mui/material";
import { Grid, CardContent, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
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
  const classes = useStyles();
  const [buttonValue, setButtonValue] = useState("Edit Profile Pic");
  const [showForm, setShowForm] = useState(false);
  let profilePicForm = null;
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
          <form>
            <br/>
            <label>Image URL:&nbsp;</label>
            <input type="text"></input>
            <br/>
            <br/>
            <button type="submit">Confirm</button>
            <button onClick={ProfilePicButtonChange}>{buttonValue}</button>
          </form>
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
