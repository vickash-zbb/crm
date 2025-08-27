import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useColleges } from "@/hooks/useColleges";
import { useUpdateWorkEntry, type WorkEntry, type CreateWorkEntryData } from "@/hooks/useWorkEntries";

// Default auto-rates (₹ per Sq Ft)
const DEFAULT_RATES: Record<string, number> = {
   newwork: 12,
  alterwork: 20,
  complaintwork: 15,
  rework: 18,
  fittingwork: 25,
  pastingwork: 10,
 
};

interface FormData {
  block: string;
  college_id: string;
  date: string;
  final_rate: string;
  floor: string;
  height: string;
  length: string;
  location: string;
  quantity: string;
  rate_per_sqft: string;
  square_feet: string;
  status: "pending" | "in-progress" | "completed";
  width: string;
  work_area_or_room: string;
  work_description: string;
  work_type: string;
}

interface WorkEntryEditFormProps {
  entry: WorkEntry;
  open: boolean;
  onClose: () => void;
}

export const WorkEntryEditForm = ({ entry, open, onClose }: WorkEntryEditFormProps) => {
  const { data: colleges = [], isLoading: collegesLoading } = useColleges();
  const updateWorkEntry = useUpdateWorkEntry();

  const [formData, setFormData] = useState<FormData>({
    block: "",
    college_id: "",
    date: "",
    final_rate: "",
    floor: "",
    height: "",
    length: "",
    location: "",
    quantity: "",
    rate_per_sqft: "",
    square_feet: "",
    status: "pending",
    width: "",
    work_area_or_room: "",
    work_description: "",
    work_type: "",
  });

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        block: (entry as any).block || "",
        college_id: entry.college_id || "",
        date: entry.date || "",
        final_rate: entry.final_rate?.toString() || "",
        floor: (entry as any).floor || "",
        height: entry.height?.toString() || "",
        length: entry.length?.toString() || "",
        location: entry.location || "",
        quantity: (entry as any).quantity?.toString() || "",
        rate_per_sqft: entry.rate_per_sqft?.toString() || "",
        square_feet: entry.square_feet?.toString() || "",
        status: (entry.status as "pending" | "in-progress" | "completed") || "pending",
        width: entry.width?.toString() || "",
        work_area_or_room: (entry as any).work_area_or_room || "",
        work_description: entry.work_description || "",
        work_type: entry.work_type || "",
      });
    }
  }, [entry]);

  const calculateValues = (updatedData: FormData) => {
    const length = parseFloat(updatedData.length) || 0;
    const width = parseFloat(updatedData.width) || 0;
    const height = parseFloat(updatedData.height) || 0;
    const quantity = parseFloat(updatedData.quantity) || 0;
    const ratePerSqft = parseFloat(updatedData.rate_per_sqft) || 0;

    const squareFeet = length * width * (height || 1) * (quantity || 1);
    const finalRate = squareFeet * ratePerSqft;

    return {
      square_feet: squareFeet.toFixed(4),
      final_rate: finalRate.toFixed(2),
    };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let updatedData = { ...formData, [field]: value };

    // If work_type is selected → auto-fill default rate
    if (field === "work_type") {
      const rate = DEFAULT_RATES[value.toLowerCase()] || 0;
      updatedData.rate_per_sqft = String(rate);
    }

    if (["length", "width", "height", "quantity", "rate_per_sqft", "work_type"].includes(field)) {
      const calculated = calculateValues(updatedData);
      updatedData.square_feet = calculated.square_feet;
      updatedData.final_rate = calculated.final_rate;
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.college_id) {
      toast({
        title: "Error",
        description: "Please select a college",
        variant: "destructive",
      });
      return;
    }

    const workEntryData: Partial<CreateWorkEntryData> = {
      block: formData.block,
      college_id: formData.college_id,
      date: formData.date,
      final_rate: parseFloat(formData.final_rate) || undefined,
      floor: formData.floor,
      height: parseFloat(formData.height) || undefined,
      length: parseFloat(formData.length) || undefined,
      location: formData.location,
      quantity: parseInt(formData.quantity) || undefined,
      rate_per_sqft: parseFloat(formData.rate_per_sqft) || undefined,
      square_feet: parseFloat(formData.square_feet) || undefined,
      status: formData.status,
      width: parseFloat(formData.width) || undefined,
    
      work_description: formData.work_description,
      work_type: formData.work_type,
    };

    try {
      await updateWorkEntry.mutateAsync({ 
        id: entry.id, 
        data: workEntryData 
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Entry</DialogTitle>
          <DialogDescription>
            Update the work entry details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {/* College Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-college">College Name *</Label>
              <Select 
                value={formData.college_id} 
                onValueChange={(value) => handleInputChange("college_id", value)} 
                disabled={collegesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={collegesLoading ? "Loading colleges..." : "Select college"} />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-block">Block</Label>
              <Input
                id="edit-block"
                value={formData.block}
                onChange={(e) => handleInputChange("block", e.target.value)}
                placeholder="Enter block"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-floor">Floor</Label>
              <Input
                id="edit-floor"
                value={formData.floor}
                onChange={(e) => handleInputChange("floor", e.target.value)}
                placeholder="Enter floor"
              />
            </div>

     

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Work Location *</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Main Building, Ground Floor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "pending" | "in-progress" | "completed") => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Description */}
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Label htmlFor="edit-work_description">Work Description *</Label>
              <Textarea
                id="edit-work_description"
                value={formData.work_description}
                onChange={(e) => handleInputChange("work_description", e.target.value)}
                placeholder="Describe the work to be done"
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-work_type">Work Type</Label>
              <Select 
                value={formData.work_type} 
                onValueChange={(value) => handleInputChange("work_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                 <SelectItem value="newwork">New work</SelectItem>
                  <SelectItem value="alterwork">Alter work</SelectItem>
                  <SelectItem value="complaintwork">Complaint work</SelectItem>
                  <SelectItem value="rework">Re-work</SelectItem>
                  <SelectItem value="fittingwork ">Fitting work </SelectItem>
                  <SelectItem value="pastingwork">Pasting work</SelectItem>
                                 </SelectContent>
              </Select>
            </div>

            {/* Measurements */}
            <div className="space-y-2">
              <Label htmlFor="edit-length">Length (ft)</Label>
              <Input
                id="edit-length"
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) => handleInputChange("length", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-width">Width (ft)</Label>
              <Input
                id="edit-width"
                type="number"
                step="0.01"
                value={formData.width}
                onChange={(e) => handleInputChange("width", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-height">Height (ft)</Label>
              <Input
                id="edit-height"
                type="number"
                step="0.01"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rate_per_sqft">Rate per Sq Ft (₹)</Label>
              <Input
                id="edit-rate_per_sqft"
                type="number"
                step="0.01"
                value={formData.rate_per_sqft}
                onChange={(e) => handleInputChange("rate_per_sqft", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Auto-calculated fields */}
            <div className="bg-accent/10 p-4 rounded-lg">
              <Label className="text-accent-foreground font-medium">Square Feet (Auto-calculated)</Label>
              <div className="text-2xl font-bold text-accent-foreground mt-1">
                {formData.square_feet || "0.00"} sq ft
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <Label className="text-primary font-medium">Final Rate (Auto-calculated)</Label>
              <div className="text-2xl font-bold text-primary mt-1">
                ₹{formData.final_rate || "0.00"}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:bg-primary-hover" 
              disabled={updateWorkEntry.isPending || !formData.college_id}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateWorkEntry.isPending ? "Updating..." : "Update Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
