const users = require("./data/users");
const genres = require("./data/genres");

async function main() {
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

  console.log(users.resizeImage("./profile.png", 100, 100));
}

main();
