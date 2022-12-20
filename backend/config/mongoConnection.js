const MongoClient = require("mongodb").MongoClient;
const settings = {
  mongoConfig: {
    serverUrl:
      "mongodb+srv://cs554:CS554Project@cluster0.knbyoys.mongodb.net/?retryWrites=true&w=majority",
    database: "CS554-Final-Project",
  },
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl, {
      useNewUrlParser: true,
    });
    _db = await _connection.db(mongoConfig.database);
  }

  return _db;
};
