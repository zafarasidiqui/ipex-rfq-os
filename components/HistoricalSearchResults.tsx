// FILE: components/HistoricalSearchResults.tsx
// PURPOSE: Shows historical project search results with Clone button
// ADD THIS FILE to: H:\IPEX SUPABASE PROJECT\ipex-rfq-os\components\HistoricalSearchResults.tsx
// Then import and use it on your /dashboard/projects page

'use client';

import { useEffect, useState } from 'react';

interface HistoricalProject {
  id: number;
  project_code: string | null;
  internal_status: string | null;
  customer_requirement: string | null;
  customer_details: string | null;
  enquiry_date: string | null;
  source_sheet: string | null;
}

interface Props {
  query: string;                          // Pass your search query from the parent page
  onClone: (project: HistoricalProject) => void; // Called when user clicks Clone
}

export default function HistoricalSearchResults({ query, onClone }: Props) {
  const [results, setResults] = useState<HistoricalProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/historical-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

  if (!query || query.length < 2) return null;

  return (
    <div className="mt-6">
      {/* Section header — grey to distinguish from live projects */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-4 w-1 rounded bg-gray-400" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Historical Projects
        </h3>
        {!loading && (
          <span className="text-xs text-gray-500">
            {results.length === 0 ? 'No matches' : `${results.length} found`}
          </span>
        )}
        {loading && (
          <span className="text-xs text-gray-500 animate-pulse">Searching…</span>
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left w-32">Project Code</th>
                <th className="px-4 py-2 text-left">Product / Requirement</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left w-28">Status</th>
                <th className="px-4 py-2 text-left w-24">Date</th>
                <th className="px-4 py-2 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {results.map((p) => (
                <tr key={p.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-300">
                        {p.project_code || '—'}
                      </span>
                      {/* Historical badge */}
                      <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                        HIST
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{p.source_sheet}</div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-200 line-clamp-2 text-xs leading-relaxed">
                      {p.customer_requirement || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {p.customer_details || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">
                      {p.internal_status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {p.enquiry_date ? String(p.enquiry_date).slice(0, 10) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onClone(p)}
                      className="text-xs px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Clone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── HOW TO USE ON YOUR PROJECTS PAGE ───────────────────────────────────────
//
// 1. Import at top of your projects page:
//    import HistoricalSearchResults from '@/components/HistoricalSearchResults';
//
// 2. Make sure you have a searchQuery state variable (you likely already do).
//
// 3. Add the onClone handler — pre-fills the New Project form with historical data:
//
//    function handleHistoricalClone(project) {
//      router.push(`/dashboard/projects/new?` + new URLSearchParams({
//        cloned_from:  project.project_code || '',
//        description:  project.customer_requirement || '',
//        customer:     project.customer_details || '',
//        historical:   'true',
//      }));
//    }
//
// 4. Place the component below your existing live projects table:
//
//    <HistoricalSearchResults
//      query={searchQuery}
//      onClone={handleHistoricalClone}
//    />
//
// ────────────────────────────────────────────────────────────────────────────
