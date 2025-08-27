// src/components/work-entry/RecentWorkTable.tsx

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkEntries, useDeleteWorkEntry } from "@/hooks/useWorkEntries";
import { exportToExcel } from "@/utils/excelExport";

// ---- default rate mapping (lowercase keys) ----
const DEFAULT_RATES: Record<string, number> = {
  painting: 50,
  plastering: 40,
  carpentry: 70,
  electrical: 60,
  plumbing: 55,
};

// ---- helpers ----
const n = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const num = typeof v === "number" ? v : Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(num) ? num : 0;
};

const keyOf = (t?: string) => (t ? t.toLowerCase().trim() : "");

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "in-progress":
      return "bg-warning/10 text-warning border-warning/20";
    case "pending":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted";
  }
};

function RecentWorkTable() {
  const { data: workEntries = [], isLoading } = useWorkEntries();
  const deleteWorkEntry = useDeleteWorkEntry();

  const handleDelete = async (id: string) => {
    await deleteWorkEntry.mutateAsync(id);
  };

  const handleExport = () => {
    if (workEntries.length === 0) return;

    const rows = workEntries.map((entry: any, index: number) => {
      // sq.ft: prefer explicit, else L×W
      const sq =
        n(entry.square_feet) || (n(entry.length) && n(entry.width) ? n(entry.length) * n(entry.width) : 0);

      // rate: prefer stored, else default from work_type
      const rate =
        n(entry.rate_per_sqft) || DEFAULT_RATES[keyOf(entry.work_type)] || 0;

      const final = sq && rate ? sq * rate : 0;

      return {
        SNo: index + 1,
        ...entry,
        square_feet: sq,
        rate_per_sqft: rate,
        final_rate: final,
      };
    });

    exportToExcel(rows);
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-0 shadow-card">
        <div className="flex justify-center p-8">Loading work entries...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Work Entries</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            disabled={workEntries.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {workEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No work entries found. Create your first work entry to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.no</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Work Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Sq.Ft</TableHead>
                <TableHead>Rate per Sq.Ft</TableHead>
                <TableHead>Final Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {workEntries.map((entry: any, index: number) => {
                const sq =
                  n(entry.square_feet) ||
                  (n(entry.length) && n(entry.width) ? n(entry.length) * n(entry.width) : 0);

                const rate =
                  n(entry.rate_per_sqft) || DEFAULT_RATES[keyOf(entry.work_type)] || 0;

                const final = sq && rate ? sq * rate : 0;

                const dateText = entry?.date
                  ? (() => {
                      const d = new Date(entry.date);
                      return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
                    })()
                  : "N/A";

                return (
                  <TableRow key={entry.id ?? `${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{dateText}</TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{entry.colleges?.name || "N/A"}</div>
                        {entry.colleges?.location && (
                          <div className="text-muted-foreground text-xs">
                            {entry.colleges.location}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div>{entry.location || "N/A"}</div>
                        {(entry as any).block || (entry as any).floor || (entry as any).work_area_or_room ? (
                          <div className="text-muted-foreground text-xs">
                            {[(entry as any).block, (entry as any).floor, (entry as any).work_area_or_room]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[200px] truncate">
                      {entry.work_description || "N/A"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {entry.work_type || "N/A"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        {n(entry.length) && n(entry.width) ? (
                          <>
                            <div>L: {n(entry.length)}ft</div>
                            <div>W: {n(entry.width)}ft</div>
                            {n(entry.height) ? <div>H: {n(entry.height)}ft</div> : null}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{(entry as any).quantity || "1"}</TableCell>
                    <TableCell>{sq ? `${sq.toLocaleString()} ft²` : "N/A"}</TableCell>
                    <TableCell>{rate ? `₹${rate.toLocaleString()}` : "N/A"}</TableCell>
                    <TableCell className="font-semibold">
                      {final ? `₹${final.toLocaleString()}` : "N/A"}
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(entry.status)}>
                        {String(entry.status || "").replace("-", " ") || "N/A"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Work Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this work entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export default RecentWorkTable;
