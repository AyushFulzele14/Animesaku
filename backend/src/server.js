const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
