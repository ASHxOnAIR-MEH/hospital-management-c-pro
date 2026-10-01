import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvDir = path.join(__dirname, 'csv');
const outputFile = path.join(__dirname, 'Hospital_Bed_Database_Template.xlsx');

const sheetsConfig = [
  { name: 'Beds', filename: 'Beds.csv' },
  { name: 'Wards', filename: 'Wards.csv' },
  { name: 'Patients', filename: 'Patients.csv' },
  { name: 'Users', filename: 'Users.csv' },
  { name: 'ActivityLog', filename: 'ActivityLog.csv' },
  { name: 'Settings', filename: 'Settings.csv' },
];

const workbook = XLSX.utils.book_new();

sheetsConfig.forEach(({ name, filename }) => {
  const filePath = path.join(csvDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse CSV content into 2D array of rows
  const lines = content.trim().split('\n').map(line => {
    // Handle comma separated values
    return line.split(',').map(cell => cell.trim());
  });

  const worksheet = XLSX.utils.aoa_to_sheet(lines);
  
  // Append sheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
  console.log(`Added sheet: ${name} (${lines.length} rows)`);
});

XLSX.writeFile(workbook, outputFile);
console.log(`Successfully generated multi-sheet workbook at: ${outputFile}`);
