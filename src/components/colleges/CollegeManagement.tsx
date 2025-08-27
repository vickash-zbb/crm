import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useColleges, useCreateCollege, useUpdateCollege, useDeleteCollege, type CreateCollegeData } from "@/hooks/useColleges";
import { exportCollegesToExcel } from "@/utils/excelExport";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const CollegeManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [formData, setFormData] = useState<CreateCollegeData>({
    name: "",
    location: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });

  const { data: colleges = [], isLoading } = useColleges();
  const createMutation = useCreateCollege();
  const updateMutation = useUpdateCollege();
  const deleteMutation = useDeleteCollege();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCollege) {
      await updateMutation.mutateAsync({ id: editingCollege.id, data: formData });
      setEditingCollege(null);
    } else {
      await createMutation.mutateAsync(formData);
      setIsCreateOpen(false);
    }
    
    setFormData({
      name: "",
      location: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  const handleEdit = (college: any) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      location: college.location || "",
      contact_person: college.contact_person || "",
      phone: college.phone || "",
      email: college.email || "",
      address: college.address || "",
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleExport = () => {
    if (colleges.length > 0) {
      exportCollegesToExcel(colleges);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading colleges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">College Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add College
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New College</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">College Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  Create College
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {colleges.map((college) => (
          <Card key={college.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{college.name}</h3>
                {college.location && (
                  <p className="text-sm text-muted-foreground">📍 {college.location}</p>
                )}
                {college.contact_person && (
                  <p className="text-sm text-muted-foreground">👤 {college.contact_person}</p>
                )}
                {college.phone && (
                  <p className="text-sm text-muted-foreground">📞 {college.phone}</p>
                )}
                {college.email && (
                  <p className="text-sm text-muted-foreground">✉️ {college.email}</p>
                )}
                {college.address && (
                  <p className="text-sm text-muted-foreground">🏢 {college.address}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog open={editingCollege?.id === college.id} onOpenChange={(open) => !open && setEditingCollege(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(college)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit College</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">College Name *</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-location">Location</Label>
                        <Input
                          id="edit-location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-contact">Contact Person</Label>
                        <Input
                          id="edit-contact"
                          value={formData.contact_person}
                          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-address">Address</Label>
                        <Textarea
                          id="edit-address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                        Update College
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete College</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{college.name}"? This will also delete all associated work entries. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(college.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
        {colleges.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No colleges found. Add your first college to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
};