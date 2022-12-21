const dbConnection = require('./config/mongoConnection');
const users = require("./data/users");
const genres = require("./data/genres");

async function main() {
  const db = await dbConnection.dbConnection();
  await db.dropDatabase();

  console.log(await genres.createGenre("Default"));
  console.log(await genres.createQuote("Default", "I'm selfish, impatient, and a little insecure. I make mistakes, I am out of control, and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best."));
  console.log(await genres.createQuote("Default", "Do you wish me a good morning, or mean that it is a good morning whether I want it or not; or that you feel good this morning; or that it is a morning to be good on?"));
  console.log(await genres.createQuote("Default", "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."));
  console.log(await genres.createQuote("Default", "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind."));
  console.log(await genres.createQuote("Default", "You may say I'm a dreamer, but I'm not the only one. I hope someday you'll join us. And the world will live as one."));

  console.log(await users.createUser("test100", "test100@yahoo.com", false)); // password is test100
  console.log(await users.createUser("test200", "test200@yahoo.com", false)); // password is test200
  console.log(await users.createUser("test300", "test300@yahoo.com", false)); // test300, etc.
  console.log(await users.createUser("test400", "test400@yahoo.com", false));
  console.log(await users.createUser("test500", "test500@yahoo.com", false));

  await users.updateStats("test100@yahoo.com", 76, false);
  await users.updateStats("test100@yahoo.com", 57, false);
  await users.updateStats("test100@yahoo.com", 89, true);
  await users.updateStats("test100@yahoo.com", 35, false);
  await users.updateStats("test100@yahoo.com", 55.02, false);

  await users.updateStats("test200@yahoo.com", 101.34, true);
  await users.updateStats("test200@yahoo.com", 112.25, true);
  await users.updateStats("test200@yahoo.com", 123.86, true);
  await users.updateStats("test200@yahoo.com", 98.53, false);
  await users.updateStats("test200@yahoo.com", 79.2, false);

  await users.updateStats("test300@yahoo.com", 19.2, false);
  await users.updateStats("test300@yahoo.com", 29.93, false);
  await users.updateStats("test300@yahoo.com", 35.67, false);
  await users.updateStats("test300@yahoo.com", 46, false);
  await users.updateStats("test300@yahoo.com", 22.3, false);

  await users.updateStats("test400@yahoo.com", 89.3, true);
  await users.updateStats("test400@yahoo.com", 86, false);
  await users.updateStats("test400@yahoo.com", 99.22, true);
  await users.updateStats("test400@yahoo.com", 105.44, true);
  await users.updateStats("test400@yahoo.com", 75, false);
  
  await users.updateStats("test500@yahoo.com", 69.69, false);
  await users.updateStats("test500@yahoo.com", 71, true);
  await users.updateStats("test500@yahoo.com", 42.20, false);
  await users.updateStats("test500@yahoo.com", 47.63, false);
  await users.updateStats("test500@yahoo.com", 77.79, true);

  await dbConnection.closeConnection();
}

main();
