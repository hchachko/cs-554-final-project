const users = require("./data/users");

async function main() {
  const user1 = await users.createUser("test1", "test123", "test1@gmail.com");
  console.log(user1);
}

main();
