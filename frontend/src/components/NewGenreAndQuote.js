import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styling.css";

function NewGenreAndQuote() {
  const [allGenres, setAllGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [newQuote, setNewQuote] = useState("");
  const [newGenre, setNewGenre] = useState({});
  const [updateMessage, setUpdateMessage] = useState("");

  const handleNewQuote = (e) => {
    e.preventDefault();
    setUpdateMessage("");
    const { newQuote } = e.target.elements;
    if (newQuote.value.trim().length === 0) {
      alert("Must fill in quote");
      return false;
    } else if (newQuote.value.trim().length < 30) {
      alert("Quotes must be at least 30 characters in length");
      return false;
    }
    setNewQuote(newQuote.value);
  };

  const handleNewGenre = (e) => {
    e.preventDefault();
    setUpdateMessage("");
    const { newGenre, newGenreQuote } = e.target.elements;
    if (newGenre.value.trim().length === 0) {
      alert("Must fill in genre");
      return false;
    } else if (newGenreQuote.value.trim().length === 0) {
      alert("Must fill in genre quote");
      return false;
    } else if (newGenreQuote.value.trim().length < 30) {
      alert("Quotes must be at least 30 characters in legnth");
      return false;
    }
    setNewGenre({ genre: newGenre.value, quote: newGenreQuote.value });
  };

  useEffect(() => {
    const handleMongo = async () => {
      try {
        const { data } = await axios.get(
          "https://cs554-final-project.herokuapp.com/genre/getGenres"
        );
        console.log("test ", data);
        setAllGenres(data);
      } catch (e) {
        console.log(e);
      }
    };

    handleMongo();
  }, []);

  useEffect(() => {
    const handleMongo = async () => {
      try {
        const { data } = await axios.post(
          "https://cs554-final-project.herokuapp.com/genre/newQuote",
          {
            genre: selectedGenre,
            newQuote: newQuote,
          }
        );
        // for some reason these two lines below aren't hitting
        console.log(
          `Successfully posted new quote to genre '${selectedGenre}'`,
          data
        );
        setUpdateMessage(
          `Successfully posted new quote to genre '${selectedGenre}'`
        );
      } catch (e) {
        console.log(e);
      }
    };

    if (newQuote.length > 0) {
      handleMongo();
    }
  }, [newQuote]);

  useEffect(() => {
    const handleMongo = async () => {
      try {
        const { data } = await axios.post(
          "https://cs554-final-project.herokuapp.com/genre/newGenre",
          {
            newGenre: newGenre.genre,
            newGenreQuote: newGenre.quote,
          }
        );
        // these ones as well
        setAllGenres([...allGenres, newGenre.genre]);
        setUpdateMessage(`Successfully posted new genre '${newGenre.genre}`);
        console.log(`Successfully posted new genre '${newGenre.genre}`);
      } catch (e) {
        console.log(e);
      }
    };

    if (newGenre.genre && newGenre.quote) {
      handleMongo();
    }
  }, [newGenre]);

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
    <div>
      <div>
        {updateMessage && <p>{updateMessage}</p>}
        <h2>Create a new quote!</h2>
        <div>
          <h3>Pick from an existing genre to add a quote to!</h3>
          {allGenres.length === 0 && (
            <p>There aren't any genres to pick from. Create one now below!</p>
          )}
          {genreJSX && <div>{genreJSX}</div>}
          {selectedGenre && (
            <form onSubmit={handleNewQuote}>
              <div>
                <label>
                  Type Your New Quote Here:
                  <input
                    required
                    name="newQuote"
                    type="text"
                    placeholder="New Quote"
                  />
                </label>
              </div>
              <button id="newQuoteButton" name="newQuoteButton" type="submit">
                Submit New Quote
              </button>
            </form>
          )}
        </div>
      </div>
      <div>
        <h2>Create a new genre!</h2>
        <div>
          <h3>
            Give a name for your new genre, as well as a fitting quote to start
            it off!
          </h3>
          <div>
            <form onSubmit={handleNewGenre}>
              <div>
                <label>
                  Name Your New Genre Here:
                  <input
                    required
                    name="newGenre"
                    type="text"
                    placeholder="New Genre"
                  />
                </label>
              </div>
              <div>
                <label>
                  Type Your New Genre's First Quote Here:
                  <input
                    required
                    name="newGenreQuote"
                    type="text"
                    placeholder="First Quote for New Genre"
                  />
                </label>
              </div>
              <button id="newGenreButton" name="newGenreButton" type="submit">
                Submit New Genre
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGenreAndQuote;
