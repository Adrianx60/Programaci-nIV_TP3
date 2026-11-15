import express from "express";
import cors from "cors";
import "dotenv/config";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Las rutas de la API se montan acá (próximas etapas)

app.use(notFound);
app.use(errorHandler);

export default app;