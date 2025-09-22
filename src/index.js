import dotenv from "dotenv";
import { app } from "./src/app.js";
import connectDB from "./src/db/index.js";

dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`⚙️ Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!", err);
    process.exit(1);
  });