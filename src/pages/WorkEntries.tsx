import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, BarChart3, Download } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { EnhancedWorkTable } from "@/components/work-entry/EnhancedWorkTable";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const WorkEntries = () => {
  const { data: stats } = useDashboardStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Work Entries</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Work Entries Management</h2>
            <p className="text-muted-foreground">View, edit, and manage all work entries across your colleges</p>
          </div>
          
          <div className="flex space-x-3">
            <Link to="/reports">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link to="/new-work-entry">
              <Button className="bg-gradient-primary hover:bg-primary-hover">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Entries</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalTasks || 0}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.completedTasks || 0}</p>
                <p className="text-xs text-success">
                  {stats?.totalTasks ? `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%` : '0%'} rate
                </p>
              </div>
              <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-success rounded-full"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.inProgressTasks || 0}</p>
                <p className="text-xs text-blue-600">Currently active</p>
              </div>
              <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Value</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  ₹{stats?.totalCostAllTime ? (stats.totalCostAllTime / 100000).toFixed(1) + 'L' : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Combined cost</p>
              </div>
              <div className="h-8 w-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Bar */}
        <Card className="p-4 mb-6 bg-gradient-card border-0 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-foreground">All Work Entries</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Link to="/new-work-entry">
                <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Entry
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Enhanced Work Table */}
        <EnhancedWorkTable />

        {/* Quick Actions Footer */}
        <Card className="p-6 mt-8 bg-gradient-card border-0 shadow-card">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Use filters to find specific entries, edit details inline, or export data for reporting.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link to="/new-work-entry">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Entry
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default WorkEntries;
