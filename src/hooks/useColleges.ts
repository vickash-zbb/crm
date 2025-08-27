import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface College {
  id: string;
  name: string;
  location: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCollegeData {
  name: string;
  location?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const useColleges = () => {
  return useQuery({
    queryKey: ["colleges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as College[];
    },
  });
};

export const useCreateCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCollegeData) => {
      const { data: result, error } = await supabase
        .from("colleges")
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast({
        title: "Success",
        description: "College created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create college: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCollegeData> }) => {
      const { data: result, error } = await supabase
        .from("colleges")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast({
        title: "Success",
        description: "College updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update college: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCollege = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("colleges")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast({
        title: "Success",
        description: "College deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete college: " + error.message,
        variant: "destructive",
      });
    },
  });
};