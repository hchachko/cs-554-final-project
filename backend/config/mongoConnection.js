const MongoClient = require("mongodb").MongoClient;
const settings = {
  mongoConfig: {
    serverUrl: "mongodb://127.0.0.1/",
    database: "CS554-Final-Project",
  },
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = {
  dbConnection: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(mongoConfig.serverUrl, {
        useNewUrlParser: true,
      });
      _db = await _connection.db(mongoConfig.database);
    }
  
    return _db;
  },
  closeConnection: () => {
    _connection.close();
  }
};
