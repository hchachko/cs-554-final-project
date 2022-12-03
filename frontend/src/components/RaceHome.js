import {Link} from 'react-router-dom';

function RaceHome() {
    // same functionality as the public/private match buttons on the home page
    return (
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
    )
}

export default RaceHome;