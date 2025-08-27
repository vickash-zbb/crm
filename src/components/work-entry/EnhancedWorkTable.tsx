import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Download, Filter, Search, X } from "lucide-react";
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
import { useWorkEntries, useDeleteWorkEntry, useUpdateWorkEntry, type WorkEntry } from "@/hooks/useWorkEntries";
import { useColleges } from "@/hooks/useColleges";
import { exportToExcel } from "@/utils/excelExport";
import { WorkEntryEditForm } from "./WorkEntryEditForm";

// Default rate mapping for consistency with other forms
const DEFAULT_RATES: Record<string, number> = {
  painting: 12,
  electrical: 20,
  plumbing: 15,
  carpentry: 18,
  masonry: 25,
  cleaning: 10,
  maintenance: 14,
  renovation: 30,
};

// Helper functions
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

interface FiltersState {
  search: string;
  college: string;
  workType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export const EnhancedWorkTable = () => {
  const { data: workEntries = [], isLoading } = useWorkEntries();
  const { data: colleges = [] } = useColleges();
  const deleteWorkEntry = useDeleteWorkEntry();
  const updateWorkEntry = useUpdateWorkEntry();

  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    college: "all",
    workType: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  // Filtered data
  const filteredData = useMemo(() => {
    return workEntries.filter((entry) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchFields = [
          entry.work_description,
          entry.location,
          entry.colleges?.name,
          entry.work_type,
          (entry as any).blocks,
          // Removed floor
          (entry as any).work_area_or_room,
          (entry as any).quantity,
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchFields.includes(searchLower)) return false;
      }

      // College filter
      if (
        filters.college !== "all" &&
        String(entry.college_id) !== String(filters.college)
      )
        return false;

      // Work type filter
      if (filters.workType !== "all" && entry.work_type.toLowerCase() !== filters.workType.toLowerCase()) return false;

      // Status filter
      if (filters.status !== "all" && entry.status !== filters.status) return false;

      // Date range filter
      if (filters.dateFrom) {
        const entryDate = new Date(entry.date);
        const fromDate = new Date(filters.dateFrom);
        if (entryDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const entryDate = new Date(entry.date);
        const toDate = new Date(filters.dateTo);
        if (entryDate > toDate) return false;
      }

      return true;
    });
  }, [workEntries, filters]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, entry) => {
        // Fallback calculation for volume: (length * width * height) * quantity
        const quantity = n((entry as any).quantity) || 1;
        const isVolumeType = ["masonry", "plumbing"].includes(keyOf(entry.work_type));
        const sq = n(entry.square_feet) ||
          (n(entry.length) * n(entry.width) * ( n(entry.height) > 0 ? n(entry.height) : 1) * quantity);
        const rate = n(entry.rate_per_sqft) || DEFAULT_RATES[keyOf(entry.work_type)] || 0;
        const final = n(entry.final_rate) || (sq * rate);

        return {
          count: acc.count + 1,
          totalSquareFeet: acc.totalSquareFeet + sq,
          totalAmount: acc.totalAmount + final,
        };
      },
      { count: 0, totalSquareFeet: 0, totalAmount: 0 }
    );
  }, [filteredData]);

  const handleDelete = async (id: string) => {
    await deleteWorkEntry.mutateAsync(id);
  };

  const handleEdit = (entry: WorkEntry) => {
    setEditingEntry(entry);
  };

  const handleCloseEdit = () => {
    setEditingEntry(null);
  };

  const handleExport = () => {
    if (filteredData.length === 0) return;

    const rows = filteredData.map((entry: WorkEntry, index: number) => {
      const quantity = n((entry as any).quantity) || 1;
      const isVolumeType = ["masonry", "plumbing"].includes(keyOf(entry.work_type));
      const sq = n(entry.square_feet) ||
        (n(entry.length) * n(entry.width) * ( n(entry.height) > 0 ? n(entry.height) : 1) * quantity);
      const rate = n(entry.rate_per_sqft) || DEFAULT_RATES[keyOf(entry.work_type)] || 0;
      const final = n(entry.final_rate) || (sq * rate);

      return {
        "S.No": index + 1,
        Date: entry.date ? new Date(entry.date).toLocaleDateString() : "N/A",
        College: (entry as any).colleges?.name || "N/A",
        Location: entry.location || "N/A",
        Blocks: (entry as any).blocks || "",
        // Removed Floor
        "Work Area/Room": (entry as any).work_area_or_room || "",
        "Work Description": entry.work_description || "N/A",
        "Work Type": entry.work_type || "N/A",
        "Length (ft)": n(entry.length),
        "Width (ft)": n(entry.width),
        "Height (ft)": n(entry.height),
        Quantity: n(entry.height),
        "Sq.Ft (Volume)": sq,
        "Rate per Unit": rate,
        "Final Rate": final,
        Status: entry.status || "N/A",
      };
    });

    exportToExcel(rows as any[]);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      college: "all",
      workType: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters = filters.search !== "" || filters.college !== "all" || filters.workType !== "all" || filters.status !== "all" || filters.dateFrom !== "" || filters.dateTo !== "";

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-0 shadow-card">
        <div className="flex justify-center p-8">Loading work entries...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Work Entries</h3>
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {workEntries.length} entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className={hasActiveFilters ? "bg-primary/10 border-primary" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            disabled={filteredData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 mb-6 bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search description, location..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>College</Label>
              <Select
                value={filters.college}
                onValueChange={(value) => setFilters(prev => ({ ...prev, college: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Work Type</Label>
              <Select
                value={filters.workType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, workType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="electrical">Electrical Work</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="carpentry">Carpentry</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">General Maintenance</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Totals Summary */}
      {filteredData.length > 0 && (
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{totals.count}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totals.totalSquareFeet.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Sq.Ft</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">₹{totals.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {hasActiveFilters ? "No entries match your filters." : "No work entries found. Create your first work entry to get started."}
          </p>
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
              {filteredData.map((entry: any, index: number) => {
                // Fallback calculation for volume: (length * width * height) * quantity
                const quantity = n((entry as any).quantity) || 1;
                const isVolumeType = ["masonry", "plumbing"].includes(keyOf(entry.work_type));
                const sq = n(entry.square_feet) ||
                  (n(entry.length) * n(entry.width) * (isVolumeType && n(entry.height) > 0 ? n(entry.height) : 1) * quantity);

                const rate =
                  n(entry.rate_per_sqft) || DEFAULT_RATES[keyOf(entry.work_type)] || 0;

                const final = n(entry.final_rate) || (sq * rate);

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
                        {(entry as any).blocks || (entry as any).work_area_or_room ? (
                          <div className="text-muted-foreground text-xs">
                            {[(entry as any).blocks, (entry as any).work_area_or_room]
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
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
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

      {/* Edit Dialog */}
      {editingEntry && (
        <WorkEntryEditForm
          entry={editingEntry}
          open={!!editingEntry}
          onClose={handleCloseEdit}
        />
      )}
    </Card>
  );
};
