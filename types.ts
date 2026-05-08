export interface PredictionInput {
  state: string;
  district: string;
  crop: string;
  season: string;
  area: number;
  rainfall: number;
  fertilizer: number;
  pesticide: number;
}

export interface PredictionResult {
  yield: number;
  confidence: number;
  suggestions: string[];
  avgYield: number;
}

export interface PredictionHistory extends PredictionInput {
  id: number;
  predicted_yield: number;
  confidence: number;
  timestamp: string;
}

export interface ModelStats {
  rmse: number;
  mae: number;
  r2: number;
}

export interface AppStats {
  totalPredictions: number;
  avgYield: number;
  topCrops: { crop: string; avg_yield: number }[];
  model: ModelStats;
}
