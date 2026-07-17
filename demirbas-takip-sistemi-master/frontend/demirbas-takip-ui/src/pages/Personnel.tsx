import { Fragment, useMemo, useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import ColumnManager from '../components/common/ColumnManager';
import { useColumnPreferences } from '../hooks/useColumnPreferences';
import api from '../services/api';
import type { Personnel, Department, Company } from '../types';
import type { ColumnDefinition } from '../types/columns';

const PERSONNEL_COLS: ColumnDefinition[] = [
  { key: 'fullName',          label: 'AD SOYAD',         defaultVisible: true,  defaultWidth: 180, defaultOrder: 0,   filterable: true, filterType: 'text',   minWidth: 80 },
  { key: 'title',             label: 'ÜNVAN',            defaultVisible: true,  defaultWidth: 130, defaultOrder: 1,   filterable: true, filterType: 'text' },
  { key: 'departmentName',    label: 'DEPARTMAN',        defaultVisible: true,  defaultWidth: 140, defaultOrder: 2,   filterable: true, filterType: 'select', renderType: 'badge' },
  { key: 'companyName',       label: 'FİRMA',            defaultVisible: true,  defaultWidth: 160, defaultOrder: 3,   filterable: true, filterType: 'select', renderType: 'badge' },
  { key: 'email',             label: 'E-POSTA',          defaultVisible: true,  defaultWidth: 200, defaultOrder: 4,   filterable: true, filterType: 'text' },
  { key: 'phone',             label: 'TELEFON',          defaultVisible: false, defaultWidth: 130, defaultOrder: 5,   filterable: true, filterType: 'text' },
  { key: 'birthDate',         label: 'DOĞUM TARİHİ',    defaultVisible: false, defaultWidth: 120, defaultOrder: 6,   renderType: 'date' },
  { key: 'employmentDate',    label: 'İŞE GİRİŞ',       defaultVisible: false, defaultWidth: 120, defaultOrder: 7,   renderType: 'date' },
  { key: 'isActive',          label: 'DURUM',            defaultVisible: true,  defaultWidth: 90,  defaultOrder: 8,   renderType: 'badge' },
  { key: 'createdAt',         label: 'EKLENME TARİHİ',  defaultVisible: false, defaultWidth: 150, defaultOrder: 9,   renderType: 'datetime' },
  { key: 'createdByUserName', label: 'EKLEYEN',          defaultVisible: false, defaultWidth: 140, defaultOrder: 10 },
  { key: 'updatedAt',         label: 'GÜNCELLEME',       defaultVisible: false, defaultWidth: 150, defaultOrder: 11,  renderType: 'datetime' },
  { key: 'updatedByUserName', label: 'GÜNCELLEYEN',      defaultVisible: false, defaultWidth: 140, defaultOrder: 12 },
  { key: 'actions',           label: 'İŞLEM',            defaultVisible: true,  defaultWidth: 140, defaultOrder: 999, sticky: true, renderType: 'actions', minWidth: 100 },
];

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editPerson, setEditPerson] = useState<Personnel | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [dismissalModal, setDismissalModal] = useState({ show: false, id: 0, name: '', date: new Date().toISOString().substring(0, 10) });
  const [dismissalSaving, setDismissalSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const emptyForm = { firstName: '', lastName: '', departmentId: 0, companyId: 0, title: '', birthDate: '', email: '', phone: '', employmentDate: '' };
  const [form, setForm] = useState(emptyForm);

  // Column manager
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const { columnStates, visibleColumns, savePreferences, resetToDefaults } =
    useColumnPreferences('personnel', PERSONNEL_COLS);

  const load = async () => {
    try {
      const [pRes, dRes, cRes] = await Promise.all([
        api.get<Personnel[]>('/personnel'),
        api.get<Department[]>('/personnel/departments'),
        api.get<Company[]>('/personnel/companies'),
      ]);
      setPersonnel(pRes.data ?? []); setDepartments(dRes.data ?? []); setCompanies(cRes.data ?? []);
    } catch { setError('VERİLER YÜKLENEMEDİ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (p: Personnel) => {
    setEditPerson(p);
    setForm({
      firstName: p.firstName, lastName: p.lastName, departmentId: p.departmentId, companyId: p.companyId,
      title: p.title ?? '', birthDate: p.birthDate ? p.birthDate.substring(0, 10) : '',
      email: p.email ?? '', phone: p.phone ?? '',
      employmentDate: p.employmentDate ? p.employmentDate.substring(0, 10) : ''
    });
    setShowAdd(true);
  };

  const openAdd = () => { setEditPerson(null); setForm(emptyForm); setShowAdd(true); };

  const savePerson = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.departmentId || !form.companyId) {
      setError('AD, SOYAD, DEPARTMAN VE FİRMA ZORUNLUDUR.'); return;
    }
    setSaving(true);
    try {
      const body = { ...form, birthDate: form.birthDate || null, employmentDate: form.employmentDate || null };
      if (editPerson) await api.put(`/personnel/${editPerson.id}`, { ...body, isActive: editPerson.isActive });
      else await api.post('/personnel', body);
      setShowAdd(false); await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'PERSONEL KAYDEDİLEMEDİ.');
    } finally { setSaving(false); }
  };

  const confirmDismissal = async () => {
    if (!dismissalModal.date) { setError('İŞTEN AYRILIK TARİHİ ZORUNLUDUR.'); return; }
    setDismissalSaving(true);
    try {
      const p = personnel.find(x => x.id === dismissalModal.id)!;
      await api.put(`/personnel/${p.id}`, {
        firstName: p.firstName, lastName: p.lastName, departmentId: p.departmentId, companyId: p.companyId,
        title: p.title ?? '', birthDate: p.birthDate ?? null, email: p.email ?? '', phone: p.phone ?? '',
        employmentDate: p.employmentDate ?? null, isActive: false, dismissalDate: dismissalModal.date,
      });
      setDismissalModal({ show: false, id: 0, name: '', date: new Date().toISOString().substring(0, 10) });
      await load();
    } catch { setError('İŞTEN AYRILIK KAYDEDİLEMEDİ.'); }
    finally { setDismissalSaving(false); }
  };

  const addDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await api.post('/personnel/departments', { name: newDeptName.trim() });
      setNewDeptName(''); setShowAddDept(false);
      const dRes = await api.get<Department[]>('/personnel/departments');
      setDepartments(dRes.data);
    } catch { setError('DEPARTMAN EKLENEMEDİ.'); }
  };

  // useMemo MUST be before any early return (Rules of Hooks)
  const activeFiltered = useMemo(() =>
    personnel.filter(p =>
      activeFilter === 'all' ? true : activeFilter === 'active' ? p.isActive : !p.isActive
    ),
    [personnel, activeFilter]
  );

  const filteredPersonnel = useMemo(() => {
    return activeFiltered.filter(p => {
      for (const col of visibleColumns) {
        if (!col.filterable) continue;
        const fv = (colFilters[col.key] || '').trim();
        if (!fv) continue;
        if (col.key === 'departmentName') {
          if (!p.departmentName.toLowerCase().includes(fv.toLowerCase())) return false;
        } else if (col.key === 'companyName') {
          if (!p.companyName.toLowerCase().includes(fv.toLowerCase())) return false;
        } else {
          const val = String((p as unknown as Record<string, unknown>)[col.key] ?? '').toLowerCase();
          if (!val.includes(fv.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [activeFiltered, colFilters, visibleColumns]);

  if (loading) return <><Header title="Personeller" /><Loader /></>;

  const activeCount = personnel.filter(p => p.isActive).length;
  const inactiveCount = personnel.filter(p => !p.isActive).length;

  const setFilter = (key: string, val: string) => setColFilters(prev => ({ ...prev, [key]: val }));

  const getCellText = (p: Personnel, col: ColumnDefinition): string => {
    if (col.key === 'isActive') return p.isActive ? 'AKTİF' : 'PASİF';
    if (col.key === 'birthDate' || col.key === 'employmentDate') {
      const v = (p as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return v ? new Date(v).toLocaleDateString('tr-TR') : '-';
    }
    if (col.key === 'createdAt' || col.key === 'updatedAt') {
      const v = (p as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return v ? new Date(v).toLocaleString('tr-TR') : '-';
    }
    return String((p as unknown as Record<string, unknown>)[col.key] ?? '-');
  };

  const renderCell = (p: Personnel, col: ColumnDefinition, isExpanded: boolean) => {
    if (col.key === 'actions') {
      return (
        <div className="d-flex gap-1">
          <button className="action-btn" style={{ background: '#dbeafe', color: 'var(--info)' }}
            title="ZİMMETLERİ GÖR" onClick={() => setExpandedRow(isExpanded ? null : p.id)}>
            {isExpanded ? '🔼' : '👁'}
          </button>
          <button className="action-btn" style={{ background: '#f0fdf4', color: 'var(--success)' }} title="DÜZENLE" onClick={() => openEdit(p)}>✏️</button>
          {p.isActive && (
            <button className="action-btn" style={{ background: '#fee2e2', color: 'var(--danger)' }} title="İŞTEN AYRILIK KAYDET"
              onClick={() => setDismissalModal({ show: true, id: p.id, name: `${p.firstName} ${p.lastName}`, date: new Date().toISOString().substring(0, 10) })}>
              🚪
            </button>
          )}
        </div>
      );
    }
    if (col.key === 'isActive') {
      return <span className={`badge ${p.isActive ? 'badge-kayitli' : 'badge-pasif'}`} style={{ fontSize: 10 }}>{p.isActive ? 'AKTİF' : 'PASİF'}</span>;
    }
    if (col.key === 'departmentName') return <span style={{ fontSize: 12 }}>{p.departmentName.toUpperCase()}</span>;
    if (col.key === 'companyName') return <span style={{ fontSize: 12 }}>{p.companyName.toUpperCase()}</span>;
    if (col.key === 'fullName') return <span style={{ fontWeight: 600 }}>{`${p.firstName} ${p.lastName}`.toUpperCase()}</span>;
    if (col.renderType === 'date') {
      const v = (p as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return <span style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('tr-TR') : '-'}</span>;
    }
    if (col.renderType === 'datetime') {
      const v = (p as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return <span style={{ fontSize: 11 }}>{v ? new Date(v).toLocaleString('tr-TR') : '-'}</span>;
    }
    return <span style={{ fontSize: 12 }}>{getCellText(p, col)}</span>;
  };

  const renderFilter = (col: ColumnDefinition) => {
    if (!col.filterable) return null;
    const base = { fontSize: 11, padding: '2px 6px', height: 28 };
    if (col.key === 'departmentName') {
      return (
        <select className="form-select form-select-sm" style={base}
          value={colFilters[col.key] || ''} onChange={e => setFilter(col.key, e.target.value)}>
          <option value="">TÜMÜ</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>)}
        </select>
      );
    }
    if (col.key === 'companyName') {
      return (
        <select className="form-select form-select-sm" style={base}
          value={colFilters[col.key] || ''} onChange={e => setFilter(col.key, e.target.value)}>
          <option value="">TÜMÜ</option>
          {companies.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
        </select>
      );
    }
    return (
      <input type="text" className="form-control form-control-sm" style={base}
        placeholder="FİLTRE..." value={colFilters[col.key] || ''}
        onChange={e => setFilter(col.key, e.target.value)} autoComplete="off" />
    );
  };

  return (
    <>
      <Header title="Personeller" subtitle="Personel Yönetimi" />
      <div className="main-content">
        {error && (
          <div className="alert alert-danger alert-dismissible py-2" style={{ fontSize: 12 }}>
            {error}<button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="form-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DEPARTMANLAR</h6>
            <button className="btn btn-success btn-sm" onClick={() => setShowAddDept(true)}>+ YENİ DEPARTMAN</button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {departments.map(d => (
              <span key={d.id} className="badge rounded-pill px-3 py-2"
                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 11, fontWeight: 600 }}>
                {d.name.toUpperCase()} <span className="ms-1 opacity-75">({d.personnelCount})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="page-header">
          <div className="d-flex align-items-center gap-3">
            <h5 className="page-title mb-0">PERSONEL LİSTESİ ({filteredPersonnel.length})</h5>
            <div className="btn-group btn-group-sm">
              <button className={`btn ${activeFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setActiveFilter('all')}>TÜMÜ ({personnel.length})</button>
              <button className={`btn ${activeFilter === 'active' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setActiveFilter('active')}>AKTİF ({activeCount})</button>
              <button className={`btn ${activeFilter === 'inactive' ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={() => setActiveFilter('inactive')}>PASİF ({inactiveCount})</button>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowColumnManager(true)}>⚙ SÜTUNLAR</button>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ YENİ PERSONEL</button>
          </div>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col.key} style={{ width: col.width, minWidth: col.minWidth ?? 60 }}>{col.label}</th>
                  ))}
                </tr>
                <tr className="filter-row">
                  {visibleColumns.map(col => (
                    <td key={`f-${col.key}`} style={{ width: col.width }}>{renderFilter(col)}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map(p => {
                  const isExpanded = expandedRow === p.id;
                  return (
                    <Fragment key={p.id}>
                      <tr style={{ background: isExpanded ? '#f0fdf9' : p.isActive ? undefined : '#fff5f5' }}>
                        {visibleColumns.map(col => (
                          <td key={col.key} style={{ width: col.width, maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={col.key !== 'actions' ? getCellText(p, col) : undefined}>
                            {renderCell(p, col, isExpanded)}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={visibleColumns.length} style={{ background: '#f0fdf9', padding: '12px 16px' }}>
                            <div className="d-flex gap-4 mb-3" style={{ fontSize: 12 }}>
                              {p.employmentDate && (
                                <div>
                                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11 }}>İşe Giriş: </span>
                                  <span>{new Date(p.employmentDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                              )}
                              {p.dismissalDate && (
                                <div>
                                  <span style={{ fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', fontSize: 11 }}>İşten Ayrılış: </span>
                                  <span style={{ color: '#ef4444' }}>{new Date(p.dismissalDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ZİMMET GEÇMİŞİ</div>
                            {p.activeAssignments.length === 0 ? (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ZIMMET KAYDI YOK</div>
                            ) : (
                              <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                                <thead>
                                  <tr>
                                    <th>BARKOD</th><th>DEMİRBAŞ</th><th>KATEGORİ</th><th>ZİMMET TARİHİ</th><th>İADE TARİHİ</th><th>DURUM</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.activeAssignments.map(a => (
                                    <tr key={a.assignmentId}>
                                      <td style={{ fontFamily: 'monospace' }}>{a.assetBarcode}</td>
                                      <td>{a.assetName.toUpperCase()}</td>
                                      <td>{a.categoryName.toUpperCase()}</td>
                                      <td>{new Date(a.assignedAt).toLocaleString('tr-TR')}</td>
                                      <td>{a.returnedAt ? new Date(a.returnedAt).toLocaleString('tr-TR') : '-'}</td>
                                      <td><span className={`badge ${a.status === 'Aktif' ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>{a.status.toUpperCase()}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {filteredPersonnel.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length} className="text-center text-muted py-4">
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>KAYIT BULUNAMADI</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-light border-top" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            TOPLAM: <strong>{filteredPersonnel.length}</strong> KAYIT
            {filteredPersonnel.length !== personnel.length && <span className="ms-2">(FİLTRELENDİ: {personnel.length} KAYITTAN)</span>}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{editPerson ? 'PERSONEL DÜZENLE' : 'YENİ PERSONEL'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">ADI *</label>
                <input className="form-control" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">SOYADI *</label>
                <input className="form-control" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">DEPARTMAN *</label>
                <select className="form-select" value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: Number(e.target.value) }))}>
                  <option value={0}>SEÇİN</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">FİRMA *</label>
                <select className="form-select" value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: Number(e.target.value) }))}>
                  <option value={0}>SEÇİN</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">ÜNVAN</label>
                <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">DOĞUM TARİHİ</label>
                <input type="date" className="form-control" value={form.birthDate} onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">E-POSTA</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">TELEFON</label>
                <input type="tel" className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">İŞE GİRİŞ TARİHİ</label>
                <input type="date" className="form-control" value={form.employmentDate} onChange={e => setForm(p => ({ ...p, employmentDate: e.target.value }))} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>İPTAL</Button>
            <Button variant="primary" onClick={savePerson} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}KAYDET
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddDept} onHide={() => setShowAddDept(false)} centered>
          <Modal.Header closeButton><Modal.Title>YENİ DEPARTMAN</Modal.Title></Modal.Header>
          <Modal.Body>
            <label className="form-label">DEPARTMAN ADI *</label>
            <input className="form-control" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} autoComplete="off" placeholder="DEPARTMAN ADI GİRİN" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddDept(false)}>İPTAL</Button>
            <Button variant="success" onClick={addDept} disabled={!newDeptName.trim()}>EKLE</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={dismissalModal.show} onHide={() => setDismissalModal(m => ({ ...m, show: false }))} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: 15, fontWeight: 700 }}>İŞTEN AYRILIK KAYDET</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              <strong>{dismissalModal.name.toUpperCase()}</strong> adlı personel için işten ayrılış tarihi girin.
            </p>
            <label className="form-label">İŞTEN AYRILIK TARİHİ *</label>
            <input type="date" className="form-control" value={dismissalModal.date}
              onChange={e => setDismissalModal(m => ({ ...m, date: e.target.value }))} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDismissalModal(m => ({ ...m, show: false }))}>İPTAL</Button>
            <Button variant="danger" onClick={confirmDismissal} disabled={dismissalSaving || !dismissalModal.date}>
              {dismissalSaving ? <span className="spinner-border spinner-border-sm me-2" /> : null}KAYDET
            </Button>
          </Modal.Footer>
        </Modal>

        <ColumnManager show={showColumnManager} onHide={() => setShowColumnManager(false)}
          definitions={PERSONNEL_COLS} states={columnStates}
          onSave={savePreferences} onReset={resetToDefaults} />
      </div>
    </>
  );
}
