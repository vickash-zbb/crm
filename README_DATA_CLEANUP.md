# Data Cleanup Tool

This document provides instructions on how to use the Data Cleanup Tool to identify and remove unwanted data from your work entries database.

## Overview

The Data Cleanup Tool helps you identify and remove various types of unwanted data from your database, including:

- Duplicate entries
- Incomplete records
- Test data
- Orphaned entries

## Accessing the Tool

1. Start your application by running `npm run dev`
2. Navigate to the dashboard at `http://localhost:5173`
3. In the "Quick Actions" section, you'll see a new "Data Cleanup" card
4. Click on the "Data Cleanup" card to access the tool

Alternatively, you can directly navigate to `http://localhost:5173/data-cleanup`

## Using the Tool

### 1. Analyze Data

Click the "Analyze Data" button to scan your database for unwanted data. The tool will check for:

- **Duplicate Entries**: Entries with the same college, location, work description, and date
- **Incomplete Entries**: Entries missing required information
- **Test Entries**: Entries containing test-related keywords
- **Orphaned Entries**: Entries referencing colleges that no longer exist

### 2. Review Findings

After analysis, the tool will display the results in separate sections for each type of unwanted data. Each section shows:

- The count of unwanted entries
- A description of what constitutes that type of unwanted data
- A "Delete All" button to remove all entries of that type

### 3. Delete Unwanted Data

You can choose to:

- Delete specific types of unwanted data by clicking the "Delete All" button in each section
- Delete all unwanted data at once by clicking the "Delete All Unwanted Data" button at the bottom

## Important Notes

- **Data deletion is permanent**: Once data is deleted, it cannot be recovered
- **Review carefully**: Always review the entries that will be deleted before confirming
- **Backup recommended**: It's highly recommended to backup your database before performing any cleanup operations
- **Manager access required**: This tool is only accessible to users with manager privileges

## Technical Details

The Data Cleanup Tool is implemented in the following files:

- `src/components/work-entry/DataCleanupTool.tsx` - The main component
- `src/pages/DataCleanup.tsx` - The page that hosts the tool
- `src/App.tsx` - Routing configuration

The tool uses the existing Supabase integration and React Query hooks to interact with the database.

## Troubleshooting

If you encounter any issues:

1. Ensure your Supabase connection is working correctly
2. Check the browser console for any error messages
3. Verify you have manager privileges to access the tool
4. Make sure the application is running correctly

## Customization

You can customize the detection criteria by modifying the functions in `DataCleanupTool.tsx`:

- `findDuplicateEntries`: Adjust what constitutes a duplicate
- `findIncompleteEntries`: Modify required fields
- `findTestEntries`: Update test keywords
- `findOrphanedEntries`: Change orphaned entry detection logic
