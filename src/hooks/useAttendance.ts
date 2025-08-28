import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number;
  status: string;
  work_description: string | null;
  daily_work_tasks: string | null;
  work_completed: string | null;
  overtime: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employees?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

export interface CreateAttendanceData {
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours?: number;
  status?: string;
  work_description?: string;
  daily_work_tasks?: string;
  work_completed?: string;
  overtime?: number;
  notes?: string;
}

export const useAttendance = () => {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      console.log("🔍 Fetching attendance with employee names...");
      try {
        // Always fetch attendance and employees separately, then merge
        // This ensures we always get employee names regardless of join issues

        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .order("date", { ascending: false });

        if (attendanceError) {
          console.error("❌ Error fetching attendance:", attendanceError);
          if (attendanceError.code === '42P01') {
            console.warn("⚠️ Attendance table doesn't exist yet, returning empty array");
            return [];
          }
          throw attendanceError;
        }

        // Fetch employee data for lookup
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("id, name, email, role, department");

        if (employeesError) {
          console.error("❌ Error fetching employees:", employeesError);
          // Return attendance data without employee names if employees fetch fails
          console.log("✅ Attendance data (without employee names):", attendanceData);
          return attendanceData as AttendanceRecord[];
        }

        // Create employee lookup map
        const employeeMap = new Map();
        employeesData.forEach(employee => {
          employeeMap.set(employee.id, employee);
        });

        // Merge employee data into attendance records
        const mergedData = attendanceData.map(record => ({
          ...record,
          employees: employeeMap.get(record.employee_id) || null
        }));

        console.log("✅ Attendance data (with employee names):", mergedData);
        return mergedData as AttendanceRecord[];
      } catch (err) {
        console.error("💥 Unexpected error in useAttendance:", err);
        // Return empty array on any error to prevent app crashes
        return [];
      }
    },
    // Retry failed queries
    retry: 3,
    retryDelay: 1000,
    // Refetch on window focus
    refetchOnWindowFocus: true,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAttendanceData) => {
      const { data: result, error } = await supabase
        .from("attendance")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Invalidate both attendance and employees queries since attendance includes employee data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Attendance record created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create attendance record: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAttendanceData> }) => {
      const { data: result, error } = await supabase
        .from("attendance")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Invalidate both attendance and employees queries since attendance includes employee data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance record: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete attendance record: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to get attendance for a specific date
export const useAttendanceByDate = (date: string) => {
  return useQuery({
    queryKey: ["attendance", "by-date", date],
    queryFn: async () => {
      // Fetch attendance records for the specific date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (attendanceError) throw attendanceError;

      // Fetch employee data for lookup
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, email, role, department");

      if (employeesError) {
        // Return attendance data without employee names if employees fetch fails
        return attendanceData as AttendanceRecord[];
      }

      // Create employee lookup map
      const employeeMap = new Map();
      employeesData.forEach(employee => {
        employeeMap.set(employee.id, employee);
      });

      // Merge employee data into attendance records
      const mergedData = attendanceData.map(record => ({
        ...record,
        employees: employeeMap.get(record.employee_id) || null
      }));

      return mergedData as AttendanceRecord[];
    },
    enabled: !!date,
  });
};

// Hook to get attendance for a specific employee
export const useAttendanceByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ["attendance", "by-employee", employeeId],
    queryFn: async () => {
      // Fetch attendance records for the specific employee
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });

      if (attendanceError) throw attendanceError;

      // Fetch employee data for lookup
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, email, role, department");

      if (employeesError) {
        // Return attendance data without employee names if employees fetch fails
        return attendanceData as AttendanceRecord[];
      }

      // Create employee lookup map
      const employeeMap = new Map();
      employeesData.forEach(employee => {
        employeeMap.set(employee.id, employee);
      });

      // Merge employee data into attendance records
      const mergedData = attendanceData.map(record => ({
        ...record,
        employees: employeeMap.get(record.employee_id) || null
      }));

      return mergedData as AttendanceRecord[];
    },
    enabled: !!employeeId,
  });
};