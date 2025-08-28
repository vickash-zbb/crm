import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/dashboard/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Calendar as CalendarIcon,
  Loader2,
  Download,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { useAttendance, useCreateAttendance, useUpdateAttendance, useDeleteAttendance, type AttendanceRecord } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { setupDatabase } from "@/utils/databaseSetup";

interface AttendanceFormData {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workDescription?: string;
  overtime?: number;
}

const Attendance = () => {
  const { data: attendanceRecords = [], isLoading, error } = useAttendance();
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  const { data: employees = [] } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCheckIn, setFilterCheckIn] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isSettingUpDatabase, setIsSettingUpDatabase] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const [newAttendance, setNewAttendance] = useState<AttendanceFormData>({
    employeeId: "",
    employeeName: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: "",
    checkOut: "",
    status: "present",
    workDescription: "",
    overtime: 0
  });

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.work_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;

    // Date range filter logic
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const recordDate = new Date(record.date);
      matchesDate = recordDate >= dateRange.from && recordDate <= dateRange.to;
    } else if (dateRange?.from) {
      const recordDate = new Date(record.date);
      matchesDate = recordDate >= dateRange.from;
    } else if (dateRange?.to) {
      const recordDate = new Date(record.date);
      matchesDate = recordDate <= dateRange.to;
    }

    // Check-in filter logic
    let matchesCheckIn = true;
    if (filterCheckIn === "checked-in") {
      matchesCheckIn = record.check_in !== null;
    } else if (filterCheckIn === "not-checked-in") {
      matchesCheckIn = record.check_in === null;
    } else if (filterCheckIn === "checked-out") {
      matchesCheckIn = record.check_out !== null;
    } else if (filterCheckIn === "not-checked-out") {
      matchesCheckIn = record.check_out === null;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesCheckIn;
  });

  const calculateTotalHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;

    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    const inTime = inHour + inMin / 60;
    const outTime = outHour + outMin / 60;

    return Math.max(0, outTime - inTime);
  };

  const handleMarkAttendance = () => {
    if (!newAttendance.employeeId || !newAttendance.checkIn) return;

    const totalHours = newAttendance.checkOut ?
      calculateTotalHours(newAttendance.checkIn, newAttendance.checkOut) : 0;

    createAttendance.mutate({
      employee_id: newAttendance.employeeId,
      date: newAttendance.date,
      check_in: newAttendance.checkIn,
      check_out: newAttendance.checkOut || undefined,
      total_hours: totalHours,
      status: newAttendance.status,
      work_description: newAttendance.workDescription,
      overtime: newAttendance.overtime
    });

    setNewAttendance({
      employeeId: "",
      employeeName: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "",
      checkOut: "",
      status: "present",
      workDescription: "",
      overtime: 0
    });
    setIsMarkDialogOpen(false);
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setNewAttendance({
      employeeId: record.employee_id,
      employeeName: record.employees?.name || "",
      date: record.date,
      checkIn: record.check_in || "",
      checkOut: record.check_out || "",
      status: record.status as 'present' | 'absent' | 'late' | 'half-day',
      workDescription: record.work_description || "",
      overtime: record.overtime || 0
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAttendance = () => {
    if (!editingRecord || !newAttendance.employeeId || !newAttendance.checkIn) return;

    const totalHours = newAttendance.checkOut ?
      calculateTotalHours(newAttendance.checkIn, newAttendance.checkOut) : 0;

    updateAttendance.mutate({
      id: editingRecord.id,
      data: {
        employee_id: newAttendance.employeeId,
        date: newAttendance.date,
        check_in: newAttendance.checkIn,
        check_out: newAttendance.checkOut || undefined,
        total_hours: totalHours,
        status: newAttendance.status,
        work_description: newAttendance.workDescription,
        overtime: newAttendance.overtime
      }
    });

    setEditingRecord(null);
    setIsEditDialogOpen(false);
    setNewAttendance({
      employeeId: "",
      employeeName: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "",
      checkOut: "",
      status: "present",
      workDescription: "",
      overtime: 0
    });
  };

  const handleDeleteAttendance = (id: string) => {
    deleteAttendance.mutate(id);
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return 'bg-success/10 text-success border-success/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'half-day':
        return 'bg-blue-100/10 text-blue-600 border-blue-200/20';
      default:
        return 'bg-muted';
    }
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <AlertCircle className="h-4 w-4" />;
      case 'half-day':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Database setup function
  const handleDatabaseSetup = async () => {
    setIsSettingUpDatabase(true);
    try {
      const success = await setupDatabase();
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Database setup failed:", error);
    } finally {
      setIsSettingUpDatabase(false);
    }
  };

  // Calculate statistics for selected date range (or all records if no range selected)
  const selectedDateRecords = (() => {
    if (dateRange?.from && dateRange?.to) {
      return attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
      });
    } else if (dateRange?.from) {
      return attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= dateRange.from!;
      });
    } else if (dateRange?.to) {
      return attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate <= dateRange.to!;
      });
    }
    return attendanceRecords;
  })();

  const presentCount = selectedDateRecords.filter(r => r.status === 'present').length;
  const absentCount = selectedDateRecords.filter(r => r.status === 'absent').length;
  const lateCount = selectedDateRecords.filter(r => r.status === 'late').length;
  const totalHoursWorked = selectedDateRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Attendance Management</h2>
            <p className="text-muted-foreground">Track employee attendance and working hours</p>
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

            <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                  <DialogDescription>
                    Record attendance for an employee.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee *</Label>
                    <Select
                      value={newAttendance.employeeId}
                      onValueChange={(value) => {
                        const employee = employees.find(e => e.id === value);
                        setNewAttendance(prev => ({
                          ...prev,
                          employeeId: value,
                          employeeName: employee?.name || ""
                        }));
                      }}
                      disabled={employees.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          employees.length === 0
                            ? "Loading employees..."
                            : "Select employee"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No employees available. Please add employees first.
                          </div>
                        ) : (
                          employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.role}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Check In Time *</Label>
                    <Input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Check Out Time</Label>
                    <Input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newAttendance.status}
                      onValueChange={(value: string) => setNewAttendance(prev => ({ ...prev, status: value as 'present' | 'absent' | 'late' | 'half-day' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Overtime Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newAttendance.overtime}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, overtime: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Work Description</Label>
                    <Input
                      value={newAttendance.workDescription}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, workDescription: e.target.value }))}
                      placeholder="Describe the work done today"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMarkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkAttendance}>
                    Mark Attendance
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
                <p className="text-sm text-muted-foreground font-medium">Present Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : presentCount}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Absent Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : absentCount}
                </p>
              </div>
              <UserX className="h-8 w-8 text-destructive" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Late Arrivals</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : lateCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalHoursWorked.toFixed(1)}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-gradient-card border-0 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or work description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Check-in Status</Label>
              <Select value={filterCheckIn} onValueChange={setFilterCheckIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                  <SelectItem value="checked-out">Checked Out</SelectItem>
                  <SelectItem value="not-checked-out">Not Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report ({filteredRecords.length} records)
              </Button>
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Attendance Records {dateRange?.from ? (
                  dateRange?.to ? (
                    `- ${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
                  ) : (
                    `- From ${format(dateRange.from, "MMM dd, yyyy")}`
                  )
                ) : "- All Dates"}
              </h3>
              {attendanceRecords.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground mt-1">
                  No attendance data found. Try clicking "Setup Database" or use the date filter above.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              
              {(dateRange || filterStatus !== "all" || filterCheckIn !== "all" || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange(undefined);
                    setFilterStatus("all");
                    setFilterCheckIn("all");
                    setSearchTerm("");
                  }}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Clear Filters
                </Button>
              )}
              {dateRange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                >
                  Show All Dates
                </Button>
              )}
              <Badge variant="outline">
                {filteredRecords.length} of {attendanceRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Description</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.employees?.name}</div>
                      <div className="text-sm text-muted-foreground">{record.date}</div>
                    </TableCell>
                    <TableCell>{record.check_in || '-'}</TableCell>
                    <TableCell>{record.check_out || '-'}</TableCell>
                    <TableCell>
                      {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(record.status)}
                          <span>{record.status.replace('-', ' ')}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.work_description || '-'}
                    </TableCell>
                    <TableCell>
                      {record.overtime ? `${record.overtime}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAttendance(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteAttendance(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Attendance</DialogTitle>
                  <DialogDescription>
                    Update attendance record.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee *</Label>
                    <Select
                      value={newAttendance.employeeId}
                      onValueChange={(value) => {
                        const employee = employees.find(e => e.id === value);
                        setNewAttendance(prev => ({
                          ...prev,
                          employeeId: value,
                          employeeName: employee?.name || ""
                        }));
                      }}
                      disabled={employees.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          employees.length === 0
                            ? "Loading employees..."
                            : "Select employee"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No employees available. Please add employees first.
                          </div>
                        ) : (
                          employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.role}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Check In Time *</Label>
                    <Input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Check Out Time</Label>
                    <Input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newAttendance.status}
                      onValueChange={(value: string) => setNewAttendance(prev => ({ ...prev, status: value as 'present' | 'absent' | 'late' | 'half-day' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Overtime Hours</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newAttendance.overtime}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, overtime: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Work Description</Label>
                    <Input
                      value={newAttendance.workDescription}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, workDescription: e.target.value }))}
                      placeholder="Describe the work done today"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateAttendance}>
                    Update Attendance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Status Information */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Connection Issue</h3>
                <p className="text-sm text-red-700">{error.message}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Refresh Page
                  </Button>
                </div>
              </div>
            )}

            {employees.length === 0 && !isLoading && !error && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">👥 No Employees Available</h3>
                <p className="text-sm text-blue-700 mb-3">
                  No employees found. You need employees before you can mark attendance.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDatabaseSetup}
                    disabled={isSettingUpDatabase}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {isSettingUpDatabase ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isSettingUpDatabase ? "Setting up..." : "Setup Database"}
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading attendance records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No attendance records found.
                </p>
                {attendanceRecords.length === 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Get started by setting up your database or marking attendance for employees.
                    </p>
                    <div className="flex gap-2 justify-center">
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
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Attendance;
