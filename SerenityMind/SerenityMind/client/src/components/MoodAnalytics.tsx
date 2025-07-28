import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Smile, Trophy, TrendingUp } from "lucide-react";

export default function MoodAnalytics() {
  const [timeRange, setTimeRange] = useState("7");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/mood-analytics", { days: timeRange }],
    retry: false,
  });

  useEffect(() => {
    if (analytics && canvasRef.current && typeof window !== "undefined") {
      import("chart.js/auto").then((Chart) => {
        const ctx = canvasRef.current!.getContext("2d");
        if (!ctx) return;

        // Destroy existing chart
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Prepare data for chart
        const entries = analytics?.entries || [];
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const entry = entries.find((e: any) => 
            new Date(e.createdAt).toISOString().split('T')[0] === dateStr
          );
          
          last7Days.push({
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            value: entry ? entry.moodScore : null
          });
        }

        chartRef.current = new Chart.Chart(ctx, {
          type: "line",
          data: {
            labels: last7Days.map(d => d.label),
            datasets: [{
              label: "Mood Score",
              data: last7Days.map(d => d.value),
              borderColor: "hsl(207, 90%, 54%)",
              backgroundColor: "hsla(207, 90%, 54%, 0.1)",
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "hsl(207, 90%, 54%)",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4,
              spanGaps: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                min: 0,
                max: 10,
                grid: {
                  color: "rgba(0,0,0,0.1)"
                },
                ticks: {
                  color: "#64748b"
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: "#64748b"
                }
              }
            }
          }
        });
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [analytics]);

  const getBestDay = () => {
    if (!analytics?.entries || !Array.isArray(analytics.entries) || analytics.entries.length === 0) return "N/A";
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayScores: { [key: string]: { total: number; count: number } } = {};
    
    analytics.entries.forEach((entry: any) => {
      const day = dayNames[new Date(entry.createdAt).getDay()];
      if (!dayScores[day]) dayScores[day] = { total: 0, count: 0 };
      dayScores[day].total += entry.moodScore;
      dayScores[day].count += 1;
    });
    
    let bestDay = "N/A";
    let bestAverage = 0;
    
    Object.entries(dayScores).forEach(([day, scores]) => {
      const average = scores.total / scores.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestDay = day;
      }
    });
    
    return bestDay;
  };

  const getTrendText = () => {
    if (!analytics?.moodTrend) return "No data";
    
    switch (analytics.moodTrend) {
      case "improving":
        return "↗ Improving";
      case "declining":
        return "↘ Declining";
      case "stable":
        return "→ Stable";
      default:
        return "→ Stable";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mood Analytics</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === "7" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("7")}
              className={timeRange === "7" ? "bg-primary text-white" : ""}
            >
              Week
            </Button>
            <Button
              variant={timeRange === "30" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("30")}
              className={timeRange === "30" ? "bg-primary text-white" : ""}
            >
              Month
            </Button>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="mb-6 h-48">
          <canvas ref={canvasRef}></canvas>
        </div>
        
        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-secondary from-opacity-10 to-secondary to-opacity-20 dark:from-secondary dark:from-opacity-20 dark:to-secondary dark:to-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-medium">Average Mood</p>
                <p className="text-2xl font-bold text-secondary">
                  {analytics?.averageMood ? `${analytics.averageMood.toFixed(1)}/10` : "N/A"}
                </p>
              </div>
              <Smile className="text-secondary text-2xl" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-accent/10 to-accent/20 dark:from-accent/20 dark:to-accent/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent font-medium">Best Day</p>
                <p className="text-lg font-bold text-accent">{getBestDay()}</p>
              </div>
              <Trophy className="text-accent text-2xl" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary from-opacity-10 to-primary to-opacity-20 dark:from-primary dark:from-opacity-20 dark:to-primary dark:to-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Trend</p>
                <p className="text-lg font-bold text-primary">{getTrendText()}</p>
              </div>
              <TrendingUp className="text-primary text-2xl" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
