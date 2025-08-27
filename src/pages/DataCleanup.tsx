import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Zap } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { DataCleanupTool } from "@/components/work-entry/DataCleanupTool";

const DataCleanup = () => {
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
              <span className="text-muted-foreground">Data Management</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Data Cleanup</h2>
            <p className="text-muted-foreground">Identify and remove unwanted data from your work entries database</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Database Stats
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-8 bg-gradient-card border-0 shadow-card">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Data Cleanup Tool</h3>
              <p className="text-muted-foreground">
                This tool helps you identify and remove various types of unwanted data from your database, 
                including duplicate entries, incomplete records, test data, and orphaned entries. 
                Use with caution as deleted data cannot be recovered.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Cleanup Tool */}
        <DataCleanupTool />

        {/* Warning Card */}
        <Card className="p-6 mt-8 bg-destructive/10 border-destructive/20">
          <div className="flex items-start space-x-4">
            <div className="bg-destructive/10 p-3 rounded-full">
              <Zap className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Important Notice</h3>
              <p className="text-muted-foreground">
                Data deletion is permanent and cannot be undone. Please review all entries carefully before deletion. 
                It's recommended to backup your database before performing any cleanup operations.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DataCleanup;