const dbConnection = require('./config/mongoConnection');
const users = require("./data/users");
const genres = require("./data/genres");

async function main() {
    const db = await dbConnection.dbConnection();
  //   // const user1 = await users.createUser("test1", "test123", "test1@gmail.com");
  //   // console.log(user1);
  //   // const update1 = await users.updateStats("test1", 200, false);
  //   // console.log(await users.getTopUsers());
  //   // console.log(await users.deleteUser("test1"));
  //   // console.log(await genres.createGenre("Music"));
  //   // console.log(await genres.createGenre("Sports"));
  //   // console.log(await genres.createGenre("Literature"));
  //   // console.log(await genres.createGenre("History"));
  //   // console.log(await genres.createQuote("Sports", "Quote 1"));
  //   // console.log(await genres.createQuote("Sports", "Quote 2"));
  //   // console.log(await genres.createQuote("Sports", "Quote 3"));
  //   // console.log(await genres.createQuote("Sports", "Quote 4"));
  //   // console.log(await genres.validateGenre("Sports", true));
  //   // console.log(await genres.validateGenre("History", true));
  //   // console.log(await genres.validateQuote("Sports", "Quote 1", true));
  //   // console.log(await genres.validateQuote("Sports", "Quote 2", true));
  //   // console.log(await genres.validateQuote("Sports", "Quote 3", true));
  //   // console.log(await genres.validateQuote("Sports", "Quote 4", true));
  //   // console.log(await genres.getGenres());
  //   // console.log(await genres.getQuote("Sports"));
  //   // console.log(await genres.getQuote("Sports"));
  //   // console.log(await genres.getQuote("Sports"));
  //   // console.log(await genres.getQuote("Sports"));
  //console.log(await genres.createGenre("Default"));
  //console.log(await genres.createQuote("Default", "I'm selfish, impatient, and a little insecure. I make mistakes, I am out of control, and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best."));
  //console.log(await genres.createQuote("Default", "Do you wish me a good morning, or mean that it is a good morning whether I want it or not; or that you feel good this morning; or that it is a morning to be good on?"));
  //console.log(await genres.createQuote("Default", "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."));
  //console.log(await genres.createQuote("Default", "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind."));
  //console.log(await genres.createQuote("Default", "You may say I'm a dreamer, but I'm not the only one. I hope someday you'll join us. And the world will live as one."));
  console.log(await genres.getQuote("Default"));
  console.log(await genres.getGenres());
  await dbConnection.closeConnection();
}

main();
