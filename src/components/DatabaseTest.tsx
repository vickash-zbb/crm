import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react";

export const DatabaseTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runDatabaseTest = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const results: any = {
        employees: { status: 'pending', count: 0, error: null },
        attendance: { status: 'pending', count: 0, error: null },
        workEntries: { status: 'pending', count: 0, error: null }
      };

      // Test employees table
      try {
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true });

        if (empError) {
          results.employees = { status: 'error', count: 0, error: empError.message };
        } else {
          results.employees = { status: 'success', count: empData || 0, error: null };
        }
      } catch (err) {
        results.employees = { status: 'error', count: 0, error: String(err) };
      }

      // Test attendance table
      try {
        const { data: attData, error: attError } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true });

        if (attError) {
          results.attendance = { status: 'error', count: 0, error: attError.message };
        } else {
          results.attendance = { status: 'success', count: attData || 0, error: null };
        }
      } catch (err) {
        results.attendance = { status: 'error', count: 0, error: String(err) };
      }

      // Test work_entries table
      try {
        const { data: workData, error: workError } = await supabase
          .from('work_entries')
          .select('id', { count: 'exact', head: true });

        if (workError) {
          results.workEntries = { status: 'error', count: 0, error: workError.message };
        } else {
          results.workEntries = { status: 'success', count: workData || 0, error: null };
        }
      } catch (err) {
        results.workEntries = { status: 'error', count: 0, error: String(err) };
      }

      setTestResults(results);
    } catch (error) {
      console.error('Database test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Database Connection Test</h3>
        </div>
        <Button
          onClick={runDatabaseTest}
          disabled={isTesting}
          variant="outline"
          size="sm"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          {isTesting ? 'Testing...' : 'Test Database'}
        </Button>
      </div>

      {testResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employees Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Employees Table</h4>
                {getStatusIcon(testResults.employees.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {testResults.employees.status === 'success'
                  ? `${testResults.employees.count} records found`
                  : testResults.employees.error || 'Not tested'
                }
              </p>
            </div>

            {/* Attendance Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Attendance Table</h4>
                {getStatusIcon(testResults.attendance.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {testResults.attendance.status === 'success'
                  ? `${testResults.attendance.count} records found`
                  : testResults.attendance.error || 'Not tested'
                }
              </p>
            </div>

            {/* Work Entries Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Work Entries Table</h4>
                {getStatusIcon(testResults.workEntries.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {testResults.workEntries.status === 'success'
                  ? `${testResults.workEntries.count} records found`
                  : testResults.workEntries.error || 'Not tested'
                }
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Summary:</h4>
            <ul className="text-sm space-y-1">
              {Object.entries(testResults).map(([table, result]: [string, any]) => (
                <li key={table} className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span>
                    <strong>{table}:</strong> {result.status === 'success'
                      ? `${result.count} records`
                      : `Error - ${result.error}`
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!testResults && !isTesting && (
        <p className="text-sm text-muted-foreground">
          Click "Test Database" to check if your tables exist and have data.
        </p>
      )}
    </Card>
  );
};