'use client';

// FILE: app/dashboard/campaign-sender/page.tsx
// PURPOSE: Simple Campaign Sender — upload supplier email list + project code → send bulk enquiry

import { useState, useRef } from 'react';

interface PreviewData {
  project_code: string;
  manufacturer: string;
  product: string;
  part_no: string;
  quantity: string;
  subject: string;
  body_preview: string;
  recipient_count: number;
  first_5: { name: string; email: string }[];
}

interface SendResult {
  project_code: string;
  subject: string;
  total: number;
  sent: number;
  failed: number;
  errors: string[];
}

type Stage = 'input' | 'preview' | 'sending' | 'done';

export default function CampaignSenderPage() {
  const [stage, setStage]           = useState<Stage>('input');
  const [projectCode, setProjectCode] = useState('');
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<PreviewData | null>(null);
  const [result, setResult]         = useState<SendResult | null>(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  // ── STEP 1: Preview ────────────────────────────────────────────────────────
  async function handlePreview() {
    setError('');
    if (!projectCode.trim()) { setError('Enter a project code.'); return; }
    if (!file)               { setError('Upload a supplier email list.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('project_code', projectCode.trim().toUpperCase());
      fd.append('preview', 'true');

      const res  = await fetch('/api/campaign-sender', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Preview failed.'); return; }

      setPreview(data);
      setStage('preview');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 2: Send ──────────────────────────────────────────────────────────
  async function handleSend() {
    setError('');
    setStage('sending');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file!);
      fd.append('project_code', projectCode.trim().toUpperCase());
      fd.append('preview', 'false');

      const res  = await fetch('/api/campaign-sender', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Send failed.'); setStage('preview'); return; }

      setResult(data);
      setStage('done');
    } catch (e: any) {
      setError(e.message);
      setStage('preview');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStage('input');
    setProjectCode('');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-6 w-1.5 rounded bg-orange-400" />
          <h1 className="text-xl font-bold tracking-tight">Campaign Sender</h1>
        </div>
        <p className="text-gray-400 text-sm ml-4.5">
          Upload supplier email list + project code → sends bulk enquiry from info@ipexgmbh.com
        </p>
      </div>

      {/* ── STAGE: INPUT ── */}
      {stage === 'input' && (
        <div className="space-y-6">

          {/* Project Code */}
          <div className="bg-gray-900 rounded-xl border border-blue-500/30 p-5">
            <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              Project Code
            </label>
            <input
              type="text"
              value={projectCode}
              onChange={e => setProjectCode(e.target.value.toUpperCase())}
              placeholder="e.g. SBO-DT-PT-R1"
              className="w-full bg-white text-black px-4 py-2.5 rounded-lg font-mono text-sm
                         border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* File Upload */}
          <div className="bg-gray-900 rounded-xl border border-orange-400/30 p-5">
            <label className="block text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
              Supplier Email List (Excel)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Single column (emails only) or two columns (Name, Email) — both formats accepted.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-semibold file:bg-orange-400 file:text-black
                hover:file:bg-orange-300 cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-xs text-green-400">✓ {file.name}</p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-lg">{error}</p>
          )}

          <button
            onClick={handlePreview}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading project...' : 'Preview Campaign →'}
          </button>
        </div>
      )}

      {/* ── STAGE: PREVIEW ── */}
      {stage === 'preview' && preview && (
        <div className="space-y-5">

          {/* Project summary */}
          <div className="bg-gray-900 rounded-xl border border-blue-500/30 p-5 space-y-3">
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Project</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Code</span><p className="font-mono text-white">{preview.project_code}</p></div>
              <div><span className="text-gray-500">Manufacturer</span><p className="text-white">{preview.manufacturer || '—'}</p></div>
              <div className="col-span-2"><span className="text-gray-500">Product</span><p className="text-white">{preview.product || '—'}</p></div>
              <div><span className="text-gray-500">Part No</span><p className="text-white">{preview.part_no || '—'}</p></div>
              <div><span className="text-gray-500">Qty</span><p className="text-white">{preview.quantity || '—'}</p></div>
            </div>
          </div>

          {/* Subject line */}
          <div className="bg-gray-900 rounded-xl border border-orange-400/30 p-5">
            <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Subject Line</h2>
            <p className="text-sm font-mono text-white break-all">{preview.subject}</p>
          </div>

          {/* Email body preview */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Body Preview</h2>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
              {preview.body_preview}
            </pre>
          </div>

          {/* Recipients */}
          <div className="bg-gray-900 rounded-xl border border-green-500/30 p-5">
            <h2 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
              Recipients — {preview.recipient_count.toLocaleString()} suppliers
            </h2>
            <div className="space-y-1">
              {preview.first_5.map((r, i) => (
                <p key={i} className="text-xs text-gray-400 font-mono">
                  {r.name ? `${r.name} <${r.email}>` : r.email}
                </p>
              ))}
              {preview.recipient_count > 5 && (
                <p className="text-xs text-gray-600 mt-1">
                  + {(preview.recipient_count - 5).toLocaleString()} more...
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400
                         hover:border-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSend}
              className="flex-2 flex-grow py-3 rounded-xl bg-green-500 hover:bg-green-400
                         text-white font-bold transition-colors"
            >
              Send to {preview.recipient_count.toLocaleString()} Suppliers →
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE: SENDING ── */}
      {stage === 'sending' && (
        <div className="text-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full
                          animate-spin mx-auto" />
          <p className="text-white font-semibold">Sending emails...</p>
          <p className="text-gray-400 text-sm">Do not close this window.</p>
        </div>
      )}

      {/* ── STAGE: DONE ── */}
      {stage === 'done' && result && (
        <div className="space-y-5">
          <div className="bg-gray-900 rounded-xl border border-green-500/40 p-6 text-center space-y-2">
            <p className="text-4xl font-bold text-green-400">{result.sent.toLocaleString()}</p>
            <p className="text-gray-400">emails sent successfully</p>
            {result.failed > 0 && (
              <p className="text-red-400 text-sm mt-1">{result.failed} failed</p>
            )}
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-5 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Summary</p>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div><p className="text-white font-bold">{result.total}</p><p className="text-gray-500 text-xs">Total</p></div>
              <div><p className="text-green-400 font-bold">{result.sent}</p><p className="text-gray-500 text-xs">Sent</p></div>
              <div><p className={result.failed > 0 ? 'text-red-400 font-bold' : 'text-gray-500 font-bold'}>{result.failed}</p><p className="text-gray-500 text-xs">Failed</p></div>
            </div>
            <p className="text-xs text-gray-600 pt-1">All results logged to Supabase → campaign_sends table.</p>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-red-500/20 p-4">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Failed Addresses</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-gray-500 font-mono">{e}</p>
              ))}
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400
                       text-white font-semibold transition-colors"
          >
            Send Another Campaign
          </button>
        </div>
      )}
    </div>
  );
}
