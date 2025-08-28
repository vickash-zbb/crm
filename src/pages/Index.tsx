import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/dashboard/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RealTimeAnalytics } from "@/components/dashboard/RealTimeAnalytics";
import { DashboardFilters, type DashboardFilterState } from "@/components/dashboard/DashboardFilters";
import { CollegeManagement } from "@/components/colleges/CollegeManagement";
import { DatabaseTest } from "@/components/DatabaseTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Building2, Users, Clock, BarChart3, Download, ArrowRight, Database } from "lucide-react";

const Index = () => {
   const location = useLocation();
   const [activeTab, setActiveTab] = useState("overview");
   const [dashboardFilters, setDashboardFilters] = useState<DashboardFilterState>({
     college: "all",
     status: "all",
     workType: "all",
     search: "",
     minAmount: "",
     maxAmount: "",
   });

   // Check if we're coming from /colleges route and switch to college management tab
   useEffect(() => {
     if (location.pathname === '/colleges') {
       setActiveTab('colleges');
     }
   }, [location.pathname]);

   const handleFiltersChange = (filters: DashboardFilterState) => {
     setDashboardFilters(filters);
   };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage work entries, track costs, and monitor employee attendance across all colleges.</p>
        </div>

        {/* Real-time Analytics Section */}
        <div className="mb-8">
          <RealTimeAnalytics />
        </div>

        {/* Database Test Section */}
        <div className="mb-8">
          <DatabaseTest />
        </div>

        <div className="mb-8">
          <DashboardFilters
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <div className="mb-8">
          <StatsCards filters={dashboardFilters} />
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h3>
            <p className="text-muted-foreground">Access key features and manage your work efficiently</p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/new-work-entry">
              <Card className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Create New Work Entry</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add new tasks with automatic cost calculations and measurements
                </p>
                <Button className="w-full bg-gradient-primary hover:bg-primary-hover transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </Card>
            </Link>

            <Link to="/work-entries">
              <Card className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                    <FileText className="h-6 w-6 text-success" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-success transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Manage Work Entries</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View, edit, filter and track all work entries across colleges
                </p>
                <Button variant="outline" className="w-full border-success text-success hover:bg-success hover:text-white transition-all duration-200 transform hover:scale-105">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Entries
                </Button>
              </Card>
            </Link>

            <Link to="/colleges">
              <Card className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">College Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add and manage college information and locations
                </p>
                <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 transform hover:scale-105">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Colleges
                </Button>
              </Card>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/employees">
              <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Employees</h4>
                    <p className="text-xs text-muted-foreground">Manage workforce</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
              </Card>
            </Link>

            <Link to="/attendance">
              <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Attendance</h4>
                    <p className="text-xs text-muted-foreground">Track working hours</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Reports</h4>
                    <p className="text-xs text-muted-foreground">Analytics & insights</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </div>
              </Card>
            </Link>

            <Link to="/data-cleanup">
              <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Database className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Data Cleanup</h4>
                    <p className="text-xs text-muted-foreground">Remove unwanted data</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                </div>
              </Card>
            </Link>

            <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-business-md transition-smooth cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Download className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Export Data</h4>
                  <p className="text-xs text-muted-foreground">Download reports</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </div>
            </Card>
          </div>
        </div>

        {/* College Management Section */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">College Management</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="colleges">College Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6 bg-gradient-card border-0 shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">System Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Your dashboard provides real-time insights into work progress, costs, and resource allocation across all colleges.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold text-primary">Efficiency</h4>
                    <p className="text-sm text-muted-foreground">Streamlined workflows</p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-lg">
                    <h4 className="font-semibold text-success">Accuracy</h4>
                    <p className="text-sm text-muted-foreground">Precise cost calculations</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <h4 className="font-semibold text-blue-500">Insights</h4>
                    <p className="text-sm text-muted-foreground">Data-driven decisions</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="colleges">
              <CollegeManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
