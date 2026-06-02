require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_DB_URI;

if (!uri) {
  console.error("❌ MONGO_DB_URI is not set in .env file");
  process.exit(1);
}

console.log("Testing connection to MongoDB...");
console.log("URI Format Check:", uri.replace(/:([^:@]+)@/, ':****@')); // Hides password in logs

mongoose.connect(uri)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ FAILED:", err.message);
    process.exit(1);
  });
