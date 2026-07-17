import { useState } from 'react';
import api from '../../services/api';
import type { OverdueAssignmentDto } from '../../types';

export default function OverdueAssignmentsTab() {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<OverdueAssignmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<OverdueAssignmentDto[]>(`/reports/overdue-assignments?daysThreshold=${days || 30}`);
      setData(res.data ?? []);
      setLoaded(true);
    } finally { setLoading(false); }
  };

  const getDayColor = (d: number) => {
    if (d > 180) return 'var(--danger)';
    if (d > 90) return '#f97316';
    return 'var(--text-muted)';
  };

  return (
    <div>
      <div className="border rounded p-3 mb-3 d-flex align-items-end gap-3" style={{ background: 'var(--bg-light)' }}>
        <div>
          <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>EŞİK (GÜN)</label>
          <input type="number" className="form-control form-control-sm" style={{ width: 120 }}
            value={days} min="1" max="3650" onChange={e => setDays(e.target.value)} />
          <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>Bu gün ve üzeri zimmetler listelenir</small>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchData} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null} LİSTELE
        </button>
      </div>

      {loaded && (
        <div className="mb-2">
          <span style={{ fontSize: 12, fontWeight: 700, color: data.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {data.length > 0 ? `⚠ ${data.length} zimmet ${days}+ gündür iade edilmedi` : `✓ ${days}+ günlük bekleyen zimmet yok`}
          </span>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>GÜN</th><th>ZİMMET TARİHİ</th><th>PERSONEL</th>
              <th>FİRMA</th><th>DEPARTMAN</th><th>DEMİRBAŞ</th><th>BARKOD</th><th>NOTLAR</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ fontSize: 12 }}>
                <td>
                  <span style={{ fontWeight: 800, fontSize: 13, color: getDayColor(row.daysHeld) }}>
                    {row.daysHeld}
                  </span>
                </td>
                <td>{new Date(row.assignedAt).toLocaleDateString('tr-TR')}</td>
                <td style={{ fontWeight: 600 }}>{row.personnelFullName.toUpperCase()}</td>
                <td>{row.companyName.toUpperCase()}</td>
                <td>{row.departmentName.toUpperCase()}</td>
                <td>{row.assetName.toUpperCase()}</td>
                <td><code style={{ fontWeight: 700, fontSize: 11 }}>{row.assetBarcode}</code></td>
                <td style={{ color: 'var(--text-muted)' }}>{row.notes ?? '-'}</td>
              </tr>
            ))}
            {loaded && data.length === 0 && (
              <tr><td colSpan={8} className="text-center py-4" style={{ fontSize: 12, color: 'var(--success)' }}>
                BEKLEYEN İADE BULUNMUYOR ✓
              </td></tr>
            )}
            {!loaded && (
              <tr><td colSpan={8} className="text-center text-muted py-4" style={{ fontSize: 12 }}>LİSTELE BUTONUNA BASIN</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
