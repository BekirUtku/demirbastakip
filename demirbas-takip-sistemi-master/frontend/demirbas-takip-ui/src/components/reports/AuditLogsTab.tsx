import { useState } from 'react';
import api from '../../services/api';
import type { AuditLogDto, PagedResult } from '../../types';
import { PaginationBar } from './AssetsReportTab';

interface Filter {
  startDate: string; endDate: string; entityType: string;
  userName: string; page: number; pageSize: number;
}

const emptyFilter: Filter = {
  startDate: '', endDate: '', entityType: '', userName: '', page: 1, pageSize: 50
};

const entityTypeLabel: Record<string, string> = {
  Asset: 'DEMİRBAŞ', Assignment: 'ZİMMET', Personnel: 'PERSONEL'
};

const actionColor: Record<string, string> = {
  'Oluşturma': 'var(--success)', 'Güncelleme': 'var(--info)',
  'Zimmet Oluşturma': 'var(--primary)', 'Zimmet İadesi': '#8b5cf6',
  'Personel Ekleme': '#f97316'
};

export default function AuditLogsTab() {
  const [filter, setFilter] = useState<Filter>(emptyFilter);
  const [data, setData] = useState<AuditLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const buildPayload = (f: Filter) => ({
    startDate: f.startDate || null, endDate: f.endDate || null,
    entityType: f.entityType || null, userName: f.userName || null,
    page: f.page, pageSize: f.pageSize
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const f = { ...filter, page };
      const res = await api.post<PagedResult<AuditLogDto>>('/reports/audit-logs', buildPayload(f));
      setData(res.data.items);
      setTotal(res.data.totalCount);
      setFilter(prev => ({ ...prev, page }));
    } finally { setLoading(false); }
  };

  const set = (k: keyof Filter, v: string) => setFilter(prev => ({ ...prev, [k]: v }));
  const totalPages = Math.ceil(total / filter.pageSize);

  return (
    <div>
      <div className="border rounded p-3 mb-3" style={{ background: 'var(--bg-light)' }}>
        <div className="row g-2">
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>BAŞLANGIÇ</label>
            <input type="date" className="form-control form-control-sm" value={filter.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>BİTİŞ</label>
            <input type="date" className="form-control form-control-sm" value={filter.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>ENTITY TİPİ</label>
            <select className="form-select form-select-sm" value={filter.entityType} onChange={e => set('entityType', e.target.value)}>
              <option value="">TÜMÜ</option>
              <option value="Asset">DEMİRBAŞ</option>
              <option value="Assignment">ZİMMET</option>
              <option value="Personnel">PERSONEL</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>KULLANICI</label>
            <input className="form-control form-control-sm" placeholder="KULLANICI ADI"
              value={filter.userName} onChange={e => set('userName', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData(1)} />
          </div>
          <div className="col-md-2 d-flex align-items-end gap-1">
            <button className="btn btn-primary btn-sm flex-fill" onClick={() => fetchData(1)} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'ARA'}
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilter(emptyFilter); setData([]); setTotal(0); }}>
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="mb-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOPLAM: <strong>{total}</strong> KAYIT</div>

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>TARİH/SAAT</th><th>İŞLEM</th><th>TİP</th><th>KAYIT</th><th>KULLANICI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={{ fontSize: 12 }}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.actionAt).toLocaleString('tr-TR')}</td>
                <td>
                  <span style={{ fontWeight: 700, color: actionColor[row.action] ?? 'var(--text-muted)', fontSize: 11 }}>
                    {row.action.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="badge bg-secondary" style={{ fontSize: 10 }}>
                    {entityTypeLabel[row.entityType] ?? row.entityType}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{row.entityName}</td>
                <td style={{ fontWeight: 600 }}>{row.userName}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted py-4" style={{ fontSize: 12 }}>FİLTRELEYİP ARA BUTONUNA BASIN</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationBar page={filter.page} totalPages={totalPages} onPageChange={fetchData} />}
    </div>
  );
}
