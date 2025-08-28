import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { WorkEntryForm } from "@/components/work-entry/WorkEntryForm";

const NewWorkEntry = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFormSuccess = () => {
    setIsSubmitted(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-8  flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">New Work Entry</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Create New Work Entry</h2>
            <p className="text-muted-foreground">Add a new work task with details, measurements, and cost calculations</p>
          </div>

          <Link to="/work-entries">
            <Button variant="outline">
              View All Entries
            </Button>
          </Link>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <Card className="p-6 mb-8 bg-success/5 border-success/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <h3 className="font-semibold text-success">Work Entry Created Successfully!</h3>
                <p className="text-sm text-success/80">Your work entry has been saved and is now available in the system. You can continue adding more entries.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Quick Entry</p>
                <p className="text-lg font-semibold text-foreground mt-1">Fast & Easy</p>
                <p className="text-xs text-muted-foreground">Auto-calculations included</p>
              </div>
              <Plus className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Smart Rates</p>
                <p className="text-lg font-semibold text-foreground mt-1">Auto-populated</p>
                <p className="text-xs text-muted-foreground">Based on work type</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Live Preview</p>
                <p className="text-lg font-semibold text-foreground mt-1">Real-time Cost</p>
                <p className="text-xs text-muted-foreground">See final rate instantly</p>
              </div>
              <ArrowLeft className="h-8 w-8 text-blue-500 rotate-90" />
            </div>
          </Card>
        </div>

        {/* Work Entry Form */}
        <WorkEntryForm onSuccess={handleFormSuccess} />

        {/* Quick Actions */}
        <Card className="p-6 mt-8 bg-gradient-card border-0 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/work-entries">
              <Button variant="outline" size="sm">
                View All Work Entries
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/employees">
              <Button variant="outline" size="sm">
                Manage Employees
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default NewWorkEntry;
