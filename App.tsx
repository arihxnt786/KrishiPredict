import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Sprout, History, Info, Leaf, Menu, X } from "lucide-react";
import Dashboard from "./components/Dashboard";
import PredictionForm from "./components/PredictionForm";
import HistoryLog from "./components/HistoryLog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handlePredictSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Prediction generated successfully!", {
      description: "The result has been saved to your history.",
    });
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "predict", label: "Predict Yield", icon: Sprout },
    { id: "history", label: "History Log", icon: History },
    { id: "about", label: "Model Info", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfb] flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-primary/10 p-6 space-y-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary rounded-xl text-white">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">KrishiPredict</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-primary/10">
          <div className="bg-primary/5 rounded-2xl p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Farmer Support</p>
            <p className="text-sm text-muted-foreground">Need help with your crops? Contact local kisan helpline.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-primary/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Leaf className="w-5 h-5" />
          <span className="font-bold">KrishiPredict</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-muted-foreground">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg ${
                    activeTab === item.id ? "bg-primary text-white" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 overflow-y-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <p className="text-muted-foreground">
            {activeTab === "dashboard" && "Overview of your agricultural predictions and model performance."}
            {activeTab === "predict" && "Input your field parameters to get real-time yield estimates."}
            {activeTab === "history" && "Review your past predictions and historical data."}
            {activeTab === "about" && "Technical details about the KrishiPredict ML model."}
          </p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <Dashboard refreshTrigger={refreshTrigger} />}
            {activeTab === "predict" && <PredictionForm onPredictSuccess={handlePredictSuccess} />}
            {activeTab === "history" && <HistoryLog refreshTrigger={refreshTrigger} />}
            {activeTab === "about" && (
              <div className="max-w-3xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Model</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-stone">
                    <p>
                      KrishiPredict uses a <strong>Random Forest Regression</strong> model trained on a comprehensive dataset of Indian agriculture. 
                      The model considers multiple environmental and human factors to provide accurate yield estimates.
                    </p>
                    <h3>Key Features</h3>
                    <ul>
                      <li><strong>Categorical Encoding:</strong> Handles State, Crop, and Season variations.</li>
                      <li><strong>Environmental Factors:</strong> Incorporates annual rainfall patterns.</li>
                      <li><strong>Input Optimization:</strong> Analyzes fertilizer and pesticide usage.</li>
                      <li><strong>Confidence Scoring:</strong> Provides a reliability metric for every prediction.</li>
                    </ul>
                    <h3>Data Source</h3>
                    <p>
                      The model is currently running on a high-fidelity synthetic dataset modeled after the 
                      <em>Crop Yield Prediction Dataset</em> from Kaggle, specifically tailored for Indian states and crops.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
