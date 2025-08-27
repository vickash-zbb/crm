import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  useWorkEntries, 
  useDeleteWorkEntry,
  WorkEntry 
} from "@/hooks/useWorkEntries";
import { useColleges } from "@/hooks/useColleges";
import { AlertTriangle, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CleanupReport {
  duplicateEntries: WorkEntry[];
  incompleteEntries: WorkEntry[];
  testEntries: WorkEntry[];
  orphanedEntries: WorkEntry[];
}

export const DataCleanupTool = () => {
  const { data: workEntries = [], isLoading: isLoadingEntries } = useWorkEntries();
  const { data: colleges = [], isLoading: isLoadingColleges } = useColleges();
  const deleteWorkEntry = useDeleteWorkEntry();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupReport, setCleanupReport] = useState<CleanupReport | null>(null);
  const [selectedCleanupType, setSelectedCleanupType] = useState<string | null>(null);

  // Find duplicate entries (same college, location, work description, and date)
  const findDuplicateEntries = (entries: WorkEntry[]): WorkEntry[] => {
    const duplicates: WorkEntry[] = [];
    const seen = new Map<string, WorkEntry[]>();
    
    entries.forEach(entry => {
      const key = `${entry.college_id}-${entry.location}-${entry.work_description}-${entry.date}-${entry.block || ''}-${entry.floor || ''}-${entry.work_area_or_room || ''}`;
      if (!seen.has(key)) {
        seen.set(key, [entry]);
      } else {
        seen.get(key)?.push(entry);
      }
    });
    
    // Add all but the first occurrence to duplicates
    seen.forEach(group => {
      if (group.length > 1) {
        duplicates.push(...group.slice(1));
      }
    });
    
    return duplicates;
  };

  // Find incomplete entries (missing required fields)
  const findIncompleteEntries = (entries: WorkEntry[]): WorkEntry[] => {
    return entries.filter(entry => 
      !entry.college_id ||
      !entry.location ||
      !entry.work_description ||
      !entry.work_type ||
      !entry.date ||
      entry.quantity === null ||
      entry.quantity === undefined ||
      entry.quantity <= 0
    );
  };

  // Find test entries (entries with test-related content)
  const findTestEntries = (entries: WorkEntry[]): WorkEntry[] => {
    const testKeywords = ['test', 'demo', 'sample', 'dummy', 'temp', 'trial'];
    return entries.filter(entry =>
      testKeywords.some(keyword =>
        entry.work_description.toLowerCase().includes(keyword) ||
        entry.location.toLowerCase().includes(keyword) ||
        entry.block?.toLowerCase().includes(keyword) ||
        entry.floor?.toLowerCase().includes(keyword) ||
        entry.work_area_or_room?.toLowerCase().includes(keyword)
      )
    );
  };

  // Find orphaned entries (entries with invalid college references)
  const findOrphanedEntries = (entries: WorkEntry[]): WorkEntry[] => {
    const collegeIds = new Set(colleges.map(college => college.id));
    return entries.filter(entry => !collegeIds.has(entry.college_id));
  };

  const analyzeData = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const report: CleanupReport = {
        duplicateEntries: findDuplicateEntries(workEntries),
        incompleteEntries: findIncompleteEntries(workEntries),
        testEntries: findTestEntries(workEntries),
        orphanedEntries: findOrphanedEntries(workEntries),
      };
      
      setCleanupReport(report);
      setIsAnalyzing(false);
    }, 1000);
  };

  const cleanData = async (type: keyof CleanupReport) => {
    if (!cleanupReport) return;
    
    setIsCleaning(true);
    setSelectedCleanupType(type);
    
    try {
      const entriesToDelete = cleanupReport[type];
      
      // Delete entries one by one
      for (const entry of entriesToDelete) {
        await deleteWorkEntry.mutateAsync(entry.id);
      }
      
      toast({
        title: "Success",
        description: `Successfully deleted ${entriesToDelete.length} ${type.replace('Entries', '').toLowerCase()} entries`,
      });
      
      // Refresh the report
      setTimeout(() => {
        analyzeData();
        setIsCleaning(false);
        setSelectedCleanupType(null);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entries: " + (error as Error).message,
        variant: "destructive",
      });
      setIsCleaning(false);
      setSelectedCleanupType(null);
    }
  };

  const cleanAll = async () => {
    if (!cleanupReport) return;
    
    setIsCleaning(true);
    
    try {
      // Collect all entries to delete
      const allEntriesToDelete = [
        ...cleanupReport.duplicateEntries,
        ...cleanupReport.incompleteEntries,
        ...cleanupReport.testEntries,
        ...cleanupReport.orphanedEntries,
      ];
      
      // Remove duplicates from the combined list
      const uniqueEntriesToDelete = Array.from(
        new Map(allEntriesToDelete.map(entry => [entry.id, entry])).values()
      );
      
      // Delete entries one by one
      for (const entry of uniqueEntriesToDelete) {
        await deleteWorkEntry.mutateAsync(entry.id);
      }
      
      toast({
        title: "Success",
        description: `Successfully deleted ${uniqueEntriesToDelete.length} unwanted entries`,
      });
      
      // Refresh the report
      setTimeout(() => {
        analyzeData();
        setIsCleaning(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entries: " + (error as Error).message,
        variant: "destructive",
      });
      setIsCleaning(false);
    }
  };

  if (isLoadingEntries || isLoadingColleges) {
    return (
      <Card className="p-6 bg-gradient-card border-0 shadow-card">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading data...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Data Cleanup Tool</h3>
        <p className="text-muted-foreground">
          Identify and remove unwanted data from your work entries database
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={analyzeData} 
          disabled={isAnalyzing}
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            "Analyze Data"
          )}
        </Button>
      </div>

      {cleanupReport && (
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Data Analysis Complete</AlertTitle>
            <AlertDescription>
              Found various types of unwanted data in your database. Review the findings below and choose which data to remove.
            </AlertDescription>
          </Alert>

          {/* Duplicate Entries */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                Duplicate Entries
                <Badge className="ml-2" variant="secondary">
                  {cleanupReport.duplicateEntries.length}
                </Badge>
              </h4>
              {cleanupReport.duplicateEntries.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cleanData('duplicateEntries')}
                  disabled={isCleaning}
                >
                  {isCleaning && selectedCleanupType === 'duplicateEntries' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </>
                  )}
                </Button>
              )}
            </div>
            {cleanupReport.duplicateEntries.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                These entries appear to be duplicates based on college, location, work description, and date.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                No duplicate entries found
              </p>
            )}
          </div>

          {/* Incomplete Entries */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                Incomplete Entries
                <Badge className="ml-2" variant="secondary">
                  {cleanupReport.incompleteEntries.length}
                </Badge>
              </h4>
              {cleanupReport.incompleteEntries.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cleanData('incompleteEntries')}
                  disabled={isCleaning}
                >
                  {isCleaning && selectedCleanupType === 'incompleteEntries' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </>
                  )}
                </Button>
              )}
            </div>
            {cleanupReport.incompleteEntries.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                These entries are missing required information such as college, location, or work description.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                No incomplete entries found
              </p>
            )}
          </div>

          {/* Test Entries */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                Test Entries
                <Badge className="ml-2" variant="secondary">
                  {cleanupReport.testEntries.length}
                </Badge>
              </h4>
              {cleanupReport.testEntries.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cleanData('testEntries')}
                  disabled={isCleaning}
                >
                  {isCleaning && selectedCleanupType === 'testEntries' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </>
                  )}
                </Button>
              )}
            </div>
            {cleanupReport.testEntries.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                These entries appear to be test or demo data based on keywords in their description or location.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                No test entries found
              </p>
            )}
          </div>

          {/* Orphaned Entries */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                Orphaned Entries
                <Badge className="ml-2" variant="secondary">
                  {cleanupReport.orphanedEntries.length}
                </Badge>
              </h4>
              {cleanupReport.orphanedEntries.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cleanData('orphanedEntries')}
                  disabled={isCleaning}
                >
                  {isCleaning && selectedCleanupType === 'orphanedEntries' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </>
                  )}
                </Button>
              )}
            </div>
            {cleanupReport.orphanedEntries.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                These entries reference colleges that no longer exist in the database.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                No orphaned entries found
              </p>
            )}
          </div>

          {/* Clean All Button */}
          {(cleanupReport.duplicateEntries.length > 0 ||
            cleanupReport.incompleteEntries.length > 0 ||
            cleanupReport.testEntries.length > 0 ||
            cleanupReport.orphanedEntries.length > 0) && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={cleanAll}
                disabled={isCleaning}
                className="w-full"
              >
                {isCleaning && !selectedCleanupType ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cleaning All Data...
                  </>
                ) : (
                  "Delete All Unwanted Data"
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                This will delete all identified unwanted data in one operation
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};