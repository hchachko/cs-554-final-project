const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const data = require("../data");
const genresData = data.genres;

router.get("/getGenres", async (req, res) => {
  try {
    let genres = await genresData.getGenres();
    res.json(genres);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

router.get("/getQuote/:genre", async (req, res) => {
  if (!req.params.genre) {
    return res.status(400).json({error: "Genre needed"});
  }
  let genre = req.params.genre;
  if (typeof genre !== "string") {
    return res.status(400).json({error: "Genre must be of type string"});
  } else if (genre.trim().length === 0) {
    return res.status(400).json({error: "Genre must not be all spaces"});
  }
  genre = genre.trim();
  try {
    let randomQuote = await genresData.getQuote(genre);
    res.json(randomQuote);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

router.post("/newQuote", async (req, res) => {
  if (!req.body.genre) {
    return res.status(400).json({error: "Genre needed"});
  }
  if (!req.body.newQuote) {
    return res.status(400).json({error: "New Quote needed"});
  }
  let genre = req.body.genre;
  let newQuote = req.body.newQuote;
  if (typeof genre !== "string") {
    return res.status(400).json({error: "Genre must be of type string"});
  } else if (genre.trim().length === 0) {
    return res.status(400).json({error: "Genre must not be all spaces"});
  }
  if (typeof newQuote !== "string") {
    return res.status(400).json({error: "New Quote must be of type string"});
  } else if (newQuote.trim().length === 0) {
    return res.status(400).json({error: "New Quote must not be all spaces"});
  } else if (newQuote.trim().length < 30) {
    return res.status(400).json({error: "New Quote must be at least 30 characters"});
  }
  genre = genre.trim();
  newQuote = newQuote.trim();

  try {
    let createQuote = await genresData.createQuote(genre, newQuote);
    res.json({quote: createQuote});
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
}); 

router.post("/newGenre", async (req, res) => {
  if (!req.body.newGenre) {
    return res.status(400).json({error: "Genre needed"});
  }
  if (!req.body.newGenreQuote) {
    return res.status(400).json({error: "New Quote needed"});
  }
  let genre = req.body.newGenre;
  let quote = req.body.newGenreQuote;
  if (typeof genre !== "string") {
    return res.status(400).json({error: "Genre must be of type string"});
  } else if (genre.trim().length === 0) {
    return res.status(400).json({error: "Genre must not be all spaces"});
  }
  if (typeof quote !== "string") {
    return res.status(400).json({error: "New Quote must be of type string"});
  } else if (quote.trim().length === 0) {
    return res.status(400).json({error: "New Quote must not be all spaces"});
  } else if (quote.trim().length < 30) {
    return res.status(400).json({error: "New Quote must be at least 30 characters"});
  }
  genre = genre.trim();
  quote = quote.trim();

  try {
    let createGenre = await genresData.createGenre(genre);
    let createQuote = await genresData.createQuote(genre, quote);
    res.json({quote: createQuote, genre: createGenre});
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
});

module.exports = router;