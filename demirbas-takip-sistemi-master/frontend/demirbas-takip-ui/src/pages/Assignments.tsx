import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import ColumnManager from '../components/common/ColumnManager';
import { useColumnPreferences } from '../hooks/useColumnPreferences';
import api from '../services/api';
import type { Assignment, AssignmentPhoto, Personnel, AvailableAsset } from '../types';
import type { ColumnDefinition } from '../types/columns';
import { AssignmentStatus, PhotoType } from '../types';

const ASSIGNMENT_COLS: ColumnDefinition[] = [
  { key: 'status',            label: 'DURUM',             defaultVisible: true,  defaultWidth: 110, defaultOrder: 0,   filterable: true, filterType: 'select', renderType: 'badge',   minWidth: 80 },
  { key: 'personnelFullName', label: 'PERSONEL',          defaultVisible: true,  defaultWidth: 180, defaultOrder: 1,   filterable: true, filterType: 'text',   minWidth: 80 },
  { key: 'companyName',       label: 'FİRMA',             defaultVisible: false, defaultWidth: 160, defaultOrder: 2,   filterable: true, filterType: 'select' },
  { key: 'departmentName',    label: 'DEPARTMAN',         defaultVisible: false, defaultWidth: 140, defaultOrder: 3,   filterable: true, filterType: 'text' },
  { key: 'assetName',         label: 'DEMİRBAŞ',          defaultVisible: true,  defaultWidth: 200, defaultOrder: 4,   filterable: true, filterType: 'text',   minWidth: 80 },
  { key: 'assetBarcode',      label: 'BARKOD',            defaultVisible: true,  defaultWidth: 130, defaultOrder: 5,   filterable: true, filterType: 'text',   renderType: 'barcode', minWidth: 80 },
  { key: 'categoryName',      label: 'KATEGORİ',          defaultVisible: false, defaultWidth: 130, defaultOrder: 6,   filterable: true, filterType: 'text' },
  { key: 'assignedAt',        label: 'ZİMMET TARİHİ',     defaultVisible: true,  defaultWidth: 150, defaultOrder: 7,   renderType: 'datetime' },
  { key: 'returnedAt',        label: 'İADE TARİHİ',       defaultVisible: true,  defaultWidth: 150, defaultOrder: 8,   renderType: 'datetime' },
  { key: 'notes',             label: 'NOTLAR',            defaultVisible: false, defaultWidth: 200, defaultOrder: 9,   filterable: true, filterType: 'text' },
  { key: 'returnNotes',       label: 'İADE NOTLARI',      defaultVisible: false, defaultWidth: 200, defaultOrder: 10,  filterable: true, filterType: 'text' },
  { key: 'createdByUserName', label: 'ZİMMET VEREN',      defaultVisible: false, defaultWidth: 140, defaultOrder: 11 },
  { key: 'returnedByUserName',label: 'İADE ALAN',         defaultVisible: false, defaultWidth: 140, defaultOrder: 12 },
  { key: 'createdAt',         label: 'KAYIT TARİHİ',      defaultVisible: false, defaultWidth: 150, defaultOrder: 13,  renderType: 'datetime' },
  { key: 'updatedAt',         label: 'GÜNCELLEME TARİHİ', defaultVisible: false, defaultWidth: 150, defaultOrder: 14,  renderType: 'datetime' },
  { key: 'updatedByUserName', label: 'GÜNCELLEYEN',       defaultVisible: false, defaultWidth: 140, defaultOrder: 15 },
  { key: 'actions',           label: 'İŞLEM',             defaultVisible: true,  defaultWidth: 130, defaultOrder: 999, sticky: true, renderType: 'actions', minWidth: 100 },
];

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ personnelId: 0, assetId: 0, notes: '' });
  const [saving, setSaving] = useState(false);

  const [returnModal, setReturnModal] = useState({ show: false, id: 0, personnelName: '', assetName: '' });
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);

  const [photoModal, setPhotoModal] = useState({ show: false, assignmentId: 0, personnelName: '', assetName: '' });
  const [assignmentPhotos, setAssignmentPhotos] = useState<AssignmentPhoto[]>([]);
  const [photoType, setPhotoType] = useState<PhotoType>(PhotoType.TeslimAninda);
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDeleteConfirm, setPhotoDeleteConfirm] = useState({ show: false, id: 0 });
  const [lightboxSrc, setLightboxSrc] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Column manager
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const { columnStates, visibleColumns, savePreferences, resetToDefaults } =
    useColumnPreferences('assignments', ASSIGNMENT_COLS);

  const load = async () => {
    try {
      const [aRes, pRes, avRes] = await Promise.all([
        api.get<Assignment[]>('/assignments'),
        api.get<Personnel[]>('/personnel?isActive=true'),
        api.get<AvailableAsset[]>('/assignments/available-assets'),
      ]);
      setAssignments(aRes.data ?? []); setPersonnel(pRes.data ?? []); setAvailableAssets(avRes.data ?? []);
    } catch { setError('VERİLER YÜKLENEMEDİ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createAssignment = async () => {
    if (!addForm.personnelId || !addForm.assetId) { setError('PERSONEL VE DEMİRBAŞ SEÇİMİ ZORUNLUDUR.'); return; }
    setSaving(true);
    try {
      await api.post('/assignments', addForm);
      setShowAdd(false); setAddForm({ personnelId: 0, assetId: 0, notes: '' });
      setSuccess('ZİMMET BAŞARIYLA OLUŞTURULDU.'); await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'ZİMMET OLUŞTURULAMADI.');
    } finally { setSaving(false); }
  };

  const returnAssignment = async () => {
    setReturning(true);
    try {
      await api.patch(`/assignments/${returnModal.id}/return`, { returnNotes });
      setReturnModal({ show: false, id: 0, personnelName: '', assetName: '' }); setReturnNotes('');
      setSuccess('İADE İŞLEMİ BAŞARIYLA TAMAMLANDI.'); await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'İADE İŞLEMİ GERÇEKLEŞTİRİLEMEDİ.');
    } finally { setReturning(false); }
  };

  const openPhotoModal = async (a: Assignment) => {
    setPhotoModal({ show: true, assignmentId: a.id, personnelName: a.personnelFullName, assetName: a.assetName });
    try {
      const res = await api.get<AssignmentPhoto[]>(`/assignments/${a.id}/photos`);
      setAssignmentPhotos(res.data ?? []);
    } catch { setAssignmentPhotos([]); }
  };

  const uploadAssignmentPhoto = async (file: File) => {
    if (!photoModal.assignmentId) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('type', String(photoType));
      if (photoDesc) fd.append('description', photoDesc);
      const res = await api.post<AssignmentPhoto>(`/assignments/${photoModal.assignmentId}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignmentPhotos(prev => [res.data, ...prev]); setPhotoDesc('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'FOTOĞRAF YÜKLENEMEDİ.');
    } finally { setPhotoUploading(false); }
  };

  const deleteAssignmentPhoto = async (photoId: number) => {
    try {
      await api.delete(`/assignments/photos/${photoId}`);
      setAssignmentPhotos(prev => prev.filter(p => p.id !== photoId));
      setPhotoDeleteConfirm({ show: false, id: 0 });
    } catch { setError('FOTOĞRAF SİLİNEMEDİ.'); }
  };

  const downloadProtocol = async (id: number) => {
    try {
      const r = await api.get(`/assignments/${id}/protocol.docx`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url; a.download = `tutanak_${id}.docx`; a.click(); URL.revokeObjectURL(url);
    } catch { setError('TUTANAK İNDİRİLEMEDİ.'); }
  };

  const downloadExcel = async () => {
    try {
      const r = await api.get('/assignments/export/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'zimmet_raporu.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 150);
    } catch { setError('EXCEL İNDİRİLEMEDİ.'); }
  };

  // useMemo MUST be before any early return (Rules of Hooks)
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      for (const col of visibleColumns) {
        if (!col.filterable) continue;
        const fv = (colFilters[col.key] || '').trim();
        if (!fv) continue;
        if (col.key === 'status') {
          if (a.status !== parseInt(fv)) return false;
        } else {
          const val = String((a as unknown as Record<string, unknown>)[col.key] ?? '').toLowerCase();
          if (!val.includes(fv.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [assignments, colFilters, visibleColumns]);

  if (loading) return <><Header title="Zimmetler" /><Loader /></>;

  const activeAssignments = assignments.filter(a => a.status === AssignmentStatus.Aktif);
  const returnedAssignments = assignments.filter(a => a.status === AssignmentStatus.IadeEdildi);

  // Unique company names from assignments for filter dropdown
  const uniqueCompanies = [...new Set(assignments.map(a => a.companyName))].filter(Boolean).sort();

  const setFilter = (key: string, val: string) => setColFilters(prev => ({ ...prev, [key]: val }));

  const getCellText = (a: Assignment, col: ColumnDefinition): string => {
    if (col.key === 'status') return a.status === AssignmentStatus.Aktif ? 'AKTİF' : 'İADE EDİLDİ';
    if (col.key === 'assignedAt') return new Date(a.assignedAt).toLocaleString('tr-TR');
    if (col.key === 'returnedAt') return a.returnedAt ? new Date(a.returnedAt).toLocaleString('tr-TR') : '-';
    if (col.key === 'createdAt' || col.key === 'updatedAt') {
      const v = (a as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return v ? new Date(v).toLocaleString('tr-TR') : '-';
    }
    return String((a as unknown as Record<string, unknown>)[col.key] ?? '-');
  };

  const renderCell = (a: Assignment, col: ColumnDefinition) => {
    if (col.key === 'actions') {
      const isActive = a.status === AssignmentStatus.Aktif;
      return (
        <div className="d-flex gap-1">
          {isActive && (
            <button className="action-btn" style={{ background: '#fee2e2', color: 'var(--danger)' }} title="İADE AL"
              onClick={() => setReturnModal({ show: true, id: a.id, personnelName: a.personnelFullName, assetName: a.assetName })}>
              🔄
            </button>
          )}
          <button className="action-btn" style={{ background: '#f0fdf4', color: 'var(--success)' }} title="TUTANAK AL" onClick={() => downloadProtocol(a.id)}>📄</button>
          <button className="action-btn" style={{ background: '#f3e8ff', color: '#8b5cf6' }} title="FOTOĞRAFLAR" onClick={() => openPhotoModal(a)}>📷</button>
        </div>
      );
    }
    if (col.key === 'status') {
      const isActive = a.status === AssignmentStatus.Aktif;
      return <span className={`badge ${isActive ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>{isActive ? 'AKTİF' : 'İADE EDİLDİ'}</span>;
    }
    if (col.key === 'assetBarcode') return <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>{a.assetBarcode}</span>;
    if (col.renderType === 'datetime') {
      const text = getCellText(a, col);
      return <span style={{ fontSize: 11 }}>{text}</span>;
    }
    const text = getCellText(a, col);
    return <span style={{ fontSize: 12 }}>{text}</span>;
  };

  const renderFilter = (col: ColumnDefinition) => {
    if (!col.filterable) return null;
    const base = { fontSize: 11, padding: '2px 6px', height: 28 };
    if (col.key === 'status') {
      return (
        <select className="form-select form-select-sm" style={base}
          value={colFilters[col.key] || ''} onChange={e => setFilter(col.key, e.target.value)}>
          <option value="">TÜMÜ</option>
          <option value={AssignmentStatus.Aktif}>AKTİF</option>
          <option value={AssignmentStatus.IadeEdildi}>İADE EDİLDİ</option>
        </select>
      );
    }
    if (col.key === 'companyName') {
      return (
        <select className="form-select form-select-sm" style={base}
          value={colFilters[col.key] || ''} onChange={e => setFilter(col.key, e.target.value)}>
          <option value="">TÜMÜ</option>
          {uniqueCompanies.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
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
      <Header title="Zimmetler" subtitle="Zimmet ve İade Yönetimi" />
      <div className="main-content">
        {error && (
          <div className="alert alert-danger alert-dismissible py-2" style={{ fontSize: 12 }}>
            {error}<button className="btn-close" onClick={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible py-2" style={{ fontSize: 12 }}>
            {success}<button className="btn-close" onClick={() => setSuccess('')} />
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e220' }}><span>📋</span></div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{activeAssignments.length}</div>
              <div className="stat-label">AKTİF ZİMMET</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f0fdf420' }}><span>✅</span></div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{returnedAssignments.length}</div>
              <div className="stat-label">İADE EDİLEN</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f0fdf920' }}><span>🖥️</span></div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{availableAssets.length}</div>
              <div className="stat-label">ZİMMETLENEBİLİR</div>
            </div>
          </div>
        </div>

        <div className="page-header">
          <h5 className="page-title">ZİMMET GEÇMİŞİ ({assignments.length})</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowColumnManager(true)}>⚙ SÜTUNLAR</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={downloadExcel}>📥 EXCEL RAPORU</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ YENİ ZİMMET</button>
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
                {filteredAssignments.map(a => (
                  <tr key={a.id}>
                    {visibleColumns.map(col => (
                      <td key={col.key} style={{ width: col.width, maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={col.key !== 'actions' ? getCellText(a, col) : undefined}>
                        {renderCell(a, col)}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredAssignments.length === 0 && (
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
            TOPLAM: <strong>{filteredAssignments.length}</strong> KAYIT
            {filteredAssignments.length !== assignments.length && <span className="ms-2">(FİLTRELENDİ: {assignments.length} KAYITTAN)</span>}
          </div>
        </div>

        {/* New Assignment Modal */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
          <Modal.Header closeButton><Modal.Title>YENİ ZİMMET OLUŞTUR</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">PERSONEL *</label>
              <select className="form-select" value={addForm.personnelId}
                onChange={e => setAddForm(p => ({ ...p, personnelId: Number(e.target.value) }))}>
                <option value={0}>PERSONEL SEÇİN</option>
                {personnel.map(p => (
                  <option key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`.toUpperCase()} - {p.companyName.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">DEMİRBAŞ * ({availableAssets.length} BOŞTA)</label>
              <select className="form-select" value={addForm.assetId}
                onChange={e => setAddForm(p => ({ ...p, assetId: Number(e.target.value) }))}>
                <option value={0}>DEMİRBAŞ SEÇİN</option>
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>[{a.barcode}] {a.name.toUpperCase()} - {a.categoryName.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">NOTLAR</label>
              <textarea className="form-control" rows={3} value={addForm.notes}
                onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="ZİMMET NOTU (OPSİYONEL)" autoComplete="off" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>İPTAL</Button>
            <Button variant="primary" onClick={createAssignment} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}ZİMMETLE
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Return Modal */}
        <Modal show={returnModal.show} onHide={() => setReturnModal({ show: false, id: 0, personnelName: '', assetName: '' })} centered>
          <Modal.Header closeButton><Modal.Title>İADE AL</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className="mb-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PERSONEL</div>
              <div style={{ fontWeight: 700 }}>{returnModal.personnelName.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>DEMİRBAŞ</div>
              <div style={{ fontWeight: 700 }}>{returnModal.assetName.toUpperCase()}</div>
            </div>
            <div className="mb-3">
              <label className="form-label">İADE NOTU</label>
              <textarea className="form-control" rows={3} value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)} placeholder="İADE DURUMU NOTU (OPSİYONEL)" autoComplete="off" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setReturnModal({ show: false, id: 0, personnelName: '', assetName: '' }); setReturnNotes(''); }}>İPTAL</Button>
            <Button variant="warning" onClick={returnAssignment} disabled={returning}>
              {returning ? <span className="spinner-border spinner-border-sm me-2" /> : null}İADE AL
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Photo Modal */}
        <Modal show={photoModal.show} onHide={() => setPhotoModal({ show: false, assignmentId: 0, personnelName: '', assetName: '' })} size="lg" centered>
          <Modal.Header closeButton><Modal.Title>ZİMMET FOTOĞRAFLARI</Modal.Title></Modal.Header>
          <Modal.Body>
            <div className="mb-3 p-2" style={{ background: 'var(--bg-light)', borderRadius: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{photoModal.personnelName.toUpperCase()}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}> — {photoModal.assetName.toUpperCase()}</span>
            </div>
            <div className="mb-3 d-flex gap-2 align-items-center flex-wrap">
              <select className="form-select form-select-sm" style={{ width: 160 }}
                value={photoType} onChange={e => setPhotoType(Number(e.target.value) as PhotoType)}>
                <option value={PhotoType.TeslimAninda}>TESLİM ANINDA</option>
                <option value={PhotoType.IadeAninda}>İADE ANINDA</option>
              </select>
              <input type="text" className="form-control form-control-sm" style={{ maxWidth: 180 }}
                placeholder="AÇIKLAMA (OPSİYONEL)" value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} />
              <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                {photoUploading ? <span className="spinner-border spinner-border-sm" /> : '📷 YÜKLE'}
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAssignmentPhoto(f); e.target.value = ''; }}
                  disabled={photoUploading} />
              </label>
            </div>
            {assignmentPhotos.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {assignmentPhotos.map(p => (
                  <div key={p.id} style={{ position: 'relative', width: 110 }}>
                    <img src={`${apiBase}${p.thumbnailPath}`} alt={p.originalFileName}
                      onClick={() => setLightboxSrc(`${apiBase}${p.filePath}`)}
                      style={{ width: 110, height: 85, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in', border: '1px solid var(--border-color)' }} />
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                      {p.photoType === PhotoType.TeslimAninda ? 'TESLİM' : 'İADE'}
                    </div>
                    <button onClick={() => setPhotoDeleteConfirm({ show: true, id: p.id })}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, padding: '1px 4px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>HENÜZ FOTOĞRAF EKLENMEMİŞ</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPhotoModal({ show: false, assignmentId: 0, personnelName: '', assetName: '' })}>KAPAT</Button>
          </Modal.Footer>
        </Modal>

        {lightboxSrc && (
          <div onClick={() => setLightboxSrc('')}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
            <img src={lightboxSrc} alt="Fotoğraf" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
          </div>
        )}

        <ConfirmModal show={photoDeleteConfirm.show} title="FOTOĞRAF SİL" message="BU FOTOĞRAFI SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?"
          onConfirm={() => deleteAssignmentPhoto(photoDeleteConfirm.id)} onCancel={() => setPhotoDeleteConfirm({ show: false, id: 0 })} confirmText="SİL" />

        <ColumnManager show={showColumnManager} onHide={() => setShowColumnManager(false)}
          definitions={ASSIGNMENT_COLS} states={columnStates}
          onSave={savePreferences} onReset={resetToDefaults} />
      </div>
    </>
  );
}
