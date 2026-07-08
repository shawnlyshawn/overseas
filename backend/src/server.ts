// DB 연결과 서버 실행 담당
import mongoose from "mongoose";
import app from "./app";

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/overseas";

async function startServer(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

void startServer();