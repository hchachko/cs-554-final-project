const users = require("./data/users");
const genres = require("./data/genres");

async function main() {
  // const user1 = await users.createUser("test1", "test123", "test1@gmail.com");
  // console.log(user1);
  // const update1 = await users.updateStats("test1", 200, false);
  // console.log(await users.getTopUsers());

  // console.log(await genres.createGenre("Music"));
  console.log(
    await genres.createQuote("Music", "Test quote here blah blah...")
  );
}

main();
