import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Search, Calendar, Building, BarChart } from "lucide-react";
import { useColleges } from "@/hooks/useColleges";
import { DateRange } from "react-day-picker";

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardFilterState) => void;
  className?: string;
}

export interface DashboardFilterState {
  dateRange?: DateRange;
  college: string;
  status: string;
  workType: string;
  search: string;
  minAmount: string;
  maxAmount: string;
}

export const DashboardFilters = ({ onFiltersChange, className }: DashboardFiltersProps) => {
  const { data: colleges = [] } = useColleges();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DashboardFilterState>({
    college: "all",
    status: "all", 
    workType: "all",
    search: "",
    minAmount: "",
    maxAmount: "",
  });

  const updateFilters = (newFilters: Partial<DashboardFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: DashboardFilterState = {
      college: "all",
      status: "all",
      workType: "all", 
      search: "",
      minAmount: "",
      maxAmount: "",
      dateRange: undefined,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.search !== "" ||
    filters.college !== "all" ||
    filters.status !== "all" ||
    filters.workType !== "all" ||
    filters.minAmount !== "" ||
    filters.maxAmount !== "" ||
    filters.dateRange !== undefined;

  const activeFilterCount = [
    filters.search !== "",
    filters.college !== "all",
    filters.status !== "all", 
    filters.workType !== "all",
    filters.minAmount !== "",
    filters.maxAmount !== "",
    filters.dateRange !== undefined,
  ].filter(Boolean).length;

  return (
    <div className={className}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Dashboard Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline" className="text-xs">
                Search: {filters.search}
              </Badge>
            )}
            {filters.college !== "all" && (
              <Badge variant="outline" className="text-xs">
                College: {colleges.find(c => c.id === filters.college)?.name || filters.college}
              </Badge>
            )}
            {filters.status !== "all" && (
              <Badge variant="outline" className="text-xs">
                Status: {filters.status}
              </Badge>
            )}
            {filters.workType !== "all" && (
              <Badge variant="outline" className="text-xs">
                Type: {filters.workType}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6 mb-6 bg-gradient-card border-0 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work entries..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => updateFilters({ dateRange })}
              />
            </div>

            {/* College Filter */}
            <div className="space-y-2">
              <Label>College</Label>
              <Select
                value={filters.college}
                onValueChange={(value) => updateFilters({ college: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All colleges" />
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

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Type Filter */}
            <div className="space-y-2">
              <Label>Work Type</Label>
              <Select
                value={filters.workType}
                onValueChange={(value) => updateFilters({ workType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Min Amount (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => updateFilters({ minAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Amount (₹)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => updateFilters({ maxAmount: e.target.value })}
              />
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                disabled={!hasActiveFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
