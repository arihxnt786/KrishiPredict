import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppStats } from "@/src/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Database, Target, Wheat, TrendingUp, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard({ refreshTrigger }: { refreshTrigger: number }) {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  const COLORS = ['#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Predictions</p>
              <h3 className="text-2xl font-bold">{stats?.totalPredictions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Model Accuracy</p>
              <h3 className="text-2xl font-bold">{(stats?.model.r2 || 0 * 100).toFixed(1)}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-700">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg. Yield</p>
              <h3 className="text-2xl font-bold">{(stats?.avgYield || 0).toFixed(2)} <span className="text-sm font-normal">t/ha</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">RMSE Score</p>
              <h3 className="text-2xl font-bold">{stats?.model.rmse}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Crops by Predicted Yield
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topCrops}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="crop" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="avg_yield" radius={[4, 4, 0, 0]}>
                  {stats?.topCrops.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">R² Score</span>
                <span className="font-bold">{stats?.model.r2}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(stats?.model.r2 || 0) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">MAE</span>
                <span className="font-bold">{stats?.model.mae}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(stats?.model.mae || 0) * 100}%` }} />
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The model is trained on a synthetic dataset representing Indian agricultural patterns. 
                Accuracy is measured using standard regression metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
