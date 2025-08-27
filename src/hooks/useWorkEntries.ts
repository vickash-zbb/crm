import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface WorkEntry {
  block: string | null;
  college_id: string;
  created_at: string;
  date: string;
  final_rate: number | null;
  floor: string | null;
  height: number | null;
  id: string;
  length: number | null;
  location: string;
  quantity: number | null;
  rate_per_sqft: number | null;
  square_feet: number | null;
  status: "pending" | "in-progress" | "completed";
  updated_at: string;
  width: number | null;
  work_area_or_room: string | null;
  work_description: string;
  work_type: string;
  colleges?: {
    id: string;
    name: string;
    location: string | null;
  };
}

export interface CreateWorkEntryData {
  block?: string;
  college_id: string;
  date?: string;
  final_rate?: number;
  floor?: string;
  height?: number;
  length?: number;
  location: string;
  quantity?: number;
  rate_per_sqft?: number;
  square_feet?: number;
  status?: "pending" | "in-progress" | "completed";
  width?: number;
  work_area_or_room?: string;
  work_description: string;
  work_type: string;
}

export const useWorkEntries = () => {
  return useQuery({
    queryKey: ["work-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_entries")
        .select(`
          *,
          colleges:college_id (
            id,
            name,
            location
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as WorkEntry[];
    },
  });
};

export const useCreateWorkEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateWorkEntryData) => {
      const { data: result, error } = await supabase
        .from("work_entries")
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-entries"] });
      toast({
        title: "Success",
        description: "Work entry created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create work entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWorkEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWorkEntryData> }) => {
      const { data: result, error } = await supabase
        .from("work_entries")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-entries"] });
      toast({
        title: "Success",
        description: "Work entry updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update work entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWorkEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("work_entries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-entries"] });
      toast({
        title: "Success",
        description: "Work entry deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete work entry: " + error.message,
        variant: "destructive",
      });
    },
  });
};