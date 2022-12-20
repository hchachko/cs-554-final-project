import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styling.css";

function RaceHome() {
  const [allGenres, setAllGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    const handleMongo = async (e) => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/genre/getGenres"
        );
        console.log("test ", data);
        setAllGenres(data);
        setSelectedGenre(data[0]);
      } catch (e) {
        console.log(e);
      }
    };
    handleMongo();
  }, []);

  let i = 0;
  const genreJSX =
    allGenres &&
    allGenres.length > 0 &&
    allGenres.map((genre) => {
      i++;
      if (genre === selectedGenre) {
        return (
          <button
            key={i}
            className="selectedGenre"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {genre}
          </button>
        );
      } else {
        return (
          <button
            key={i}
            className="genre"
            onClick={(e) => {
              e.preventDefault();
              setSelectedGenre(genre);
            }}
          >
            {genre}
          </button>
        );
      }
    });

  return (
    <div className="home-card">
      <h2>Find a game!</h2>
      <div>
        <h3>Choose a genre to race on!</h3>
        {allGenres.length === 0 && <p>There aren't any genres to pick from. Create one now via the 'Create Genres & Quotes' tab!</p>}
        {genreJSX && <div>{genreJSX}</div>}
      </div>
      <div>
        <h3>Public Match</h3>
        <p>Play against other random players on the site's server!</p>
        {selectedGenre ? (
          <Link to="/game/public" state={{ genre: selectedGenre }}>
            Public Match
          </Link>
        ) : (
          <button>Public Match</button>
        )}
      </div>
    </div>
  );
}

export default RaceHome;
