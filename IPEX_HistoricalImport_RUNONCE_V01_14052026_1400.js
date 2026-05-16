// IPEX_HistoricalImport_RUNONCE_V01_14052026_1400.js
// PURPOSE: One-time import of historical GSheet data (Excel) into Supabase historical_projects table
// RUN ONCE ONLY — will skip if data already exists
// Usage: node IPEX_HistoricalImport_RUNONCE_V01_14052026_1400.js

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const EXCEL_PATH = 'Projects_Sheet_1-6.xlsx'; // Place Excel file in same folder as this script
const SUPABASE_URL = 'https://pqoooitidrmnlnzvbiml.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Set as environment variable OR paste key below
// const SUPABASE_KEY = 'your-anon-key-here'; // Uncomment and paste if needed
const BATCH_SIZE = 200;

// ─── SHEET COLUMN MAPS ────────────────────────────────────────────────────
// Maps each sheet to its actual column names
const SHEET_MAP = {
  'Project Sheet 6': {
    code:    'Project Code',
    status:  null,
    req:     'Customer Requirement Extract from email Body',
    cust:    'Email  Receiver',
    date:    'Date of email',
    comments:'Inside Comments',
  },
  'Project Sheet 5': {
    code:    'Project Code',
    status:  'Internal Status',
    req:     'Customer Requirement\nArsalan',
    cust:    'CUSTOMER DETAILS',
    date:    'Date of enquiry',
    comments:'Comments\nANY ONE',
  },
  'Project Sheet 4': {
    code:    'Project Code',
    status:  'Internal Status',
    req:     'Customer Requirement\nArsalan',
    cust:    'CUSTOMER DETAILS',
    date:    'Date of enquiry',
    comments:'Comments\nANY ONE',
  },
  'Projects sheet 3': {
    code:    ' ',
    status:  'Internal Status',
    req:     'Customer Requirement\nArsalan',
    cust:    'CUSTOMER DETAILS',
    date:    'Date of enquiry',
    comments:'Comments\nANY ONE',
  },
  'Project Sheet 2': {
    code:    'Project Codes',
    status:  '  Internal Status',
    req:     'Customer Requirement\nYasir/Hasan/Arsalan',
    cust:    'CUSTOMER DETAILS',
    date:    'Enquiry Arrival Date',
    comments:'Comments\nANY ONE',
  },
  'Project Sheet 1': {
    code:    'A',
    status:  'Internal Status',
    req:     'Customer Requirement\nYasir/Hasan/Arsalan',
    cust:    'CUSTOMER DETAILS',
    date:    'Enquiry Arrival Date',
    comments:'Comments\nANY ONE',
  },
};

const SKIP_SHEETS = ['Used', 'Sheet37'];

// ─── HELPERS ──────────────────────────────────────────────────────────────
function clean(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' || s === 'NaN' || s === 'undefined' ? null : s;
}

function extractRows(sheet, sheetName) {
  const map = SHEET_MAP[sheetName];
  if (!map) return [];

  const rows = [];
  for (const row of sheet) {
    const code    = clean(row[map.code]);
    const req     = clean(row[map.req]);
    const cust    = clean(row[map.cust]);
    const status  = map.status ? clean(row[map.status]) : null;
    const date    = map.date ? clean(row[map.date]) : null;
    const comments= map.comments ? clean(row[map.comments]) : null;

    // Skip completely empty rows
    if (!code && !req && !cust) continue;

    rows.push({
      project_code:         code,
      internal_status:      status,
      customer_requirement: req,
      customer_details:     cust,
      enquiry_date:         date,
      comments:             comments,
      source_sheet:         sheetName,
    });
  }
  return rows;
}

async function insertBatch(supabase, batch) {
  const { error } = await supabase
    .from('historical_projects')
    .insert(batch);
  if (error) throw new Error(`Insert failed: ${error.message}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
(async () => {
  if (!SUPABASE_KEY) {
    console.error('ERROR: SUPABASE_KEY not set. Set env variable or paste key into script.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Safety check — abort if data already exists
  const { count } = await supabase
    .from('historical_projects')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`ABORT: historical_projects already has ${count} rows. Run once only.`);
    console.log('If you need to re-import: DELETE FROM historical_projects; in Supabase SQL Editor first.');
    process.exit(0);
  }

  console.log('Reading Excel file:', EXCEL_PATH);
  const workbook = XLSX.readFile(EXCEL_PATH);

  let totalInserted = 0;
  let allRows = [];

  for (const sheetName of workbook.SheetNames) {
    if (SKIP_SHEETS.includes(sheetName)) {
      console.log(`Skipping sheet: ${sheetName}`);
      continue;
    }

    const ws = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: null });
    const rows = extractRows(rawData, sheetName);
    console.log(`${sheetName}: ${rows.length} rows extracted`);
    allRows = allRows.concat(rows);
  }

  console.log(`\nTotal rows to insert: ${allRows.length}`);
  console.log('Inserting in batches of', BATCH_SIZE, '...');

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);
    await insertBatch(supabase, batch);
    totalInserted += batch.length;
    process.stdout.write(`\rInserted: ${totalInserted} / ${allRows.length}`);
  }

  console.log(`\n\nDONE. ${totalInserted} rows imported into historical_projects.`);
})();
