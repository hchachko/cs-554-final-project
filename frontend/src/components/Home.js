import { Link } from "react-router-dom";
import { AuthContext } from "../firebase/Auth";
import react, { useContext } from "react";

function Home() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to SpeedType!</h1>
      <p>
        SpeedType is a site where you can test your typing skills by matching up
        against other players in a typing free-for-all!
      </p>
      {/* Give each home-card div it's own section - one for public/private matchmaking, one for logging in/signing up, one for creating new quotes/"universes" */}
      {currentUser && (
        <div className="home-card">
          <div>
            <h2>Find a game!</h2>
            <p>Play against other players on the site's server!</p>
            <Link to="/game/">
              <button>Play</button>
            </Link>
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="home-card">
          <h2>Login or Create an Account!</h2>
          <div>
            <h3>Login</h3>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
          <div>
            <h3>Sign up</h3>
            <Link to="/signup">
              <button>Create Account</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
