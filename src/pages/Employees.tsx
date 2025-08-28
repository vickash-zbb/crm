import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Filter,
  Loader2
} from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, type Employee } from "@/hooks/useEmployees";
import { useColleges } from "@/hooks/useColleges";
import { supabase } from "@/integrations/supabase/client";
import { setupDatabase } from "@/utils/databaseSetup";

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'supervisor' | 'worker' | 'admin';
  department: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  address: string;
  skills: string[];
  collegeId?: string;
}

// Mock employee data (will be replaced with real data from database)
const MOCK_EMPLOYEES: Employee[] = [];

const Employees = () => {
  const { data: employees = [], isLoading, error } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { data: colleges = [] } = useColleges();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSettingUpDatabase, setIsSettingUpDatabase] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    role: "worker",
    department: "",
    salary: 0,
    join_date: new Date().toISOString().split('T')[0],
    status: "active",
    address: "",
    skills: "",
  });

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || emp.role === filterRole;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;

    createEmployee.mutate({
      name: newEmployee.name || "",
      email: newEmployee.email || "",
      phone: newEmployee.phone || "",
      role: (newEmployee.role as Employee['role']) || "worker",
      department: newEmployee.department || "",
      salary: newEmployee.salary || 0,
      join_date: newEmployee.join_date || new Date().toISOString().split('T')[0],
      status: (newEmployee.status as Employee['status']) || "active",
      address: newEmployee.address || "",
      skills: newEmployee.skills || "",
      college_id: newEmployee.college_id || undefined,
    });

    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      role: "worker",
      department: "",
      salary: 0,
      join_date: new Date().toISOString().split('T')[0],
      status: "active",
      address: "",
      skills: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({ ...employee });
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee || !newEmployee.name || !newEmployee.email) return;

    updateEmployee.mutate({
      id: editingEmployee.id,
      data: {
        name: newEmployee.name || "",
        email: newEmployee.email || "",
        phone: newEmployee.phone || "",
        role: (newEmployee.role as Employee['role']) || "worker",
        department: newEmployee.department || "",
        salary: newEmployee.salary || 0,
        join_date: newEmployee.join_date || new Date().toISOString().split('T')[0],
        status: (newEmployee.status as Employee['status']) || "active",
        address: newEmployee.address || "",
        skills: newEmployee.skills || "",
        college_id: newEmployee.college_id || undefined,
      }
    });

    setEditingEmployee(null);
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      role: "worker",
      department: "",
      salary: 0,
      join_date: new Date().toISOString().split('T')[0],
      status: "active",
      address: "",
      skills: "",
    });
  };

  const handleDeleteEmployee = (id: string) => {
    deleteEmployee.mutate(id);
  };

  // Comprehensive connection and data test
  const runFullDiagnostic = async () => {
    console.log("🔍 Starting full diagnostic...");

    try {
      // Test 1: Basic Supabase connection
      console.log("1️⃣ Testing Supabase connection...");
      const { data: connectionTest, error: connectionError } = await supabase
        .from("employees")
        .select("count", { count: "exact", head: true });

      if (connectionError) {
        console.error("❌ Connection test failed:", connectionError);
        return;
      }
      console.log("✅ Connection test passed, count:", connectionTest);

      // Test 2: Fetch actual data
      console.log("2️⃣ Testing data fetch...");
      const { data: fetchTest, error: fetchError } = await supabase
        .from("employees")
        .select("*")
        .limit(5);

      if (fetchError) {
        console.error("❌ Data fetch test failed:", fetchError);
        return;
      }
      console.log("✅ Data fetch test passed, data:", fetchTest);

      // Test 3: Check table structure
      console.log("3️⃣ Testing table structure...");
      const { data: structureTest, error: structureError } = await supabase
        .from("employees")
        .select("*")
        .limit(1);

      if (structureError) {
        console.error("❌ Structure test failed:", structureError);
        return;
      }
      console.log("✅ Structure test passed, first record:", structureTest?.[0]);

      console.log("🎉 All diagnostic tests passed!");

    } catch (error) {
      console.error("💥 Diagnostic failed with error:", error);
    }
  };

  // Database setup function
  const handleDatabaseSetup = async () => {
    setIsSettingUpDatabase(true);
    try {
      const success = await setupDatabase();
      if (success) {
        // Refresh the page to reload data
        window.location.reload();
      }
    } catch (error) {
      console.error("Database setup failed:", error);
    } finally {
      setIsSettingUpDatabase(false);
    }
  };

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'on-leave':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted';
    }
  };

  const getRoleColor = (role: Employee['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'worker':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8  flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Employee Management</h2>
            <p className="text-muted-foreground">Manage your workforce across all colleges</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleDatabaseSetup}
              disabled={isSettingUpDatabase}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              {isSettingUpDatabase ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isSettingUpDatabase ? "Setting up..." : "Setup Database"}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the employee details below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value: Employee['role']) => setNewEmployee(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Salary (₹)</Label>
                  <Input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: Number(e.target.value) }))}
                    placeholder="Enter salary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <Input
                    type="date"
                    value={newEmployee.join_date}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, join_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newEmployee.status}
                    onValueChange={(value: Employee['status']) => setNewEmployee(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee}>
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : employees.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> :
                    employees.filter(e => e.status === 'active').length}
                </p>
              </div>
              <User className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">On Leave</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> :
                    employees.filter(e => e.status === 'on-leave').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Avg Salary</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> :
                    employees.length > 0 ?
                      `₹${Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length).toLocaleString()}` :
                      '₹0'
                  }
                </p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-gradient-card border-0 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employee Table */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(employee.role)}>
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.colleges?.name || 'Not Assigned'}</TableCell>
                    <TableCell>₹{employee.salary.toLocaleString()}</TableCell>
                    <TableCell>{new Date(employee.join_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Employee</DialogTitle>
                              <DialogDescription>
                                Update employee information.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                  value={newEmployee.name}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Enter full name"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Email Address *</Label>
                                <Input
                                  type="email"
                                  value={newEmployee.email}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="Enter email address"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                  value={newEmployee.phone}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="Enter phone number"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                  value={newEmployee.role}
                                  onValueChange={(value: Employee['role']) => setNewEmployee(prev => ({ ...prev, role: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="worker">Worker</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                  value={newEmployee.department}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                                  placeholder="Enter department"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Salary (₹)</Label>
                                <Input
                                  type="number"
                                  value={newEmployee.salary}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: Number(e.target.value) }))}
                                  placeholder="Enter salary"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                  value={newEmployee.status}
                                  onValueChange={(value: Employee['status']) => setNewEmployee(prev => ({ ...prev, status: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>College</Label>
                                <Select
                                  value={newEmployee.college_id || ""}
                                  onValueChange={(value) => setNewEmployee(prev => ({ ...prev, college_id: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select college" />
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
                                <Label>College</Label>
                                <Select
                                  value={newEmployee.college_id || ""}
                                  onValueChange={(value) => setNewEmployee(prev => ({ ...prev, college_id: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select college" />
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
                                <Label>Address</Label>
                                <Input
                                  value={newEmployee.address}
                                  onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
                                  placeholder="Enter full address"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingEmployee(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateEmployee}>
                                Update Employee
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {employee.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Debug Information */}
            {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Information</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
                <p><strong>Data Count:</strong> {employees.length}</p>
                <p><strong>Filtered Count:</strong> {filteredEmployees.length}</p>
                <p><strong>Server Port:</strong> Check browser URL - should be 8081</p>
                <p><strong>Database Tables:</strong> Check Supabase dashboard</p>
                <p><strong>Sample Data:</strong> {employees.length > 0 ? employees.slice(0, 2).map(e => e.name).join(', ') : 'No data'}</p>
              </div>
              {employees.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                  <strong>First Employee:</strong>
                  <pre>{JSON.stringify(employees[0], null, 2)}</pre>
                </div>
              )}
              <div className="mt-2 flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Page
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("🧪 Manual test - checking Supabase connection...");
                    // Test direct Supabase call
                    import("@/integrations/supabase/client").then(({ supabase }) => {
                      supabase.from("employees").select("*").limit(1).then(({ data, error }) => {
                        console.log("🧪 Direct Supabase test result:", { data, error });
                      });
                    });
                  }}
                >
                  🧪 Test Connection
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={runFullDiagnostic}
                >
                  🔧 Full Diagnostic
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    console.log("🔄 Force refresh employee data...");
                    // Force invalidate and refetch
                    import("@tanstack/react-query").then(({ useQueryClient }) => {
                      // This will trigger a refetch
                      window.location.reload();
                    });
                  }}
                >
                  🔄 Force Refresh
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    console.log("� Current state:", {
                      employees,
                      isLoading,
                      error: error?.message,
                      count: employees.length
                    });
                  }}
                >
                  📊 Log State
                </Button>
              </div>
            </div> */}

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading employees...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Error loading employees: {error.message}</p>
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm">
                    <strong>Possible Solutions:</strong><br/>
                    1. Check if database tables exist in Supabase<br/>
                    2. Verify you're using the correct URL (localhost:8081)<br/>
                    3. Ensure Supabase environment variables are set<br/>
                    4. Check browser console for detailed errors
                  </p>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employees found matching your criteria.</p>
              </div>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Employees;
