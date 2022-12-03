import {Link} from 'react-router-dom';

function Home() {
    return (
        <div>
            <h1>Welcome to SpeedType!</h1>
            <p>SpeedType is a site where you can test your typing skills by matching up against other players in a typing free-for-all!</p>
            {/* Give each home-card div it's own section - one for public/private matchmaking, one for logging in/signing up, one for creating new quotes/"universes" */}
            <div className="home-card">
                <h2>Find a game!</h2>
                <div>
                    <h3>Public Match</h3>
                    <p>Play against other random players on the site's server!</p>
                    <Link to='/game/public'>
                        <button>Public Match</button>
                    </Link>
                </div>
                <div>
                    <h3>Private Match</h3>
                    <p>Play against your friends in private lobbies!</p>
                    <Link to='/game/private'>
                        <button>Private Match</button>
                    </Link>
                </div>
            </div>
            <div className="home-card">
                <h2>Login or Create an Account!</h2>
                <div>
                    <h3>Login</h3>
                    <Link to='/login'>
                        <button>Login</button>
                    </Link>
                </div>
                <div>
                    <h3>Sign up</h3>
                    <Link to='/signup'>
                        <button>Create Account</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Home;