import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { initDB, savePrediction, getHistory, getStats } from "./backend/db.ts";
import { predictYield, trainModel, getModelStats } from "./backend/ml.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB and Train Model
  await initDB();
  console.log("Database initialized");
  await trainModel();
  console.log("Model trained");

  // API Routes
  app.post("/api/predict", async (req, res) => {
    try {
      const input = req.body;
      const result = await predictYield(input);
      
      // Save to history
      await savePrediction({
        ...input,
        predicted_yield: result.yield,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      });

      res.json(result);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(500).json({ error: "Failed to predict yield" });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const history = await getHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await getStats();
      const modelStats = getModelStats();
      res.json({ ...stats, model: modelStats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
