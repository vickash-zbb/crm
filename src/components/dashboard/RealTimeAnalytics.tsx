import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

interface RealTimeDataPoint {
  time: string;
  tasks: number;
  cost: number;
}

export const RealTimeAnalytics = () => {
  const [data, setData] = useState<RealTimeDataPoint[]>([]);
  const [currentStats, setCurrentStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    totalCost: 0,
    avgCompletionTime: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const generateData = () => {
      const now = new Date();
      const newData: RealTimeDataPoint[] = [];
      
      for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() - (9 - i) * 60000);
        newData.push({
          time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`,
          tasks: Math.floor(Math.random() * 20) + 5,
          cost: Math.floor(Math.random() * 5000) + 1000
        });
      }
      
      return newData;
    };

    const interval = setInterval(() => {
      setData(generateData());
      
      // Update current stats
      setCurrentStats({
        activeTasks: Math.floor(Math.random() * 15) + 5,
        completedTasks: Math.floor(Math.random() * 10) + 1,
        totalCost: Math.floor(Math.random() * 10000) + 5000,
        avgCompletionTime: Math.floor(Math.random() * 48) + 12
      });
    }, 5000);

    // Initial data
    setData(generateData());
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-card">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Real-time Stats */}
        <div className="md:w-1/3">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Dashboard</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-bold text-foreground">{currentStats.activeTasks}</p>
            </div>
            <div className="bg-success/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-foreground">{currentStats.completedTasks}</p>
            </div>
            <div className="bg-warning/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground">₹{currentStats.totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-accent/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Time</p>
              <p className="text-2xl font-bold text-foreground">{currentStats.avgCompletionTime}h</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Live data</span> - Updates every 5 seconds
              </p>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="md:w-2/3">
          <h4 className="text-md font-medium text-foreground mb-4">Task Activity (Last 10 Minutes)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};