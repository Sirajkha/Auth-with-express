const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGO_URL || "mongodb://localhost:27017/sigmaone";
const databaseConnect = async () => {
  mongoose
    .connect(MONGODB_URL) 
    .then((conn) => console.log(`connected to DB: ${conn.connection.host}`))
    .catch((err) => console.log(err.message));
};

module.exports = databaseConnect;
