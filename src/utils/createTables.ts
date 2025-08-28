import { supabase } from "@/integrations/supabase/client";

export const createDatabaseTables = async () => {
  console.log("🏗️ Creating database tables...");

  try {
    // Try to create employees table
    console.log("📝 Creating employees table...");
    const { error: empError } = await supabase
      .from("employees")
      .insert({
        name: "Test Employee",
        email: "test@example.com",
        role: "worker",
        department: "Test",
        salary: 0,
        join_date: new Date().toISOString().split('T')[0],
        status: "active"
      });

    if (empError && empError.code === '42P01') {
      console.error("❌ Employees table doesn't exist");
      return {
        success: false,
        message: "Tables need to be created manually. Please follow the setup instructions in the browser console."
      };
    }

    // If we get here, table exists, so delete the test record
    if (!empError) {
      console.log("✅ Employees table exists, cleaning up test data...");
      await supabase
        .from("employees")
        .delete()
        .eq("email", "test@example.com");
    }

    // Try to create attendance table
    console.log("📝 Checking attendance table...");
    const { error: attError } = await supabase
      .from("attendance")
      .insert({
        employee_id: "00000000-0000-0000-0000-000000000000", // dummy ID
        date: new Date().toISOString().split('T')[0],
        status: "present"
      });

    if (attError && attError.code === '42P01') {
      console.error("❌ Attendance table doesn't exist");
      return {
        success: false,
        message: "Attendance table needs to be created manually."
      };
    }

    // If we get here, table exists, so delete the test record
    if (!attError) {
      console.log("✅ Attendance table exists, cleaning up test data...");
      await supabase
        .from("attendance")
        .delete()
        .eq("employee_id", "00000000-0000-0000-0000-000000000000");
    }

    console.log("✅ All tables exist!");
    return {
      success: true,
      message: "Database tables are ready!"
    };

  } catch (error) {
    console.error("💥 Error during table creation:", error);
    return {
      success: false,
      message: "Unexpected error occurred. Check console for details."
    };
  }
};

// Instructions for manual table creation
export const getSetupInstructions = () => {
  return {
    title: "Database Setup Required",
    steps: [
      {
        step: 1,
        title: "Go to Supabase Dashboard",
        description: "Open https://supabase.com/dashboard in your browser",
        url: "https://supabase.com/dashboard"
      },
      {
        step: 2,
        title: "Open Your Project",
        description: "Select project: paxouzpgfiugwwvqeidd"
      },
      {
        step: 3,
        title: "Go to SQL Editor",
        description: "Click on 'SQL Editor' in the left sidebar"
      },
      {
        step: 4,
        title: "Create Employees Table",
        description: "Copy and paste the SQL from the employees migration file",
        sqlFile: "supabase/migrations/20250828140500_create_employees_table.sql"
      },
      {
        step: 5,
        title: "Create Attendance Table",
        description: "Copy and paste the SQL from the attendance migration file",
        sqlFile: "supabase/migrations/20250828140600_create_attendance_table.sql"
      },
      {
        step: 6,
        title: "Run the SQL",
        description: "Click 'Run' to execute each SQL statement"
      },
      {
        step: 7,
        title: "Return to Application",
        description: "Come back to your app and click 'Setup Database' again"
      }
    ]
  };
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).createDatabaseTables = createDatabaseTables;
  (window as any).getSetupInstructions = getSetupInstructions;
}