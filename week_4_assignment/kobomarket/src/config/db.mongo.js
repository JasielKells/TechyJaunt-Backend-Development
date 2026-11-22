const mongoose = require('mongoose');
const cfg = require('./index');
module.exports = async function connectMongo() {
  await mongoose.connect(cfg.mongoUri);
  return mongoose;
};