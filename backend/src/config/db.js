const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  const uri = env.mongoUri || "mongodb://localhost:27017/anime_store";
  
  try {
    console.log(`Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    const fallbackUri = "mongodb://localhost:27017/anime_store";
    if (uri !== fallbackUri) {
      console.warn(`\n[Database Warning]: Failed to connect to primary database: ${error.message}`);
      console.log(`Retrying with local fallback database: ${fallbackUri}`);
      try {
        await mongoose.connect(fallbackUri);
        console.log("MongoDB connected successfully to local fallback");
      } catch (fallbackError) {
        console.error(`Local fallback database connection failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
