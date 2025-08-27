import { Card } from "@/components/ui/card";
import { Building2, ClipboardCheck, Users, DollarSign, TrendingUp, Square, Calendar, CheckCircle, Ruler, BarChart3, Target, Maximize2, Minimize2, PieChart } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  filters?: any; // For future filter implementation
}

export const StatsCards = ({ filters }: StatsCardsProps) => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 mb-8">
        {/* Main cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6 bg-gradient-card border-0 shadow-card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detail cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-4 bg-gradient-card border-0 shadow-card animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
            </Card>
          ))}
        </div>

      </div>
    );
  }

  if (!stats) return null;

  const mainStats = [
    {
      title: "Total Colleges",
      value: stats.totalColleges.toString(),
      change: `${stats.activeColleges} active`,
      icon: Building2,
      color: "text-primary",
      trend: stats.activeColleges > 0 ? "up" : "neutral"
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      change: `${stats.completedTasks} completed`,
      icon: ClipboardCheck,
      color: "text-success",
      trend: stats.completedTasks > stats.pendingTasks ? "up" : "down"
    },
    {
      title: "Active Employees",
      value: stats.totalEmployees.toString(),
      change: "Estimated count",
      icon: Users,
      color: "text-warning",
      trend: "neutral"
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.totalCostAllTime / 100000).toFixed(1)}L`,
      change: `₹${stats.totalCostThisWeek.toLocaleString()} this week`,
      icon: DollarSign,
      color: "text-primary",
      trend: stats.totalCostThisWeek > 0 ? "up" : "neutral"
    }
  ];

  const detailStats = [
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      subtitle: "Awaiting Start",
      icon: Calendar,
      color: "text-orange-500",
      badge: "pending"
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks.toString(),
      subtitle: "Currently Active",
      icon: TrendingUp,
      color: "text-blue-500",
      badge: "active"
    },
    {
      title: "Completed",
      value: stats.completedTasks.toString(),
      subtitle: "Successfully Done",
      icon: CheckCircle,
      color: "text-green-500",
      badge: "completed"
    },
    {
      title: "With Dimensions",
      value: stats.entriesWithDimensions.toString(),
      subtitle: `${stats.completeDimensionPercentage.toFixed(1)}% Complete`,
      icon: Ruler,
      color: "text-indigo-500",
      badge: "measured"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                  <p className="text-sm text-muted-foreground">{stat.change}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-accent/10 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Stats Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {detailStats.map((stat, index) => (
          <Card key={index} className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-accent/10 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-xs">
                {stat.badge}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Info Bar */}
      <Card className="p-4 bg-gradient-card border-0 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-muted-foreground">Monthly Revenue: </span>
              <span className="font-semibold text-foreground">₹{stats.totalCostThisMonth.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Cost/Task: </span>
              <span className="font-semibold text-foreground">₹{stats.avgCostPerTask.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Area: </span>
              <span className="font-semibold text-foreground">{(stats.totalSquareFeet / 1000).toFixed(1)}K sq ft</span>
            </div>
            <div>
              <span className="text-muted-foreground">Measured: </span>
              <span className="font-semibold text-foreground">{stats.entriesWithDimensions}/{stats.totalTasks}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Small</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Large</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-muted-foreground text-xs">Live data</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
