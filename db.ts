import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;

export async function initDB() {
  db = await open({
    filename: path.join(process.cwd(), "database.sqlite"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT,
      district TEXT,
      crop TEXT,
      season TEXT,
      area REAL,
      rainfall REAL,
      fertilizer REAL,
      pesticide REAL,
      predicted_yield REAL,
      confidence REAL,
      timestamp TEXT
    )
  `);
}

export async function savePrediction(data: any) {
  const { state, district, crop, season, area, rainfall, fertilizer, pesticide, predicted_yield, confidence, timestamp } = data;
  await db.run(
    `INSERT INTO predictions (state, district, crop, season, area, rainfall, fertilizer, pesticide, predicted_yield, confidence, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [state, district, crop, season, area, rainfall, fertilizer, pesticide, predicted_yield, confidence, timestamp]
  );
}

export async function getHistory() {
  return await db.all("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 50");
}

export async function getStats() {
  const totalPredictions = await db.get("SELECT COUNT(*) as count FROM predictions");
  const avgYield = await db.get("SELECT AVG(predicted_yield) as avg FROM predictions");
  const topCrops = await db.all(`
    SELECT crop, AVG(predicted_yield) as avg_yield 
    FROM predictions 
    GROUP BY crop 
    ORDER BY avg_yield DESC 
    LIMIT 5
  `);

  return {
    totalPredictions: totalPredictions.count,
    avgYield: avgYield.avg || 0,
    topCrops
  };
}
