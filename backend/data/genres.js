const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const sweets = mongoCollections.genres;
let { ObjectId } = require("mongodb");

//Type checking
function checkSweetData(sweetText, sweetMood, userId, username) {
  if (!sweetText || !sweetMood || !userId || !username) {
    throw "You must provide sweetText, sweetMood, and be logged in to create a new sweet";
  } else if (typeof sweetText != "string" || typeof sweetMood != "string") {
    throw "SweetText and sweetMood must be of type string";
  } else if (sweetText.trim().length == 0 || sweetMood.trim().length == 0) {
    throw "Error: SweetText and sweetMood must not be be empty.";
  }
}

//createSweet
async function createSweet(sweetText, sweetMood, userId, username) {
  checkSweetData(sweetText, sweetMood, userId, username);

  let moods = [
    "Happy",
    "Sad",
    "Angry",
    "Excited",
    "Surprised",
    "Loved",
    "Blessed",
    "Greatful",
    "Blissful",
    "Silly",
    "Chill",
    "Motivated",
    "Emotional",
    "Annoyed",
    "Lucky",
    "Determined",
    "Bored",
    "Hungry",
    "Disappointed",
    "Worried",
  ];

  if (!moods.includes(sweetMood)) {
    throw "Error: Invalid mood selected.";
  }

  const sweetsCollection = await sweets();

  let newSweet = {
    sweetText: sweetText,
    sweetMood: sweetMood,
    userThatPosted: {
      _id: ObjectId(userId),
      username: username,
    },
    replies: [],
    likes: [],
  };

  const insertInfo = await sweetsCollection.insertOne(newSweet);
  if (insertInfo.insertedCount === 0)
    throw "Error: Could not create sweet successfully.";

  const createdSweet = await getSweetById(insertInfo.insertedId.toString());

  createdSweet._id = createdSweet._id.toString();

  return createdSweet;
}

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

//addReply

async function addReply(sweetId, replyText, userId, username) {
  if (
    !sweetId ||
    typeof sweetId != "string" ||
    !replyText ||
    typeof replyText != "string" ||
    !userId ||
    typeof userId != "string" ||
    !username ||
    typeof username != "string"
  ) {
    throw "Error: Invalid sweet parameters provided.";
  }

  const sweetsCollection = await sweets();
  const sweet = await sweetsCollection.findOne({ _id: ObjectId(sweetId) });

  if (!sweet) {
    throw "Error: Could not find specified sweet.";
  }

  let reply = {
    _id: new ObjectId(),
    userThatPostedReply: {
      _id: ObjectId(userId),
      username: username,
    },
    reply: replyText,
  };

  sweet["replies"].push(reply);

  const updatedData = await sweetsCollection.updateOne(
    { _id: ObjectId(sweetId) },
    { $set: sweet }
  );

  if (updatedData.modifiedCount == 0) {
    throw "Error: Reply was not added successfully.";
  }

  return sweet;
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
  createSweet,
  checkSweetData,
  getSweetById,
  updateSweet,
  getAllSweets,
  addReply,
  deleteReply,
  likeSweet,
};
