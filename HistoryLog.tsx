import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PredictionHistory } from "@/src/types";
import { History, Calendar, MapPin, Wheat, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function HistoryLog({ refreshTrigger }: { refreshTrigger: number }) {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [refreshTrigger]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Prediction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px]"><Calendar className="w-4 h-4 inline mr-2" />Date</TableHead>
                <TableHead><MapPin className="w-4 h-4 inline mr-2" />Location</TableHead>
                <TableHead><Wheat className="w-4 h-4 inline mr-2" />Crop</TableHead>
                <TableHead className="text-right"><BarChart3 className="w-4 h-4 inline mr-2" />Predicted Yield</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading history...</TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No predictions yet</TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      {format(new Date(item.timestamp), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.district}</span>
                        <span className="text-xs text-muted-foreground">{item.state}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                        {item.crop}
                      </Badge>
                      <span className="ml-2 text-xs text-muted-foreground">({item.season})</span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {item.predicted_yield.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">t/ha</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
