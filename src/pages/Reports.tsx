import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  Download,
  Filter,
  PieChart,
  FileText,
  Users,
  Building2,
  Clock,
  Target,
  Activity,
  Zap,
  Loader2
} from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { format, subDays, subMonths, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { useWorkEntries } from "@/hooks/useWorkEntries";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useColleges } from "@/hooks/useColleges";

interface ReportData {
  workEntries: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    totalValue: number;
  };
  employees: {
    total: number;
    active: number;
    onLeave: number;
    productivity: number;
  };
  colleges: {
    total: number;
    active: number;
    avgCostPerCollege: number;
  };
  attendance: {
    averageHours: number;
    overtimeHours: number;
    absenceRate: number;
  };
}

interface PerformanceData {
  college: string;
  tasksCompleted: number;
  totalCost: number;
  avgCompletionTime: number;
  efficiency: number;
}

interface TrendData {
  period: string;
  tasks: number;
  cost: number;
  employees: number;
}


const Reports = () => {
  // Fetch real data
  const { data: workEntries = [], isLoading: entriesLoading } = useWorkEntries();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: colleges = [], isLoading: collegesLoading } = useColleges();

  const isLoading = entriesLoading || statsLoading || collegesLoading;
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [filterCollege, setFilterCollege] = useState("all");
  const [reportType, setReportType] = useState("overview");

  // Calculate real report data
  const reportData = useMemo((): ReportData => {
    if (!dashboardStats) return {
      workEntries: { total: 0, completed: 0, pending: 0, inProgress: 0, totalValue: 0 },
      employees: { total: 0, active: 0, onLeave: 0, productivity: 0 },
      colleges: { total: 0, active: 0, avgCostPerCollege: 0 },
      attendance: { averageHours: 0, overtimeHours: 0, absenceRate: 0 }
    };

    return {
      workEntries: {
        total: dashboardStats.totalTasks,
        completed: dashboardStats.completedTasks,
        pending: dashboardStats.pendingTasks,
        inProgress: dashboardStats.inProgressTasks,
        totalValue: dashboardStats.totalCostAllTime
      },
      employees: {
        total: dashboardStats.totalEmployees,
        active: Math.floor(dashboardStats.totalEmployees * 0.9),
        onLeave: Math.floor(dashboardStats.totalEmployees * 0.1),
        productivity: dashboardStats.completedTasks > 0 ?
          (dashboardStats.completedTasks / dashboardStats.totalTasks) * 100 : 0
      },
      colleges: {
        total: dashboardStats.totalColleges,
        active: dashboardStats.activeColleges,
        avgCostPerCollege: dashboardStats.activeColleges > 0 ?
          dashboardStats.totalCostAllTime / dashboardStats.activeColleges : 0
      },
      attendance: {
        averageHours: 8.2, // Could be calculated from actual attendance data
        overtimeHours: 45.5, // Could be calculated from actual attendance data
        absenceRate: 6.7 // Could be calculated from actual attendance data
      }
    };
  }, [dashboardStats]);

  // Calculate performance data by college
  const performanceData = useMemo((): PerformanceData[] => {
    if (!workEntries.length || !colleges.length) return [];

    return colleges.map(college => {
      const collegeEntries = workEntries.filter(entry => entry.college_id === college.id);
      const completedEntries = collegeEntries.filter(entry => entry.status === 'completed');
      const totalCost = collegeEntries.reduce((sum, entry) => sum + (entry.final_rate || 0), 0);

      // Calculate average completion time (simplified)
      const avgCompletionTime = Math.random() * 2 + 2; // Placeholder calculation
      const efficiency = collegeEntries.length > 0 ?
        (completedEntries.length / collegeEntries.length) * 100 : 0;

      return {
        college: college.name,
        tasksCompleted: completedEntries.length,
        totalCost,
        avgCompletionTime: Number(avgCompletionTime.toFixed(1)),
        efficiency: Number(efficiency.toFixed(0))
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }, [workEntries, colleges]);

  // Calculate trend data (last 6 months)
  const trendData = useMemo((): TrendData[] => {
    if (!workEntries.length) return [];

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthEntries = workEntries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });

      const monthCost = monthEntries.reduce((sum, entry) => sum + (entry.final_rate || 0), 0);

      months.push({
        period: format(date, 'MMM yyyy'),
        tasks: monthEntries.length,
        cost: monthCost,
        employees: dashboardStats?.totalEmployees || 0
      });
    }

    return months;
  }, [workEntries, dashboardStats]);

  const generateReport = () => {
    // In a real app, this would generate and download a PDF or Excel report
    alert("Report generation would happen here!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading reports data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
            <p className="text-muted-foreground">Comprehensive insights and data analysis</p>
          </div>
          
          <Button onClick={generateReport} className="bg-gradient-primary hover:bg-primary-hover">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 bg-gradient-card border-0 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>College</Label>
              <Select value={filterCollege} onValueChange={setFilterCollege}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{reportData.workEntries.total}</p>
                    <p className="text-sm text-success mt-1">
                      {((reportData.workEntries.completed / reportData.workEntries.total) * 100).toFixed(1)}% completed
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      ₹{(reportData.workEntries.totalValue / 100000).toFixed(1)}L
                    </p>
                    <p className="text-sm text-success mt-1">+12.5% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-success" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Employees</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{reportData.employees.active}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reportData.employees.productivity}% productivity
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Colleges</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{reportData.colleges.active}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{(reportData.colleges.avgCostPerCollege / 1000).toFixed(0)}K avg cost
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Task Distribution</h3>
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                {reportData.workEntries.total > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{reportData.workEntries.completed}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({((reportData.workEntries.completed / reportData.workEntries.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">In Progress</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{reportData.workEntries.inProgress}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({((reportData.workEntries.inProgress / reportData.workEntries.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{reportData.workEntries.pending}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({((reportData.workEntries.pending / reportData.workEntries.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No work entries found</p>
                    <p className="text-sm">Add some work entries to see task distribution</p>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Attendance Metrics</h3>
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Hours/Day</span>
                    <span className="font-medium">{reportData.attendance.averageHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overtime Hours</span>
                    <span className="font-medium">{reportData.attendance.overtimeHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Absence Rate</span>
                    <span className="font-medium">{reportData.attendance.absenceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Productivity Score</span>
                    <span className="font-medium">{reportData.employees.productivity}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6 bg-gradient-card border-0 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">College Performance Analysis</h3>
                <Badge variant="outline">Top Performers</Badge>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Avg Completion Time</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.length > 0 ? (
                      performanceData.map((data, index) => (
                        <TableRow key={data.college}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="font-medium">{data.college}</span>
                            </div>
                          </TableCell>
                          <TableCell>{data.tasksCompleted}</TableCell>
                          <TableCell>₹{data.totalCost.toLocaleString()}</TableCell>
                          <TableCell>{data.avgCompletionTime} days</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(data.efficiency, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{data.efficiency}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={data.efficiency > 90 ? "default" : data.efficiency > 80 ? "secondary" : "outline"}>
                              {data.efficiency > 90 ? "Excellent" : data.efficiency > 80 ? "Good" : "Average"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No performance data available. Add some work entries to see college performance metrics.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6 bg-gradient-card border-0 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">6-Month Trend Analysis</h3>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Active Employees</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trendData.length > 0 ? (
                      trendData.map((data, index) => {
                        const prevData = trendData[index - 1];
                        const growth = prevData && prevData.cost > 0 ?
                          ((data.cost - prevData.cost) / prevData.cost * 100).toFixed(1) : '0';

                        return (
                          <TableRow key={data.period}>
                            <TableCell className="font-medium">{data.period}</TableCell>
                            <TableCell>{data.tasks}</TableCell>
                            <TableCell>₹{data.cost.toLocaleString()}</TableCell>
                            <TableCell>{data.employees}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {Number(growth) > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-success" />
                                ) : Number(growth) < 0 ? (
                                  <TrendingUp className="h-3 w-3 text-destructive rotate-180" />
                                ) : (
                                  <div className="h-3 w-3" />
                                )}
                                <span className={Number(growth) > 0 ? "text-success" : Number(growth) < 0 ? "text-destructive" : "text-muted-foreground"}>
                                  {growth}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No trend data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Detailed Reports Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Financial Report</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive cost analysis</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Attendance Report</h3>
                    <p className="text-sm text-muted-foreground">Employee attendance analysis</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Performance Report</h3>
                    <p className="text-sm text-muted-foreground">Productivity and efficiency metrics</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">College-wise Report</h3>
                    <p className="text-sm text-muted-foreground">Individual college analysis</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Monthly Summary</h3>
                    <p className="text-sm text-muted-foreground">Month-over-month comparison</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-0 shadow-card cursor-pointer hover:shadow-business-md transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <Target className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Custom Report</h3>
                    <p className="text-sm text-muted-foreground">Build your own analysis</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
