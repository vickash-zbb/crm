import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
  Edit, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Filter,
  Download
} from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workDescription?: string;
  overtime?: number;
}

// Mock attendance data
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Rajesh Kumar',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    totalHours: 9,
    status: 'present',
    workDescription: 'Electrical maintenance in Building A',
    overtime: 1
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Priya Sharma',
    date: '2024-01-15',
    checkIn: '09:15',
    checkOut: '17:45',
    totalHours: 8.5,
    status: 'late',
    workDescription: 'Cleaning supervision'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Amit Patel',
    date: '2024-01-15',
    checkIn: '08:45',
    checkOut: '17:00',
    totalHours: 8.25,
    status: 'present',
    workDescription: 'Carpentry work in dormitory'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Sunita Devi',
    date: '2024-01-15',
    checkIn: '',
    checkOut: '',
    totalHours: 0,
    status: 'absent',
    workDescription: 'On medical leave'
  },
  {
    id: '5',
    employeeId: '1',
    employeeName: 'Rajesh Kumar',
    date: '2024-01-14',
    checkIn: '09:30',
    checkOut: '13:00',
    totalHours: 3.5,
    status: 'half-day',
    workDescription: 'Emergency plumbing repair'
  }
];

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  
  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    employeeName: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: "",
    checkOut: "",
    status: "present" as AttendanceRecord['status'],
    workDescription: "",
    overtime: 0
  });

  // Mock employee list for dropdown
  const employees = [
    { id: '1', name: 'Rajesh Kumar' },
    { id: '2', name: 'Priya Sharma' },
    { id: '3', name: 'Amit Patel' },
    { id: '4', name: 'Sunita Devi' }
  ];

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.workDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    
    const recordDate = new Date(record.date);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const matchesDate = record.date === selectedDateStr;
    
    return matchesSearch && matchesStatus && matchesDate;
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
    
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: newAttendance.employeeId,
      employeeName: newAttendance.employeeName,
      date: newAttendance.date,
      checkIn: newAttendance.checkIn,
      checkOut: newAttendance.checkOut || undefined,
      totalHours,
      status: newAttendance.status,
      workDescription: newAttendance.workDescription,
      overtime: newAttendance.overtime
    };
    
    setAttendanceRecords([record, ...attendanceRecords]);
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

  // Calculate statistics for selected date
  const selectedDateRecords = attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd'));
  const presentCount = selectedDateRecords.filter(r => r.status === 'present').length;
  const absentCount = selectedDateRecords.filter(r => r.status === 'absent').length;
  const lateCount = selectedDateRecords.filter(r => r.status === 'late').length;
  const totalHoursWorked = selectedDateRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Attendance Management</h2>
            <p className="text-muted-foreground">Track employee attendance and working hours</p>
          </div>
          
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
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
                    onValueChange={(value: AttendanceRecord['status']) => setNewAttendance(prev => ({ ...prev, status: value }))}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Present Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{presentCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Absent Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{absentCount}</p>
              </div>
              <UserX className="h-8 w-8 text-destructive" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Late Arrivals</p>
                <p className="text-3xl font-bold text-foreground mt-1">{lateCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalHoursWorked.toFixed(1)}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-gradient-card border-0 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Attendance Records - {format(selectedDate, "PPP")}
            </h3>
            <Badge variant="outline">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </Badge>
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
                      <div className="font-medium">{record.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{record.date}</div>
                    </TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>
                      {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
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
                      {record.workDescription || '-'}
                    </TableCell>
                    <TableCell>
                      {record.overtime ? `${record.overtime}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No attendance records found for {format(selectedDate, "PPP")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Attendance;
