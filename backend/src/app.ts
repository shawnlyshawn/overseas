import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/overseas";

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    message: "Backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not connected",
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("MongoDB connection error:", err);
  });