import express from "express";
import cors from "cors";
import "dotenv/config";
import passport from "./config/passport.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import apiRouter from "./routes/api.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;