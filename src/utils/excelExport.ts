import * as XLSX from 'xlsx';
import { WorkEntry } from '@/hooks/useWorkEntries';
import { AttendanceRecord } from '@/hooks/useAttendance';

export const exportToExcel = (workEntries: WorkEntry[], filename: string = 'work-entries.xlsx') => {
  // Prepare data for Excel export
  const excelData = workEntries.map((entry) => ({
    'Date': new Date(entry.date).toLocaleDateString(),
    'College': entry.colleges?.name || 'N/A',
    'College Location': entry.colleges?.location || 'N/A',
    'Work Location': entry.location,
    'Work Description': entry.work_description,
    'Work Type': entry.work_type,
    'Length': entry.length || 0,
    'Width': entry.width || 0,
    'Height': entry.height || 0,
    'Square Feet': entry.square_feet || 0,
    'Rate per Sq Ft': entry.rate_per_sqft || 0,
    'Final Rate': entry.final_rate || 0,
    'Status': entry.status,
    'Created At': new Date(entry.created_at).toLocaleString(),
    'Updated At': new Date(entry.updated_at).toLocaleString(),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const colWidths = Object.keys(excelData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Entries');

  // Generate and download the file
  XLSX.writeFile(workbook, filename);
};

export const exportAttendanceToExcel = (attendanceRecords: AttendanceRecord[], filename: string = 'attendance-records.xlsx') => {
  // Prepare data for Excel export
  const excelData = attendanceRecords.map((record) => ({
    'Date': new Date(record.date).toLocaleDateString(),
    'Employee Name': record.employees?.name || 'N/A',
    'Employee Email': record.employees?.email || 'N/A',
    'Employee Role': record.employees?.role || 'N/A',
    'Employee Department': record.employees?.department || 'N/A',
    'Check In Time': record.check_in || 'N/A',
    'Check Out Time': record.check_out || 'N/A',
    'Total Hours': record.total_hours || 0,
    'Status': record.status,
    'Work Description': record.work_description || 'N/A',
    'Overtime Hours': record.overtime || 0,
    'Created At': new Date(record.created_at).toLocaleString(),
    'Updated At': new Date(record.updated_at).toLocaleString(),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const colWidths = Object.keys(excelData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

  // Generate and download the file
  XLSX.writeFile(workbook, filename);
};

export const exportCustomWorkEntries = (customEntries: any[], filename: string = 'work-entries.xlsx') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(customEntries);

  // Auto-size columns
  const colWidths = Object.keys(customEntries[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Entries');

  // Generate and download the file
  XLSX.writeFile(workbook, filename);
};

export const exportCollegesToExcel = (colleges: any[], filename: string = 'colleges.xlsx') => {
  // Prepare data for Excel export
  const excelData = colleges.map((college) => ({
    'College Name': college.name,
    'Location': college.location || 'N/A',
    'Contact Person': college.contact_person || 'N/A',
    'Phone': college.phone || 'N/A',
    'Email': college.email || 'N/A',
    'Address': college.address || 'N/A',
    'Created At': new Date(college.created_at).toLocaleString(),
    'Updated At': new Date(college.updated_at).toLocaleString(),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Auto-size columns
  const colWidths = Object.keys(excelData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Colleges');
  
  // Generate and download the file
  XLSX.writeFile(workbook, filename);
};