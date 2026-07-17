import { useState } from 'react';
import api from '../../services/api';
import type { MailLog, PagedResult } from '../../types';
import { MailType } from '../../types';
import { PaginationBar } from './AssetsReportTab';

interface Filter {
  startDate: string; endDate: string; mailType: string;
  isSuccess: string; recipientSearch: string;
  page: number; pageSize: number;
}

const emptyFilter: Filter = {
  startDate: '', endDate: '', mailType: '', isSuccess: '',
  recipientSearch: '', page: 1, pageSize: 50
};

export default function MailLogsTab() {
  const [filter, setFilter] = useState<Filter>(emptyFilter);
  const [data, setData] = useState<MailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const buildPayload = (f: Filter) => ({
    startDate: f.startDate || null, endDate: f.endDate || null,
    mailType: f.mailType !== '' ? parseInt(f.mailType) : null,
    isSuccess: f.isSuccess !== '' ? f.isSuccess === 'true' : null,
    recipientSearch: f.recipientSearch || null,
    page: f.page, pageSize: f.pageSize
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const f = { ...filter, page };
      const res = await api.post<PagedResult<MailLog>>('/reports/mail-logs', buildPayload(f));
      setData(res.data.items);
      setTotal(res.data.totalCount);
      setFilter(prev => ({ ...prev, page }));
    } finally { setLoading(false); }
  };

  const set = (k: keyof Filter, v: string) => setFilter(prev => ({ ...prev, [k]: v }));
  const totalPages = Math.ceil(total / filter.pageSize);

  const mailTypeLabel = (t: MailType) => {
    if (t === MailType.Birthday) return 'DOĞUM GÜNÜ';
    if (t === MailType.Test) return 'TEST';
    return 'ÖZEL';
  };

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
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>MAİL TİPİ</label>
            <select className="form-select form-select-sm" value={filter.mailType} onChange={e => set('mailType', e.target.value)}>
              <option value="">TÜMÜ</option>
              <option value={MailType.Birthday}>DOĞUM GÜNÜ</option>
              <option value={MailType.Test}>TEST</option>
              <option value={MailType.Custom}>ÖZEL</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>DURUM</label>
            <select className="form-select form-select-sm" value={filter.isSuccess} onChange={e => set('isSuccess', e.target.value)}>
              <option value="">TÜMÜ</option>
              <option value="true">BAŞARILI</option>
              <option value="false">BAŞARISIZ</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>ALICI ARAMA</label>
            <input className="form-control form-control-sm" placeholder="E-POSTA ADRESİ"
              value={filter.recipientSearch} onChange={e => set('recipientSearch', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData(1)} />
          </div>
          <div className="col-md-1 d-flex align-items-end">
            <button className="btn btn-primary btn-sm w-100" onClick={() => fetchData(1)} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'ARA'}
            </button>
          </div>
          <div className="col-12">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilter(emptyFilter); setData([]); setTotal(0); }}>TEMİZLE</button>
          </div>
        </div>
      </div>

      <div className="mb-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOPLAM: <strong>{total}</strong> KAYIT</div>

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>DURUM</th><th>GÖNDERİM TARİHİ</th><th>ALICI</th><th>KONU</th><th>TİP</th><th>HATA</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ fontSize: 12 }}>
                <td>
                  <span className={`badge ${row.isSuccess ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: 10 }}>
                    {row.isSuccess ? '✓ BAŞARILI' : '✗ HATA'}
                  </span>
                </td>
                <td>{new Date(row.sentAt).toLocaleString('tr-TR')}</td>
                <td>{row.recipientEmail}</td>
                <td>{row.subject}</td>
                <td><span className="badge bg-secondary" style={{ fontSize: 10 }}>{mailTypeLabel(row.mailType)}</span></td>
                <td style={{ color: 'var(--danger)', fontSize: 11 }}>{row.errorMessage ?? '-'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4" style={{ fontSize: 12 }}>FİLTRELEYİP ARA BUTONUNA BASIN</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationBar page={filter.page} totalPages={totalPages} onPageChange={fetchData} />}
    </div>
  );
}
