const path = require("path");

// Load .env variables FIRST before anything else
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening for requests
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server is running at http://localhost:${PORT}`);
  });
});
