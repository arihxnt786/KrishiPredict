import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PredictionInput, PredictionResult } from "@/src/types";
import { Sprout, Loader2, Download, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const states = ["Maharashtra", "Punjab", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Gujarat", "Haryana", "Madhya Pradesh"];
const crops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Pulses", "Groundnut"];
const seasons = ["Kharif", "Rabi", "Summer", "Whole Year"];

export default function PredictionForm({ onPredictSuccess }: { onPredictSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState<PredictionInput>({
    state: "Maharashtra",
    district: "",
    crop: "Rice",
    season: "Kharif",
    area: 1,
    rainfall: 1000,
    fertilizer: 100,
    pesticide: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
      onPredictSuccess();
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("KrishiPredict - Yield Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    const tableData = [
      ["Field", "Value"],
      ["State", formData.state],
      ["District", formData.district],
      ["Crop", formData.crop],
      ["Season", formData.season],
      ["Area", `${formData.area} ha`],
      ["Rainfall", `${formData.rainfall} mm`],
      ["Fertilizer", `${formData.fertilizer} kg/ha`],
      ["Pesticide", `${formData.pesticide} kg/ha`],
      ["Predicted Yield", `${result.yield} tons/ha`],
      ["Confidence", `${(result.confidence * 100).toFixed(1)}%`]
    ];

    (doc as any).autoTable({
      startY: 40,
      head: [["Parameter", "Details"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50] }
    });

    doc.text("Smart Suggestions:", 20, (doc as any).lastAutoTable.finalY + 10);
    result.suggestions.forEach((s, i) => {
      doc.text(`- ${s}`, 25, (doc as any).lastAutoTable.finalY + 20 + (i * 10));
    });

    doc.save(`KrishiPredict_${formData.crop}_${Date.now()}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sprout className="w-6 h-6" />
            New Prediction
          </CardTitle>
          <CardDescription>Enter field details to estimate crop yield</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(v) => setFormData({...formData, state: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input 
                  placeholder="e.g. Pune" 
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Crop Type</Label>
                <Select 
                  value={formData.crop} 
                  onValueChange={(v) => setFormData({...formData, crop: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Season</Label>
                <Select 
                  value={formData.season} 
                  onValueChange={(v) => setFormData({...formData, season: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area (Hectares)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Rainfall (mm)</Label>
                <Input 
                  type="number" 
                  value={formData.rainfall}
                  onChange={(e) => setFormData({...formData, rainfall: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fertilizer (kg/ha)</Label>
                <Input 
                  type="number" 
                  value={formData.fertilizer}
                  onChange={(e) => setFormData({...formData, fertilizer: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pesticide (kg/ha)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={formData.pesticide}
                  onChange={(e) => setFormData({...formData, pesticide: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              {loading ? "Processing..." : "Predict Yield"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-primary-foreground/80 uppercase tracking-widest text-sm font-semibold">Predicted Yield</p>
                <h2 className="text-6xl font-bold">{result.yield} <span className="text-2xl font-normal">tons/ha</span></h2>
                <div className="flex justify-center gap-8 pt-4">
                  <div>
                    <p className="text-xs opacity-70">Confidence</p>
                    <p className="text-xl font-bold">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-px bg-primary-foreground/20" />
                  <div>
                    <p className="text-xs opacity-70">Avg. Regional Yield</p>
                    <p className="text-xl font-bold">{result.avgYield} <span className="text-xs font-normal">tons/ha</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-6" onClick={downloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report (PDF)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full border-2 border-dashed rounded-xl border-muted p-12 text-center text-muted-foreground">
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Fill the form and click predict to see results here</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
