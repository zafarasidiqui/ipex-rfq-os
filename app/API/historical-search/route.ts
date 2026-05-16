// FILE: app/api/historical-search/route.ts
// PURPOSE: Search historical_projects table by keyword
// ADD THIS FILE to: H:\IPEX SUPABASE PROJECT\ipex-rfq-os\app\api\historical-search\route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Search across project_code, customer_requirement, customer_details, comments
  const { data, error } = await supabase
    .from('historical_projects')
    .select('id, project_code, internal_status, customer_requirement, customer_details, enquiry_date, source_sheet')
    .or(
      `project_code.ilike.%${query}%,` +
      `customer_requirement.ilike.%${query}%,` +
      `customer_details.ilike.%${query}%,` +
      `comments.ilike.%${query}%`
    )
    .order('id', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data || [] });
}
