import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { AssignmentReportDto, PagedResult, Company, Department, Personnel } from '../../types';
import { AssignmentStatus } from '../../types';
import { PaginationBar } from './AssetsReportTab';

interface Filter {
  startDate: string; endDate: string; personnelId: string;
  companyId: string; departmentId: string; status: string;
  page: number; pageSize: number;
}

const emptyFilter: Filter = {
  startDate: '', endDate: '', personnelId: '', companyId: '',
  departmentId: '', status: '', page: 1, pageSize: 50
};

export default function AssignmentsReportTab() {
  const [filter, setFilter] = useState<Filter>(emptyFilter);
  const [data, setData] = useState<AssignmentReportDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Company[]>('/companies').then(r => setCompanies(r.data ?? [])).catch(() => {}),
      api.get<Department[]>('/personnel/departments').then(r => setDepartments(r.data ?? [])).catch(() => {}),
      api.get<Personnel[]>('/personnel').then(r => setPersonnel(r.data ?? [])).catch(() => {}),
    ]);
  }, []);

  const buildPayload = (f: Filter) => ({
    startDate: f.startDate || null, endDate: f.endDate || null,
    personnelId: f.personnelId ? parseInt(f.personnelId) : null,
    companyId: f.companyId ? parseInt(f.companyId) : null,
    departmentId: f.departmentId ? parseInt(f.departmentId) : null,
    status: f.status !== '' ? parseInt(f.status) : null,
    page: f.page, pageSize: f.pageSize
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const f = { ...filter, page };
      const res = await api.post<PagedResult<AssignmentReportDto>>('/reports/assignments', buildPayload(f));
      setData(res.data.items);
      setTotal(res.data.totalCount);
      setFilter(prev => ({ ...prev, page }));
    } finally { setLoading(false); }
  };

  const handleExport = async () => {
    const res = await api.post('/reports/assignments/export', buildPayload(filter), { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `ZimmetRaporu_${Date.now()}.xlsx`; a.click();
    window.URL.revokeObjectURL(url);
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
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>FİRMA</label>
            <select className="form-select form-select-sm" value={filter.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">TÜMÜ</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>DEPARTMAN</label>
            <select className="form-select form-select-sm" value={filter.departmentId} onChange={e => set('departmentId', e.target.value)}>
              <option value="">TÜMÜ</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>PERSONEL</label>
            <select className="form-select form-select-sm" value={filter.personnelId} onChange={e => set('personnelId', e.target.value)}>
              <option value="">TÜMÜ</option>
              {personnel.map(p => <option key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>DURUM</label>
            <select className="form-select form-select-sm" value={filter.status} onChange={e => set('status', e.target.value)}>
              <option value="">TÜMÜ</option>
              <option value={AssignmentStatus.Aktif}>AKTİF</option>
              <option value={AssignmentStatus.IadeEdildi}>İADE EDİLDİ</option>
            </select>
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

      <div className="mb-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOPLAM: <strong>{total}</strong> KAYIT</div>

      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <thead>
            <tr style={{ fontSize: 11, fontWeight: 700 }}>
              <th>DURUM</th><th>ZİMMET TARİHİ</th><th>İADE TARİHİ</th><th>PERSONEL</th>
              <th>FİRMA</th><th>DEPARTMAN</th><th>DEMİRBAŞ</th><th>BARKOD</th>
              <th>KATEGORİ</th><th>ZİMMET VEREN</th><th>İADE ALAN</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ fontSize: 12 }}>
                <td>
                  <span className={`badge ${row.status === 'Aktif' ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>
                    {row.status === 'Aktif' ? 'AKTİF' : 'İADE'}
                  </span>
                </td>
                <td>{new Date(row.assignedAt).toLocaleDateString('tr-TR')}</td>
                <td>{row.returnedAt ? new Date(row.returnedAt).toLocaleDateString('tr-TR') : '-'}</td>
                <td style={{ fontWeight: 600 }}>{row.personnelFullName.toUpperCase()}</td>
                <td>{row.companyName.toUpperCase()}</td>
                <td>{row.departmentName.toUpperCase()}</td>
                <td>{row.assetName.toUpperCase()}</td>
                <td><code style={{ fontWeight: 700, fontSize: 11 }}>{row.assetBarcode}</code></td>
                <td>{row.categoryName.toUpperCase()}</td>
                <td>{row.createdByUserName ?? '-'}</td>
                <td>{row.returnedByUserName ?? '-'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={11} className="text-center text-muted py-4" style={{ fontSize: 12 }}>FİLTRELEYİP ARA BUTONUNA BASIN</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationBar page={filter.page} totalPages={totalPages} onPageChange={fetchData} />}
    </div>
  );
}
