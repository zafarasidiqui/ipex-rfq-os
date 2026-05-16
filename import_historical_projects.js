// RUNONCE: Import historical projects from Excel into Supabase
// Place this file in: H:\IPEX SUPABASE PROJECT\ipex-rfq-os\
// Place Projects_Sheet_1-6.xlsx in the same folder
// Run: node import_historical_projects.js

const XLSX = require('xlsx')
const https = require('https')
const path = require('path')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pqoooitidrmnlnzvbiml.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_KEY) {
  console.error('ERROR: Set SUPABASE_KEY environment variable first')
  process.exit(1)
}

const FILE_PATH = path.join(__dirname, 'Projects_Sheet_1-6.xlsx')

function cleanText(val) {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return s === '' || s === 'NaN' || s === 'nan' ? null : s
}

function parseDate(val) {
  if (!val) return null
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  } catch { return null }
}

function extractRows(wb) {
  const rows = []

  // Sheet 5 — new format, 2720 rows
  const s5 = XLSX.utils.sheet_to_json(wb.Sheets['Project Sheet 5'] || {})
  s5.forEach(r => {
    const code = cleanText(r['Project Code'])
    if (!code) return
    rows.push({
      project_code: code,
      internal_status: cleanText(r['Internal Status']),
      external_process: cleanText(r['Project External Process']),
      enquiry_via: cleanText(r['Enquiry Came through']),
      enquiry_date: parseDate(r['Date of enquiry'] || r['Enquiry Arrival Date']),
      customer_requirement: cleanText(r['Customer Requirement\nArsalan']),
      customer_details: cleanText(r['CUSTOMER DETAILS']),
      comments: cleanText(r['Comments\nANY ONE']),
      source_sheet: 'Sheet5'
    })
  })

  // Sheet 4 — new format, 987 rows
  const s4 = XLSX.utils.sheet_to_json(wb.Sheets['Project Sheet 4'] || {})
  s4.forEach(r => {
    const code = cleanText(r['Project Code'])
    if (!code) return
    rows.push({
      project_code: code,
      internal_status: cleanText(r['Internal Status']),
      external_process: cleanText(r['Project External Process']),
      enquiry_via: cleanText(r['Enquiry Came through']),
      enquiry_date: parseDate(r['Date of enquiry'] || r['Enquiry Arrival Date']),
      customer_requirement: cleanText(r['Customer Requirement\nArsalan']),
      customer_details: cleanText(r['CUSTOMER DETAILS']),
      comments: cleanText(r['Comments\nANY ONE']),
      source_sheet: 'Sheet4'
    })
  })

  // Sheet 2 — old format, 990 rows (project code in 'Project code Raw')
  const s2 = XLSX.utils.sheet_to_json(wb.Sheets['Project Sheet 2'] || {})
  s2.forEach(r => {
    const code = cleanText(r['Project code Raw'])
    if (!code) return
    rows.push({
      project_code: code,
      internal_status: cleanText(r['  Internal Status']),
      external_process: cleanText(r['Project External Process']),
      enquiry_via: cleanText(r['Enquiry Came through']),
      enquiry_date: parseDate(r['Enquiry Arrival Date']),
      customer_requirement: cleanText(r['Customer Requirement\nYasir/Hasan/Arsalan']),
      customer_details: cleanText(r['CUSTOMER DETAILS']),
      comments: cleanText(r['Comments\nANY ONE']),
      source_sheet: 'Sheet2'
    })
  })

  // Sheet 1 — oldest format, 107 rows (project code in 'Project code')
  const s1 = XLSX.utils.sheet_to_json(wb.Sheets['Project Sheet 1'] || {})
  s1.forEach(r => {
    const code = cleanText(r['Project code'] || r['A'])
    if (!code) return
    rows.push({
      project_code: code,
      internal_status: cleanText(r['Internal Status']),
      external_process: cleanText(r['Project External Process']),
      enquiry_via: cleanText(r['Enquiry Came through']),
      enquiry_date: parseDate(r['Enquiry Arrival Date']),
      customer_requirement: cleanText(r['Customer Requirement\nYasir/Hasan/Arsalan']),
      customer_details: cleanText(r['CUSTOMER DETAILS']),
      comments: cleanText(r['Comments\nANY ONE']),
      source_sheet: 'Sheet1'
    })
  })

  return rows
}

function supabaseInsert(rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows)
    const url = new URL(`${SUPABASE_URL}/rest/v1/historical_projects`)
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function run() {
  console.log('Reading Excel file...')
  const wb = XLSX.readFile(FILE_PATH)
  const rows = extractRows(wb)
  console.log(`Total rows extracted: ${rows.length}`)

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    await supabaseInsert(batch)
    inserted += batch.length
    console.log(`Inserted ${inserted} / ${rows.length}`)
  }

  console.log('DONE. All rows imported.')
}

run().catch(err => {
  console.error('FAILED:', err.message)
  process.exit(1)
})
