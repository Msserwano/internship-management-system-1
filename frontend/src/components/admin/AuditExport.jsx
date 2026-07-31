import React, { useState } from 'react';
import { auditService } from '../../api/services';

export default function AuditExport() {
  const [format, setFormat] = useState('csv');
  const [stream, setStream] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const params = { format, page, limit };
      if (stream && format === 'csv') params.stream = true;
      const resp = await auditService.export(params, { responseType: 'blob' });
      const blob = new Blob([resp.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format === 'csv' ? 'csv' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed: ' + (err.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">Audit Logs Export</h3>
      <div className="mt-3">
        <label className="block">Format</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1">
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div className="mt-3">
        <label>
          <input type="checkbox" checked={stream} onChange={(e) => setStream(e.target.checked)} /> Stream (recommended for large exports)
        </label>
      </div>
      <div className="mt-3">
        <label className="block">Page</label>
        <input type="number" value={page} onChange={(e) => setPage(Number(e.target.value))} className="mt-1" />
      </div>
      <div className="mt-3">
        <label className="block">Limit</label>
        <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="mt-1" />
      </div>
      <div className="mt-4">
        <button onClick={download} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}
