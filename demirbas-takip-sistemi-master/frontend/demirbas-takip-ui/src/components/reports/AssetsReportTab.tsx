import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { AssetReportDto, PagedResult, Category, Company } from '../../types';

interface Filter {
  startDate: string; endDate: string; categoryId: string;
  status: string; companyId: string; searchText: string;
  page: number; pageSize: number;
}

const emptyFilter: Filter = {
  startDate: '', endDate: '', categoryId: '', status: '',
  companyId: '', searchText: '', page: 1, pageSize: 50
};

export default function AssetsReportTab() {
  const [filter, setFilter] = useState<Filter>(emptyFilter);
  const [data, setData] = useState<AssetReportDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(r => setCategories(r.data ?? [])).catch(() => {});
    api.get<Company[]>('/companies').then(r => setCompanies(r.data ?? [])).catch(() => {});
  }, []);

  const buildPayload = (f: Filter) => ({
    startDate: f.startDate || null,
    endDate: f.endDate || null,
    categoryId: f.categoryId ? parseInt(f.categoryId) : null,
    status: f.status !== '' ? parseInt(f.status) : null,
    companyId: f.companyId ? parseInt(f.companyId) : null,
    searchText: f.searchText || null,
    page: f.page, pageSize: f.pageSize
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const f = { ...filter, page };
      const res = await api.post<PagedResult<AssetReportDto>>('/reports/assets', buildPayload(f));
      setData(res.data.items);
      setTotal(res.data.totalCount);
      setFilter(prev => ({ ...prev, page }));
    } finally { setLoading(false); }
  };

  const handleExport = async () => {
    const res = await api.post('/reports/assets/export', buildPayload(filter), { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `DemirbasRaporu_${Date.now()}.xlsx`; a.click();
    window.URL.revokeObjectURL(url);
  };

  const f = filter;
  const set = (k: keyof Filter, v: string) => setFilter(prev => ({ ...prev, [k]: v }));
  const totalPages = Math.ceil(total / f.pageSize);

  return (
    <div>
      <div className="border rounded p-3 mb-3" style={{ background: 'var(--bg-light)' }}>
        <div className="row g-2">
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>BAŞLANGIÇ TARİHİ</label>
            <input type="date" className="form-control form-control-sm" value={f.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>BİTİŞ TARİHİ</label>
            <input type="date" className="form-control form-control-sm" value={f.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>KATEGORİ</label>
            <select className="form-select form-select-sm" value={f.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">TÜMÜ</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>DURUM</label>
            <select className="form-select form-select-sm" value={f.status} onChange={e => set('status', e.target.value)}>
              <option value="">TÜMÜ</option>
              <option value="0">KAYITLI</option>
              <option value="1">ZİMMETLİ</option>
              <option value="2">PASİF</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>FİRMA</label>
            <select className="form-select form-select-sm" value={f.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">TÜMÜ</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>ARAMA</label>
            <input className="form-control form-control-sm" value={f.searchText} placeholder="İSİM / BARKOD / SERİ"
              onChange={e => set('searchText', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData(1)} />
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => fetchData(1)} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null} FİLTRELE
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilter(emptyFilter); setData([]); setTotal(0); }}>TEMİZLE</button>
            <button className="btn btn-success btn-sm" onClick={handleExport} disabled={data.length === 0}>📥 EXCEL İNDİR</button>
          </div>
        </div>
      </div>

      <div className="mb-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        TOPLAM: <strong>{total}</strong> KAYIT
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>BARKOD</th><th>ADI</th><th>SERİ NO</th><th>KATEGORİ</th>
              <th>DURUM</th><th>EKLENME TARİHİ</th><th>EKLEYEN</th><th>ŞU AN KİMDE</th><th>FİRMASI</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ fontSize: 12 }}>
                <td><code style={{ fontWeight: 700 }}>{row.barcode}</code></td>
                <td style={{ fontWeight: 500 }}>{row.name.toUpperCase()}</td>
                <td style={{ color: 'var(--text-muted)' }}>{row.serialNumber ?? '-'}</td>
                <td>{row.categoryName.toUpperCase()}</td>
                <td>
                  <span className={`badge ${row.status === 'Kayitli' ? 'badge-kayitli' : row.status === 'Zimmetli' ? 'badge-zimmetli' : 'badge-pasif'}`} style={{ fontSize: 10 }}>
                    {row.status === 'Kayitli' ? 'KAYITLI' : row.status === 'Zimmetli' ? 'ZİMMETLİ' : 'PASİF'}
                  </span>
                </td>
                <td>{new Date(row.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>{row.createdByUserName}</td>
                <td style={{ fontWeight: row.currentHolder !== '-' ? 600 : 400 }}>{row.currentHolder.toUpperCase()}</td>
                <td>{row.currentHolderCompany.toUpperCase()}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted py-4" style={{ fontSize: 12 }}>
                FİLTRELEYİP ARA BUTONUNA BASIN
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationBar page={f.page} totalPages={totalPages} onPageChange={fetchData} />}
    </div>
  );
}

export function PaginationBar({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="d-flex justify-content-center gap-1 mt-3">
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(1)} disabled={page === 1}>«</button>
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
      <span className="btn btn-sm disabled" style={{ fontSize: 12 }}>{page} / {totalPages}</span>
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>›</button>
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>»</button>
    </div>
  );
}
