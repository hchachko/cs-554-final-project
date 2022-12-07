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
// -------------------------- Example Code -------------------------------- //

//getAllSweets
async function getAllSweets() {
  const sweetsCollection = await sweets();
  const sweetsList = await sweetsCollection.find({}).toArray();

  if (sweetsList.length === 0) {
    throw `Error: No sweets are available.`;
  }

  for (i = 0; i < sweetsList.length; i++) {
    sweetsList[i]._id = sweetsList[i]._id.toString();
  }

  return sweetsList;
}

//getSweetById
async function getSweetById(id) {
  if (!id || typeof id != "string") {
    throw "Error: Invalid sweet ID provided.";
  }

  const sweetsCollection = await sweets();

  const sweetExists = await sweetsCollection.findOne({
    _id: ObjectId(id),
  });

  if (!sweetExists) {
    throw "Error: Sweet not found.";
  } else {
    return sweetExists;
  }
}

//updateSweet

async function updateSweet(sweetID, newSweetText, newSweetMood) {
  if (
    !newSweetText ||
    typeof newSweetText != "string" ||
    !newSweetMood ||
    typeof newSweetMood != "string" ||
    !sweetID ||
    typeof sweetID != "string"
  ) {
    throw "Error: Invalid sweet parameters provided.";
  }

  const sweetsCollection = await sweets();

  sweetID = ObjectId(sweetID);
  const newSweet = {
    sweetText: newSweetText,
    sweetMood: newSweetMood,
  };

  const updatedData = await sweetsCollection.updateOne(
    { _id: sweetID },
    { $set: newSweet }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: Sweet update was unsuccessful.";
  }

  return await getSweetById(sweetID.toString());
}

//deleteReplyById

async function deleteReply(sweetId, replyId, userId) {
  const sweetsCollection = await sweets();
  const sweet = await sweetsCollection.findOne({ _id: ObjectId(sweetId) });
  const replies = sweet["replies"];

  if (replies.length === 0) {
    throw "Error: There are no replies for this sweet.";
  }

  let obj = replies.find((o) => o["_id"].toString() === replyId);
  if (obj["userThatPostedReply"]["_id"].toString() === userId) {
    const updatedData = await sweetsCollection.updateOne(
      { _id: ObjectId(sweetId) },
      { $pull: { replies: { _id: ObjectId(replyId) } } },
      false,
      true
    );
    if (updatedData.modifiedCount === 0) {
      throw "Error: Sweet was not updated successfully.";
    }
    return getSweetById(sweetId.toString());
  } else {
    throw "Error: You do not have permission to delete the specified reply.";
  }
}

//likeSweet
async function likeSweet(sweetId, userId) {
  const sweetsCollection = await sweets();
  const sweet = await sweetsCollection.findOne({ _id: ObjectId(sweetId) });

  if (!sweet) {
    throw "Error: Could not find specified sweet.";
  }

  if (sweet["likes"].includes(userId)) {
    sweet["likes"].splice(sweet["likes"].indexOf(userId), 1);
  } else {
    sweet["likes"].push(userId);
  }

  const updatedData = await sweetsCollection.updateOne(
    { _id: ObjectId(sweetId) },
    { $set: sweet }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: Like was not added successfully.";
  }

  return sweet;
}

module.exports = {
  createGenre,
  createQuote,
  validateGenre,
  validateQuote,
};
