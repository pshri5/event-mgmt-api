import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running" });
});

// Error handler middleware
app.use(errorHandler);

export { app };