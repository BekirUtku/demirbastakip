import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Personnel, AssignmentReportDto } from '../../types';

interface HistoryResponse {
  personnel: {
    id: number; fullName: string; company: string; department: string;
    title?: string; email?: string; phone?: string; isActive: boolean;
  };
  history: AssignmentReportDto[];
}

export default function PersonnelHistoryTab() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Personnel[]>('/personnel').then(r => setPersonnelList(r.data ?? [])).catch(() => {});
  }, []);

  const fetchHistory = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await api.get<HistoryResponse>(`/reports/personnel/${selectedId}/history`);
      setResult(res.data);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="border rounded p-3 mb-3 d-flex align-items-end gap-3" style={{ background: 'var(--bg-light)' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>PERSONEL SEÇ</label>
          <select className="form-select form-select-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">PERSONEL SEÇİN</option>
            {personnelList.map(p => (
              <option key={p.id} value={p.id}>
                {`${p.firstName} ${p.lastName}`.toUpperCase()} — {p.companyName.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchHistory} disabled={!selectedId || loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null} GEÇMİŞİ GÖSTER
        </button>
      </div>

      {result && (
        <>
          <div className="border rounded p-3 mb-3" style={{ background: 'var(--bg-light)' }}>
            <div className="row g-2">
              <div className="col-md-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>AD SOYAD</div>
                <div style={{ fontWeight: 700 }}>{result.personnel.fullName.toUpperCase()}</div>
              </div>
              <div className="col-md-3">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>FİRMA / DEPARTMAN</div>
                <div>{result.personnel.company.toUpperCase()} / {result.personnel.department.toUpperCase()}</div>
              </div>
              <div className="col-md-2">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>ÜNVAN</div>
                <div>{result.personnel.title?.toUpperCase() ?? '-'}</div>
              </div>
              <div className="col-md-2">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>DURUM</div>
                <span className={`badge ${result.personnel.isActive ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 11 }}>
                  {result.personnel.isActive ? 'AKTİF' : 'PASİF'}
                </span>
              </div>
              <div className="col-md-2">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>TOPLAM ZİMMET</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{result.history.length}</div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead>
                <tr style={{ fontSize: 11, fontWeight: 700 }}>
                  <th>DURUM</th><th>ZİMMET TARİHİ</th><th>İADE TARİHİ</th>
                  <th>DEMİRBAŞ</th><th>BARKOD</th><th>KATEGORİ</th><th>NOTLAR</th>
                </tr>
              </thead>
              <tbody>
                {result.history.map(h => (
                  <tr key={h.id} style={{ fontSize: 12 }}>
                    <td>
                      <span className={`badge ${h.status === 'Aktif' ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>
                        {h.status === 'Aktif' ? 'AKTİF' : 'İADE'}
                      </span>
                    </td>
                    <td>{new Date(h.assignedAt).toLocaleDateString('tr-TR')}</td>
                    <td>{h.returnedAt ? new Date(h.returnedAt).toLocaleDateString('tr-TR') : '-'}</td>
                    <td style={{ fontWeight: 500 }}>{h.assetName.toUpperCase()}</td>
                    <td><code style={{ fontWeight: 700, fontSize: 11 }}>{h.assetBarcode}</code></td>
                    <td>{h.categoryName.toUpperCase()}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{h.notes ?? '-'}</td>
                  </tr>
                ))}
                {result.history.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4" style={{ fontSize: 12 }}>ZİMMET GEÇMİŞİ BULUNMUYOR</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
