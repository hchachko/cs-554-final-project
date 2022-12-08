const mongoCollections = require("../config/mongoCollections");
const genres = mongoCollections.genres;
let { ObjectId } = require("mongodb");

async function createGenre(genre) {
  if (!genre || typeof genre != "string" || genre.trim().length == 0) {
    throw "You must provide a valid genre";
  }

  const genresCollection = await genres();

  const duplicateGenre = await genresCollection.findOne({
    genre: genre,
  });

  if (duplicateGenre) {
    throw "Error: An genre already exists for this type.";
  }

  let newGenre = {
    genre: genre,
    quotes: [],
    status: false,
  };

  const insertInfo = await genresCollection.insertOne(newGenre);
  if (insertInfo.insertedCount === 0)
    throw "Error: Could not create genre successfully.";

  const createdGenre = await genresCollection.findOne({
    genre: genre,
  });

  return createdGenre;
}

async function createQuote(genre, quote) {
  if (
    !genre ||
    typeof genre != "string" ||
    genre.trim().length == 0 ||
    !quote ||
    typeof quote != "string" ||
    quote.trim().length == 0
  ) {
    throw "Error: Invalid genre parameters provided.";
  }

  const genresCollection = await genres();

  let genreObj = await genresCollection.findOne({ genre: genre });

  if (!genreObj) {
    throw "Error: Could not find specified genre.";
  }

  const quotes = genreObj["quotes"];
  let obj = quotes.find((o) => o["quote"] === quote);
  if (obj) {
    throw "Error: Quote already exists for this genre.";
  }

  let newQuote = {
    _id: new ObjectId(),
    quote: quote,
    status: false,
  };

  genreObj["quotes"].push(newQuote);

  const updatedData = await genresCollection.updateOne(
    { genre: genre },
    { $set: genreObj }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: Quote was not created successfully.";
  }

  return genreObj;
}

async function validateGenre(genre, accept) {
  if (
    !genre ||
    typeof genre != "string" ||
    genre.trim().length == 0 ||
    typeof accept != "boolean"
  ) {
    throw "Error: Invalid genre parameters provided.";
  }

  const genresCollection = await genres();

  let genreObj = await genresCollection.findOne({ genre: genre });

  if (!genreObj) {
    throw "Error: Could not find specified genre.";
  }

  if (accept === true) {
    if (genreObj["status"] === true) {
      throw "Error: Genre has already been validated.";
    } else {
      genreObj["status"] = true;
      const updatedData = await genresCollection.updateOne(
        { genre: genre },
        { $set: genreObj }
      );
      if (updatedData.modifiedCount == 0) {
        throw "Error: Quote was not created successfully.";
      }
      return genreObj;
    }
  } else {
    const deletedData = await genresCollection.deleteOne({ genre: genre });
    if (deletedData.modifiedCount == 0) {
      throw "Error: Quote was not created successfully.";
    }
    return genreObj;
  }
}

async function validateQuote(genre, quote, accept) {
  if (
    !genre ||
    typeof genre != "string" ||
    genre.trim().length == 0 ||
    !quote ||
    typeof quote != "string" ||
    quote.trim().length == 0 ||
    typeof accept != "boolean"
  ) {
    throw "Error: Invalid genre/quote parameters provided.";
  }

  const genresCollection = await genres();
  let genreObj = await genresCollection.findOne({ genre: genre });

  if (!genreObj) {
    throw "Error: Could not find specified genre.";
  }

  const quotes = genreObj["quotes"];

  if (quotes.length === 0) {
    throw "Error: There are no quotes for this genre.";
  }

  let obj = quotes.find((o) => o["quote"] === quote);

  if (!obj) {
    throw "Error: Could not find specified quote.";
  }

  if (accept === false) {
    const updatedData = await genresCollection.updateOne(
      { genre: genre },
      { $pull: { quotes: { quote: quote } } },
      false,
      true
    );
    return "Quote was deleted successfully.";
  } else {
    if (obj["status"] === true) {
      throw "Error: Quote has already been validated.";
    } else {
      obj["status"] = true;
      const updatedData = await genresCollection.updateOne(
        { genre: genre, "quotes.quote": quote },
        { $set: { "quotes.$.status": true } }
      );
      if (updatedData.modifiedCount == 0) {
        throw "Error: Quote was not updated successfully.";
      }
      return "Quote was successfully validated.";
    }
  }
}

//Get all genres with a status of true
async function getGenres() {
  const genresCollection = await genres();
  const genreData = await genresCollection.find({ status: true }).toArray();

  if (!genreData || genreData.length === 0) {
    throw "Error: Could not find any validated genres.";
  }

  let genreList = [];
  for (genre of genreData) {
    genreList.push(genre["genre"]);
  }

  return genreList;
}

//Get a random quote with a status of true from a genre
async function getQuote(genre) {
  if (!genre || typeof genre != "string" || genre.trim().length == 0) {
    throw "Error: Invalid genre parameters provided.";
  }

  const genresCollection = await genres();
  const genreData = await genresCollection.findOne({ genre: genre });

  if (!genreData) {
    throw "Error: Could not find specified genre.";
  }

  const quotes = genreData["quotes"];

  if (quotes.length === 0) {
    throw "Error: There are no quotes for this genre.";
  }

  let quoteList = [];
  for (quote of quotes) {
    if (quote["status"] === true) {
      quoteList.push(quote["quote"]);
    }
  }

  if (quoteList.length === 0) {
    throw "Error: There are no validated quotes for this genre.";
  }

  let randomQuote = quoteList[Math.floor(Math.random() * quoteList.length)];

  return randomQuote;
}
module.exports = {
  createGenre,
  createQuote,
  validateGenre,
  validateQuote,
  getGenres,
  getQuote,
};
