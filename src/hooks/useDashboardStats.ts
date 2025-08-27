import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkEntries } from "./useWorkEntries";
import { useColleges } from "./useColleges";

export interface DashboardStats {
  totalColleges: number;
  activeColleges: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalEmployees: number;
  totalCostThisMonth: number;
  totalCostAllTime: number;
  totalCostThisWeek: number;
  avgCostPerTask: number;
  totalSquareFeet: number;
  // Dimension-related statistics
  entriesWithDimensions: number;
  entriesWithoutDimensions: number;
  avgLength: number;
  avgWidth: number;
  avgHeight: number;
  avgSquareFeet: number;
  largestArea: number;
  smallestArea: number;
  smallProjects: number; // < 100 sq ft
  mediumProjects: number; // 100-500 sq ft
  largeProjects: number; // > 500 sq ft
  completeDimensionPercentage: number;
}

export const useDashboardStats = () => {
  const { data: workEntries = [] } = useWorkEntries();
  const { data: colleges = [] } = useColleges();

  return useQuery({
    queryKey: ["dashboard-stats", workEntries.length, colleges.length],
    queryFn: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      
      // Calculate work entry statistics
      const pendingTasks = workEntries.filter(entry => entry.status === "pending").length;
      const inProgressTasks = workEntries.filter(entry => entry.status === "in-progress").length;
      const completedTasks = workEntries.filter(entry => entry.status === "completed").length;
      
      // Calculate costs
      const totalCostAllTime = workEntries.reduce((sum, entry) => {
        return sum + (entry.final_rate || 0);
      }, 0);
      
      const thisMonthEntries = workEntries.filter(entry => 
        new Date(entry.date) >= startOfMonth
      );
      const totalCostThisMonth = thisMonthEntries.reduce((sum, entry) => {
        return sum + (entry.final_rate || 0);
      }, 0);
      
      const thisWeekEntries = workEntries.filter(entry => 
        new Date(entry.date) >= startOfWeek
      );
      const totalCostThisWeek = thisWeekEntries.reduce((sum, entry) => {
        return sum + (entry.final_rate || 0);
      }, 0);
      
      // Calculate other metrics
      const avgCostPerTask = workEntries.length > 0 ? totalCostAllTime / workEntries.length : 0;
      const totalSquareFeet = workEntries.reduce((sum, entry) => {
        return sum + (entry.square_feet || 0);
      }, 0);

      // Get unique colleges with active work
      const activeCollegeIds = new Set(workEntries.map(entry => entry.college_id));
      const activeColleges = activeCollegeIds.size;

      // Estimate employees (this could be enhanced with actual employee data)
      const totalEmployees = Math.max(Math.floor(workEntries.length / 5), 1);

      // Calculate dimension-related statistics
      const entriesWithCompleteData = workEntries.filter(entry =>
        entry.length && entry.width && entry.length > 0 && entry.width > 0
      );
      const entriesWithDimensions = entriesWithCompleteData.length;
      const entriesWithoutDimensions = workEntries.length - entriesWithDimensions;

      // Calculate average dimensions (only from entries with data)
      const avgLength = entriesWithCompleteData.length > 0
        ? entriesWithCompleteData.reduce((sum, entry) => sum + (entry.length || 0), 0) / entriesWithCompleteData.length
        : 0;

      const avgWidth = entriesWithCompleteData.length > 0
        ? entriesWithCompleteData.reduce((sum, entry) => sum + (entry.width || 0), 0) / entriesWithCompleteData.length
        : 0;

      const avgHeight = entriesWithCompleteData.length > 0
        ? entriesWithCompleteData.reduce((sum, entry) => sum + (entry.height || 0), 0) / entriesWithCompleteData.length
        : 0;

      // Calculate square feet statistics
      const entriesWithSqFt = workEntries.filter(entry => entry.square_feet && entry.square_feet > 0);
      const avgSquareFeet = entriesWithSqFt.length > 0
        ? entriesWithSqFt.reduce((sum, entry) => sum + (entry.square_feet || 0), 0) / entriesWithSqFt.length
        : 0;

      // Find largest and smallest areas
      const areas = entriesWithSqFt.map(entry => entry.square_feet || 0).filter(area => area > 0);
      const largestArea = areas.length > 0 ? Math.max(...areas) : 0;
      const smallestArea = areas.length > 0 ? Math.min(...areas) : 0;

      // Categorize projects by size
      const smallProjects = entriesWithSqFt.filter(entry => (entry.square_feet || 0) < 100).length;
      const mediumProjects = entriesWithSqFt.filter(entry =>
        (entry.square_feet || 0) >= 100 && (entry.square_feet || 0) <= 500
      ).length;
      const largeProjects = entriesWithSqFt.filter(entry => (entry.square_feet || 0) > 500).length;

      // Calculate completion percentage for dimensions
      const completeDimensionPercentage = workEntries.length > 0
        ? (entriesWithDimensions / workEntries.length) * 100
        : 0;

      const stats: DashboardStats = {
        totalColleges: colleges.length,
        activeColleges,
        totalTasks: workEntries.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        totalEmployees,
        totalCostThisMonth,
        totalCostAllTime,
        totalCostThisWeek,
        avgCostPerTask,
        totalSquareFeet,
        // Dimension-related statistics
        entriesWithDimensions,
        entriesWithoutDimensions,
        avgLength,
        avgWidth,
        avgHeight,
        avgSquareFeet,
        largestArea,
        smallestArea,
        smallProjects,
        mediumProjects,
        largeProjects,
        completeDimensionPercentage,
      };

      return stats;
    },
    enabled: true,
  });
};
