import { supabase } from "@/integrations/supabase/client";

export const setupDatabase = async () => {
  console.log("🚀 Starting database setup...");

  try {
    // Check if employees table exists
    const { data: existingEmployees, error: checkError } = await supabase
      .from("employees")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.error("❌ Employees table doesn't exist!");
      console.log("📋 To fix this:");
      console.log("1. Go to your Supabase dashboard: https://supabase.com/dashboard");
      console.log("2. Open your project (paxouzpgfiugwwvqeidd)");
      console.log("3. Go to SQL Editor");
      console.log("4. Copy and paste the SQL from: supabase/migrations/20250828140500_create_employees_table.sql");
      console.log("5. Run the SQL to create the employees table");
      console.log("6. Then copy and paste the SQL from: supabase/migrations/20250828140600_create_attendance_table.sql");
      console.log("7. Run the SQL to create the attendance table");
      console.log("8. Come back and click 'Setup Database' again");

      // Show alert to user
      alert("Database tables don't exist! Please check the browser console for setup instructions, or create the tables manually in Supabase dashboard using the migration files.");

      return false;
    } else if (checkError) {
      console.error("❌ Error checking employees table:", checkError);
      return false;
    } else {
      console.log("✅ Employees table exists");
    }

    // Check if attendance table exists
    const { data: existingAttendance, error: attendanceCheckError } = await supabase
      .from("attendance")
      .select("id")
      .limit(1);

    if (attendanceCheckError && attendanceCheckError.code === '42P01') {
      console.error("❌ Attendance table doesn't exist!");
      console.log("📋 Please create the attendance table using the migration file:");
      console.log("supabase/migrations/20250828140600_create_attendance_table.sql");

      alert("Attendance table doesn't exist! Please create it using the migration file in Supabase dashboard.");

      return false;
    } else if (attendanceCheckError) {
      console.error("❌ Error checking attendance table:", attendanceCheckError);
      return false;
    } else {
      console.log("✅ Attendance table exists");
    }

    // Insert sample employees if table is empty
    const { count: employeeCount, error: countError } = await supabase
      .from("employees")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting employees:", countError);
      return false;
    }

    if (employeeCount === 0) {
      console.log("📝 Inserting sample employees...");

      const sampleEmployees = [
        {
          name: "Rajesh Kumar",
          email: "rajesh.kumar@college.com",
          phone: "+91 9876543210",
          role: "manager",
          department: "Maintenance",
          salary: 45000,
          join_date: "2023-01-15",
          status: "active",
          address: "Mumbai, Maharashtra",
          skills: "Project Management,Electrical,Team Leadership"
        },
        {
          name: "Priya Sharma",
          email: "priya.sharma@college.com",
          phone: "+91 9876543211",
          role: "supervisor",
          department: "Cleaning",
          salary: 28000,
          join_date: "2023-03-20",
          status: "active",
          address: "Delhi, India",
          skills: "Quality Control,Team Management,Cleaning"
        },
        {
          name: "Amit Patel",
          email: "amit.patel@college.com",
          phone: "+91 9876543212",
          role: "worker",
          department: "Carpentry",
          salary: 22000,
          join_date: "2023-06-10",
          status: "active",
          address: "Pune, Maharashtra",
          skills: "Carpentry,Furniture Making,Wood Work"
        },
        {
          name: "Sunita Devi",
          email: "sunita.devi@college.com",
          phone: "+91 9876543213",
          role: "worker",
          department: "Cleaning",
          salary: 18000,
          join_date: "2023-08-05",
          status: "on-leave",
          address: "Chennai, Tamil Nadu",
          skills: "Cleaning,Housekeeping"
        }
      ];

      const { error: insertError } = await supabase
        .from("employees")
        .insert(sampleEmployees);

      if (insertError) {
        console.error("❌ Error inserting sample employees:", insertError);
        return false;
      }

      console.log("✅ Sample employees inserted successfully");
    }

    // Insert sample attendance if table is empty
    const { count: attendanceCount, error: attendanceCountError } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true });

    if (attendanceCountError) {
      console.error("❌ Error counting attendance records:", attendanceCountError);
      return false;
    }

    if (attendanceCount === 0) {
      console.log("📝 Inserting sample attendance...");

      // Get employee IDs for sample data
      const { data: employees } = await supabase
        .from("employees")
        .select("id, email")
        .in("email", ["rajesh.kumar@college.com", "priya.sharma@college.com", "amit.patel@college.com", "sunita.devi@college.com"]);

      if (employees && employees.length > 0) {
        const sampleAttendance = [
          {
            employee_id: employees.find(e => e.email === "rajesh.kumar@college.com")?.id,
            date: "2024-01-15",
            check_in: "09:00",
            check_out: "18:00",
            total_hours: 9.0,
            status: "present",
            work_description: "Electrical maintenance in Building A",
            overtime: 1.0
          },
          {
            employee_id: employees.find(e => e.email === "priya.sharma@college.com")?.id,
            date: "2024-01-15",
            check_in: "09:15",
            check_out: "17:45",
            total_hours: 8.5,
            status: "late",
            work_description: "Cleaning supervision",
            overtime: 0
          },
          {
            employee_id: employees.find(e => e.email === "amit.patel@college.com")?.id,
            date: "2024-01-15",
            check_in: "08:45",
            check_out: "17:00",
            total_hours: 8.25,
            status: "present",
            work_description: "Carpentry work in dormitory",
            overtime: 0
          },
          {
            employee_id: employees.find(e => e.email === "sunita.devi@college.com")?.id,
            date: "2024-01-15",
            check_in: null,
            check_out: null,
            total_hours: 0,
            status: "absent",
            work_description: "On medical leave",
            overtime: 0
          }
        ].filter(record => record.employee_id); // Filter out records with undefined employee_id

        const { error: attendanceInsertError } = await supabase
          .from("attendance")
          .insert(sampleAttendance);

        if (attendanceInsertError) {
          console.error("❌ Error inserting sample attendance:", attendanceInsertError);
          return false;
        }

        console.log("✅ Sample attendance inserted successfully");
      }
    }

    console.log("🎉 Database setup completed successfully!");
    return true;

  } catch (error) {
    console.error("💥 Unexpected error during database setup:", error);
    return false;
  }
};

// Function to run setup from browser console
export const runDatabaseSetup = () => {
  setupDatabase().then(success => {
    if (success) {
      console.log("✅ Database setup completed! Please refresh the page to see the data.");
    } else {
      console.error("❌ Database setup failed. Check the console for details.");
    }
  });
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).runDatabaseSetup = runDatabaseSetup;
}