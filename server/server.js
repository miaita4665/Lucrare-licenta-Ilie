const mongoose = require('mongoose');
require('dotenv').config();
const DB_LOCAL = process.env.DB_LOCAL

console.log(' Connecting to MongoDB...');
console.log('URI:', DB_LOCAL.replace(/password123/g, '******'));

mongoose.connect(DB_LOCAL)
  .then(() => console.log(' MongoDB Connected Successfully'))
  .catch(err => {
    console.error(' MongoDB Connection Error:');
    console.error(err.message);
  });