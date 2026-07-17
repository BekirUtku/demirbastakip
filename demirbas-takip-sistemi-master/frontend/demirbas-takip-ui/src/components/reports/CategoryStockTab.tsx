import { useState } from 'react';
import api from '../../services/api';
import type { CategoryStockDto } from '../../types';

export default function CategoryStockTab() {
  const [data, setData] = useState<CategoryStockDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<CategoryStockDto[]>('/reports/category-stock');
      setData(res.data ?? []);
      setLoaded(true);
    } finally { setLoading(false); }
  };

  const total = data.reduce((a, b) => a + b.totalCount, 0);
  const assigned = data.reduce((a, b) => a + b.assignedCount, 0);
  const registered = data.reduce((a, b) => a + b.registeredCount, 0);
  const passive = data.reduce((a, b) => a + b.passiveCount, 0);

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary btn-sm" onClick={fetchData} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
          {loaded ? 'YENİLE' : 'STOK RAPORU YÜKLE'}
        </button>
      </div>

      {loaded && data.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: 'TOPLAM DEMİRBAŞ', val: total, color: 'var(--primary)' },
            { label: 'KAYITLI', val: registered, color: 'var(--success)' },
            { label: 'ZİMMETLİ', val: assigned, color: 'var(--danger)' },
            { label: 'PASİF', val: passive, color: 'var(--text-muted)' },
          ].map(s => (
            <div className="col-md-3" key={s.label}>
              <div className="stat-card text-center">
                <div style={{ fontWeight: 800, fontSize: 28, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>KATEGORİ</th>
              <th className="text-center">TOPLAM</th>
              <th className="text-center">KAYITLI</th>
              <th className="text-center">ZİMMETLİ</th>
              <th className="text-center">PASİF</th>
              <th>DAĞILIM</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.categoryId} style={{ fontSize: 12 }}>
                <td style={{ fontWeight: 600 }}>{row.categoryName.toUpperCase()}</td>
                <td className="text-center" style={{ fontWeight: 700 }}>{row.totalCount}</td>
                <td className="text-center">
                  <span className="badge badge-kayitli" style={{ fontSize: 10 }}>{row.registeredCount}</span>
                </td>
                <td className="text-center">
                  <span className="badge badge-zimmetli" style={{ fontSize: 10 }}>{row.assignedCount}</span>
                </td>
                <td className="text-center">
                  <span className="badge badge-pasif" style={{ fontSize: 10 }}>{row.passiveCount}</span>
                </td>
                <td style={{ minWidth: 120 }}>
                  {row.totalCount > 0 && (
                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                      {row.registeredCount > 0 && <div style={{ flex: row.registeredCount, background: 'var(--success)', opacity: 0.7 }} />}
                      {row.assignedCount > 0 && <div style={{ flex: row.assignedCount, background: 'var(--danger)', opacity: 0.7 }} />}
                      {row.passiveCount > 0 && <div style={{ flex: row.passiveCount, background: 'var(--text-muted)', opacity: 0.4 }} />}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {loaded && data.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4" style={{ fontSize: 12 }}>KATEGORİ BULUNMUYOR</td></tr>
            )}
            {!loaded && (
              <tr><td colSpan={6} className="text-center text-muted py-4" style={{ fontSize: 12 }}>YÜKLE BUTONUNA BASIN</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
