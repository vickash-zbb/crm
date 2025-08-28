import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  department: string;
  salary: number;
  join_date: string;
  status: string;
  address: string | null;
  skills: string | null;
  college_id: string | null;
  created_at: string;
  updated_at: string;
  colleges?: {
    id: string;
    name: string;
    location: string | null;
  };
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  salary: number;
  join_date: string;
  status?: string;
  address?: string;
  skills?: string;
  college_id?: string;
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      console.log("🔍 Fetching employees...");
      try {
        // First try a simple query to check if table exists
        const { data: simpleData, error: simpleError } = await supabase
          .from("employees")
          .select("id, name, email")
          .limit(1);

        if (simpleError) {
          console.error("❌ Simple employee query failed:", simpleError);
          if (simpleError.code === '42P01') {
            console.warn("⚠️ Employees table doesn't exist yet");
            return [];
          }
          throw simpleError;
        }

        // If simple query works, do the full query
        const { data, error } = await supabase
          .from("employees")
          .select(`
            *,
            colleges:college_id (
              id,
              name,
              location
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Full employee query failed:", error);
          // Fallback to simple query if join fails
          console.warn("⚠️ Falling back to simple query");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("employees")
            .select("*")
            .order("created_at", { ascending: false });

          if (fallbackError) {
            console.error("❌ Fallback query also failed:", fallbackError);
            return [];
          }

          console.log("✅ Fallback employee data:", fallbackData);
          return fallbackData as unknown as Employee[];
        }

        console.log("✅ Full employee data:", data);
        return data as unknown as Employee[];
      } catch (err) {
        console.error("💥 Unexpected error in useEmployees:", err);
        return [];
      }
    },
    // Retry failed queries
    retry: 3,
    retryDelay: 1000,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeData) => {
      // First check if email already exists
      const { data: existingEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("email", data.email)
        .single();

      if (existingEmployee) {
        throw new Error(`Employee with email "${data.email}" already exists. Please use a different email address.`);
      }

      const { data: result, error } = await supabase
        .from("employees")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEmployeeData> }) => {
      const { data: result, error } = await supabase
        .from("employees")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employee: " + error.message,
        variant: "destructive",
      });
    },
  });
};