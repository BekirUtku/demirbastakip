import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import BarTenderHintModal from '../components/common/BarTenderHintModal';
import ColumnManager from '../components/common/ColumnManager';
import { useColumnPreferences } from '../hooks/useColumnPreferences';
import api from '../services/api';
import type { Asset, AssetPhoto, Category, CategoryQuestion } from '../types';
import type { ColumnDefinition } from '../types/columns';
import { AssetStatus, AnswerType } from '../types';

function StatusBadge({ status }: { status: AssetStatus }) {
  const map: Record<number, { label: string; cls: string }> = {
    [AssetStatus.Kayitli]: { label: 'KAYITLI', cls: 'badge-kayitli' },
    [AssetStatus.Zimmetli]: { label: 'ZİMMETLİ', cls: 'badge-zimmetli' },
    [AssetStatus.Pasif]: { label: 'PASİF', cls: 'badge-pasif' },
  };
  const b = map[status] ?? { label: 'BİLİNMİYOR', cls: 'bg-secondary' };
  return <span className={`badge ${b.cls}`} style={{ fontSize: 10, fontWeight: 700 }}>{b.label}</span>;
}

const BASE_COLS: ColumnDefinition[] = [
  { key: 'select',            label: '☐',                  defaultVisible: true,  defaultWidth: 40,  defaultOrder: 0,   sticky: true },
  { key: 'barcode',           label: 'BARKOD',             defaultVisible: true,  defaultWidth: 130, defaultOrder: 1,   filterable: true, filterType: 'text',   renderType: 'barcode', minWidth: 80 },
  { key: 'name',              label: 'ADI',                defaultVisible: true,  defaultWidth: 200, defaultOrder: 2,   filterable: true, filterType: 'text',   minWidth: 80 },
  { key: 'serialNumber',      label: 'SERİ NO',            defaultVisible: true,  defaultWidth: 150, defaultOrder: 3,   filterable: true, filterType: 'text',   minWidth: 60 },
  { key: 'categoryName',      label: 'KATEGORİ',           defaultVisible: true,  defaultWidth: 140, defaultOrder: 4,   filterable: true, filterType: 'select', minWidth: 80 },
  { key: 'status',            label: 'DURUM',              defaultVisible: true,  defaultWidth: 110, defaultOrder: 5,   filterable: true, filterType: 'select', renderType: 'badge',   minWidth: 80 },
  { key: 'description',       label: 'AÇIKLAMA',           defaultVisible: false, defaultWidth: 200, defaultOrder: 6,   filterable: true, filterType: 'text' },
  { key: 'createdAt',         label: 'EKLENME TARİHİ',     defaultVisible: false, defaultWidth: 150, defaultOrder: 7,   renderType: 'datetime' },
  { key: 'createdByUserName', label: 'EKLEYEN',            defaultVisible: false, defaultWidth: 140, defaultOrder: 8 },
  { key: 'updatedAt',         label: 'GÜNCELLEME TARİHİ',  defaultVisible: false, defaultWidth: 150, defaultOrder: 9,   renderType: 'datetime' },
  { key: 'updatedByUserName', label: 'GÜNCELLEYEN',        defaultVisible: false, defaultWidth: 140, defaultOrder: 10 },
  { key: 'actions',           label: 'İŞLEM',              defaultVisible: true,  defaultWidth: 180, defaultOrder: 999, sticky: true, renderType: 'actions', minWidth: 120 },
];

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: '', serialNumber: '', description: '', categoryId: 0, status: AssetStatus.Kayitli,
    answers: [] as { categoryQuestionId: number; answerValue: string }[]
  });
  const [dynQuestions, setDynQuestions] = useState<CategoryQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: 0 });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showHintModal, setShowHintModal] = useState(false);

  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoDeleteConfirm, setPhotoDeleteConfirm] = useState({ show: false, id: 0 });
  const [lightboxSrc, setLightboxSrc] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Column manager state
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [allCategoryQuestions, setAllCategoryQuestions] = useState<{ id: number; questionText: string }[]>([]);

  const load = async () => {
    try {
      const [assetsRes, catsRes] = await Promise.all([
        api.get<Asset[]>('/assets'),
        api.get<Category[]>('/categories'),
      ]);
      setAssets(assetsRes.data ?? []);
      setCategories(catsRes.data ?? []);
    } catch { setError('VERİLER YÜKLENEMEDİ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Collect all unique category questions for dynamic columns
  useEffect(() => {
    api.get<Category[]>('/categories').then(res => {
      const qs: { id: number; questionText: string }[] = [];
      const seen = new Set<string>();
      (res.data ?? []).forEach(cat => {
        (cat.questions ?? []).forEach(q => {
          const k = q.questionText.toLowerCase();
          if (!seen.has(k)) { seen.add(k); qs.push({ id: q.id, questionText: q.questionText }); }
        });
      });
      setAllCategoryQuestions(qs);
    }).catch(() => {});
  }, []);

  const columnDefinitions = useMemo((): ColumnDefinition[] => {
    const dynCols: ColumnDefinition[] = allCategoryQuestions.map((q, idx) => ({
      key: `q_${q.id}`,
      label: q.questionText.toUpperCase(),
      defaultVisible: false,
      defaultWidth: 140,
      defaultOrder: 100 + idx,
      filterable: true,
      filterType: 'text' as const,
      isDynamic: true,
      questionText: q.questionText,
    }));
    const withoutActions = BASE_COLS.slice(0, -1);
    return [...withoutActions, ...dynCols, BASE_COLS[BASE_COLS.length - 1]];
  }, [allCategoryQuestions]);

  const { columnStates, visibleColumns, savePreferences, resetToDefaults } =
    useColumnPreferences('assets', columnDefinitions);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      for (const col of visibleColumns) {
        if (!col.filterable) continue;
        const fv = (colFilters[col.key] || '').trim();
        if (!fv) continue;
        if (col.key === 'status') {
          if (asset.status !== parseInt(fv)) return false;
        } else if (col.isDynamic) {
          const ans = asset.answers.find(a => a.questionText?.toLowerCase() === col.questionText?.toLowerCase());
          if (!(ans?.answerValue || '').toLowerCase().includes(fv.toLowerCase())) return false;
        } else {
          const val = String((asset as unknown as Record<string, unknown>)[col.key] ?? '').toLowerCase();
          if (!val.includes(fv.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [assets, colFilters, visibleColumns]);

  const setFilter = (key: string, val: string) => setColFilters(prev => ({ ...prev, [key]: val }));

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    if (selectedIds.length > 0 && selectedIds.length === filteredAssets.length) setSelectedIds([]);
    else setSelectedIds(filteredAssets.map(a => a.id));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    window.URL.revokeObjectURL(url);
  };

  const showBarTenderInstructions = () => {
    if (localStorage.getItem('hideBarTenderHint') === 'true') return;
    setShowHintModal(true);
  };

  const handleSinglePrint = async (assetId: number, barcode: string) => {
    try {
      const r = await api.get(`/assets/${assetId}/print-csv`, { responseType: 'blob' });
      downloadBlob(r.data, `barkod_${barcode}.csv`);
      showBarTenderInstructions();
    } catch { setError('YAZDIR DOSYASI OLUŞTURULAMADI.'); }
  };

  const handleBatchPrint = async () => {
    if (selectedIds.length === 0) return;
    try {
      const r = await api.post('/assets/print-csv-batch', { assetIds: selectedIds }, { responseType: 'blob' });
      downloadBlob(r.data, `barkod_toplu_${Date.now()}.csv`);
      showBarTenderInstructions();
      setSelectedIds([]);
    } catch { setError('TOPLU YAZDIR DOSYASI OLUŞTURULAMADI.'); }
  };

  const onCategoryChange = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    const questions = cat?.questions ?? [];
    setDynQuestions(questions);
    setForm(prev => ({
      ...prev, categoryId: catId,
      answers: questions.map(q => ({ categoryQuestionId: q.id, answerValue: '' }))
    }));
  };

  const setAnswerValue = (questionId: number, value: string) =>
    setForm(prev => ({
      ...prev,
      answers: prev.answers.map(a => a.categoryQuestionId === questionId ? { ...a, answerValue: value } : a)
    }));

  const openAdd = () => {
    setForm({ name: '', serialNumber: '', description: '', categoryId: 0, status: AssetStatus.Kayitli, answers: [] });
    setDynQuestions([]); setEditMode(false); setShowAdd(true);
  };

  const openEdit = (asset: Asset) => {
    const cat = categories.find(c => c.id === asset.categoryId);
    setDynQuestions(cat?.questions ?? []);
    setForm({
      name: asset.name, serialNumber: asset.serialNumber ?? '',
      description: asset.description ?? '', categoryId: asset.categoryId, status: asset.status,
      answers: (cat?.questions ?? []).map(q => {
        const existing = asset.answers.find(a => a.categoryQuestionId === q.id);
        return { categoryQuestionId: q.id, answerValue: existing?.answerValue ?? '' };
      })
    });
    setSelectedAsset(asset); setEditMode(true); setShowDetail(false); setShowAdd(true);
  };

  const saveAsset = async () => {
    if (!form.name.trim() || form.categoryId === 0) { setError('DEMİRBAŞ ADI VE KATEGORİ ZORUNLUDUR.'); return; }
    setSaving(true);
    try {
      if (editMode && selectedAsset) await api.put(`/assets/${selectedAsset.id}`, { ...form });
      else await api.post('/assets', { name: form.name, serialNumber: form.serialNumber, description: form.description, categoryId: form.categoryId, answers: form.answers });
      setShowAdd(false); await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'DEMİRBAŞ KAYDEDİLEMEDİ.');
    } finally { setSaving(false); }
  };

  const deleteAsset = async () => {
    try {
      await api.delete(`/assets/${deleteConfirm.id}`);
      setDeleteConfirm({ show: false, id: 0 }); await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'DEMİRBAŞ SİLİNEMEDİ.');
      setDeleteConfirm({ show: false, id: 0 });
    }
  };

  const downloadBarcode = async (assetId: number, barcode: string) => {
    try {
      const r = await api.get(`/assets/${assetId}/barcode.png`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url; a.download = `barkod_${barcode}.png`; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('BARKOD İNDİRİLEMEDİ.'); }
  };

  const viewDetail = async (assetId: number) => {
    try {
      const [assetRes, photoRes] = await Promise.all([
        api.get<Asset>(`/assets/${assetId}`),
        api.get<AssetPhoto[]>(`/assets/${assetId}/photos`),
      ]);
      setSelectedAsset(assetRes.data); setPhotos(photoRes.data ?? []); setShowDetail(true);
    } catch { setError('DEMİRBAŞ DETAYI YÜKLENEMEDİ.'); }
  };

  const uploadPhoto = async (file: File) => {
    if (!selectedAsset) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (photoDesc) fd.append('description', photoDesc);
      const res = await api.post<AssetPhoto>(`/assets/${selectedAsset.id}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos(prev => [res.data, ...prev]); setPhotoDesc('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'FOTOĞRAF YÜKLENEMEDİ.');
    } finally { setPhotoUploading(false); }
  };

  const deletePhoto = async (photoId: number) => {
    try {
      await api.delete(`/assets/photos/${photoId}`);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setPhotoDeleteConfirm({ show: false, id: 0 });
    } catch { setError('FOTOĞRAF SİLİNEMEDİ.'); }
  };

  // --- Render helpers ---
  const getCellText = (asset: Asset, col: ColumnDefinition): string => {
    if (col.isDynamic) {
      const ans = asset.answers.find(a => a.questionText?.toLowerCase() === col.questionText?.toLowerCase());
      return ans?.answerValue || '-';
    }
    if (col.key === 'status') return asset.status === AssetStatus.Kayitli ? 'KAYITLI' : asset.status === AssetStatus.Zimmetli ? 'ZİMMETLİ' : 'PASİF';
    if (col.key === 'createdAt' || col.key === 'updatedAt') {
      const v = (asset as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return v ? new Date(v).toLocaleString('tr-TR') : '-';
    }
    return String((asset as unknown as Record<string, unknown>)[col.key] ?? '-');
  };

  const renderCell = (asset: Asset, col: ColumnDefinition) => {
    if (col.key === 'select') {
      return <input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelect(asset.id)} />;
    }
    if (col.key === 'actions') {
      return (
        <div className="d-flex gap-1">
          <button className="action-btn" style={{ background: '#dbeafe', color: 'var(--info)' }} title="DETAY" onClick={() => viewDetail(asset.id)}>👁</button>
          <button className="action-btn" style={{ background: '#f3e8ff', color: '#8b5cf6' }} title="BARTENDER CSV YAZDIR" onClick={() => handleSinglePrint(asset.id, asset.barcode)}>🖨️</button>
          <button className="action-btn" style={{ background: '#f0fdf9', color: 'var(--primary-dark)' }} title="BARKOD PNG İNDİR" onClick={() => downloadBarcode(asset.id, asset.barcode)}>📥</button>
          <button className="action-btn" style={{ background: '#fee2e2', color: 'var(--danger)' }} title="SİL" onClick={() => setDeleteConfirm({ show: true, id: asset.id })}>🗑️</button>
        </div>
      );
    }
    if (col.key === 'barcode') return <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{asset.barcode}</span>;
    if (col.key === 'status') return <StatusBadge status={asset.status} />;
    if (col.renderType === 'datetime') {
      const v = (asset as unknown as Record<string, unknown>)[col.key] as string | undefined;
      return <span style={{ fontSize: 11 }}>{v ? new Date(v).toLocaleString('tr-TR') : '-'}</span>;
    }
    const text = getCellText(asset, col);
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
          <option value="0">KAYITLI</option>
          <option value="1">ZİMMETLİ</option>
          <option value="2">PASİF</option>
        </select>
      );
    }
    if (col.key === 'categoryName') {
      return (
        <select className="form-select form-select-sm" style={base}
          value={colFilters[col.key] || ''} onChange={e => setFilter(col.key, e.target.value)}>
          <option value="">TÜMÜ</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
        </select>
      );
    }
    return (
      <input type="text" className="form-control form-control-sm" style={base}
        placeholder="FİLTRE..." value={colFilters[col.key] || ''}
        onChange={e => setFilter(col.key, e.target.value)} autoComplete="off" />
    );
  };

  if (loading) return <><Header title="Demirbaşlar" /><Loader /></>;

  const allFilteredSelected = filteredAssets.length > 0 && selectedIds.length === filteredAssets.length;
  const someSelected = selectedIds.length > 0 && !allFilteredSelected;

  return (
    <>
      <Header title="Demirbaşlar" subtitle="Demirbaş Envanter Yönetimi" />
      <div className="main-content">
        {error && (
          <div className="alert alert-danger alert-dismissible py-2" style={{ fontSize: 12 }}>
            {error}<button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="page-header">
          <h5 className="page-title">DEMİRBAŞ LİSTESİ ({assets.length})</h5>
          <div className="d-flex gap-2 align-items-center">
            {selectedIds.length > 0 && (
              <button className="btn btn-sm" style={{ background: '#8b5cf6', color: '#fff', borderColor: '#8b5cf6' }} onClick={handleBatchPrint}>
                🖨 SEÇİLENLERİ YAZDIR ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowColumnManager(true)}>⚙ SÜTUNLAR</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={async () => {
              try {
                const r = await api.get('/assets/export/excel', { responseType: 'blob' });
                const url = URL.createObjectURL(r.data);
                const a = document.createElement('a');
                a.href = url; a.download = 'demirbaslar.xlsx';
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 150);
              } catch { setError('EXCEL İNDİRİLEMEDİ.'); }
            }}>📥 EXCEL</button>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ YENİ DEMİRBAŞ</button>
          </div>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
              <thead>
                <tr>
                  {visibleColumns.map(col => (
                    col.key === 'select'
                      ? (
                        <th key="select" style={{ width: col.width, minWidth: col.width }}>
                          <input type="checkbox" checked={allFilteredSelected}
                            ref={el => { if (el) el.indeterminate = someSelected; }}
                            onChange={toggleSelectAll} />
                        </th>
                      )
                      : <th key={col.key} style={{ width: col.width, minWidth: col.minWidth ?? 60 }}>{col.label}</th>
                  ))}
                </tr>
                <tr className="filter-row">
                  {visibleColumns.map(col => (
                    <td key={`f-${col.key}`} style={{ width: col.width }}>{renderFilter(col)}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id}>
                    {visibleColumns.map(col => (
                      <td key={col.key} style={{ width: col.width, maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={col.key !== 'select' && col.key !== 'actions' ? getCellText(asset, col) : undefined}>
                        {renderCell(asset, col)}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
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
            TOPLAM: <strong>{filteredAssets.length}</strong> KAYIT
            {filteredAssets.length !== assets.length && <span className="ms-2">(FİLTRELENDİ: {assets.length} KAYITTAN)</span>}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? 'DEMİRBAŞ DÜZENLE' : 'YENİ DEMİRBAŞ EKLE'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">DEMİRBAŞ ADI *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoComplete="off" />
              </div>
              <div className="col-md-6">
                <label className="form-label">KATEGORİ *</label>
                <select className="form-select" value={form.categoryId} onChange={e => onCategoryChange(Number(e.target.value))}>
                  <option value={0}>KATEGORİ SEÇİN</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">SERİ NO</label>
                <input className="form-control" value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))} autoComplete="off" />
              </div>
              {editMode && (
                <div className="col-md-6">
                  <label className="form-label">DURUM</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: Number(e.target.value) as AssetStatus }))}>
                    <option value={AssetStatus.Kayitli}>KAYITLI</option>
                    <option value={AssetStatus.Zimmetli}>ZİMMETLİ</option>
                    <option value={AssetStatus.Pasif}>PASİF</option>
                  </select>
                </div>
              )}
              <div className="col-12">
                <label className="form-label">AÇIKLAMA</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} autoComplete="off" />
              </div>
              {dynQuestions.length > 0 && (
                <div className="col-12">
                  <hr className="section-divider" />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    KATEGORİYE ÖZEL BİLGİLER
                  </div>
                  <div className="row g-2">
                    {dynQuestions.map(q => (
                      <div key={q.id} className="col-md-6">
                        <label className="form-label">
                          {q.questionText.toUpperCase()}
                          {q.isRequired && <span className="text-danger ms-1">*</span>}
                        </label>
                        {q.answerType === AnswerType.YesNo ? (
                          <select className="form-select form-select-sm"
                            value={form.answers.find(a => a.categoryQuestionId === q.id)?.answerValue ?? ''}
                            onChange={e => setAnswerValue(q.id, e.target.value)}>
                            <option value="">SEÇİN</option>
                            <option value="Evet">EVET</option>
                            <option value="Hayır">HAYIR</option>
                          </select>
                        ) : (
                          <input type={q.answerType === AnswerType.Number ? 'number' : 'text'}
                            className="form-control form-control-sm"
                            value={form.answers.find(a => a.categoryQuestionId === q.id)?.answerValue ?? ''}
                            onChange={e => setAnswerValue(q.id, e.target.value)} autoComplete="off" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>İPTAL</Button>
            <Button variant="primary" onClick={saveAsset} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}KAYDET
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Detail Modal */}
        <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>DEMİRBAŞ DETAYI</Modal.Title>
          </Modal.Header>
          {selectedAsset && (
            <Modal.Body>
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <span className="form-label">BARKOD</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{selectedAsset.barcode}</div>
                </div>
                <div className="col-md-6">
                  <span className="form-label">DURUM</span>
                  <div><StatusBadge status={selectedAsset.status} /></div>
                </div>
                <div className="col-md-6">
                  <span className="form-label">ADI</span>
                  <div style={{ fontWeight: 600 }}>{selectedAsset.name.toUpperCase()}</div>
                </div>
                <div className="col-md-6">
                  <span className="form-label">KATEGORİ</span>
                  <div>{selectedAsset.categoryName.toUpperCase()}</div>
                </div>
                {selectedAsset.serialNumber && (
                  <div className="col-md-6">
                    <span className="form-label">SERİ NO</span>
                    <div>{selectedAsset.serialNumber}</div>
                  </div>
                )}
              </div>
              {selectedAsset.answers.length > 0 && (
                <>
                  <hr />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>KATEGORİ BİLGİLERİ</div>
                  <div className="row g-2 mb-3">
                    {selectedAsset.answers.map(a => (
                      <div key={a.categoryQuestionId} className="col-md-6">
                        <span className="form-label">{a.questionText.toUpperCase()}</span>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{a.answerValue || '-'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {selectedAsset.assignmentHistory.length > 0 && (
                <>
                  <hr />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>ZİMMET GEÇMİŞİ</div>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr><th>PERSONEL</th><th>ZİMMET TARİHİ</th><th>İADE TARİHİ</th><th>DURUM</th></tr>
                      </thead>
                      <tbody>
                        {selectedAsset.assignmentHistory.map(h => (
                          <tr key={h.id}>
                            <td>{h.personnelFullName.toUpperCase()}</td>
                            <td style={{ fontSize: 12 }}>{new Date(h.assignedAt).toLocaleString('tr-TR')}</td>
                            <td style={{ fontSize: 12 }}>{h.returnedAt ? new Date(h.returnedAt).toLocaleString('tr-TR') : '-'}</td>
                            <td><span className={`badge ${h.status === 'Aktif' ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>{h.status.toUpperCase()}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <hr />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>FOTOĞRAFLAR ({photos.length})</div>
              <div className="mb-2 d-flex gap-2 align-items-center">
                <input ref={photoInputRef} type="text" className="form-control form-control-sm" placeholder="AÇIKLAMA (OPSİYONEL)"
                  value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} style={{ maxWidth: 200 }} />
                <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                  {photoUploading ? <span className="spinner-border spinner-border-sm" /> : '📷 FOTOĞRAF EKLE'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }}
                    disabled={photoUploading} />
                </label>
              </div>
              {photos.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ position: 'relative', width: 90, flexShrink: 0 }}>
                      <img src={`${apiBase}${p.thumbnailPath}`} alt={p.originalFileName} title={p.description ?? p.originalFileName}
                        onClick={() => setLightboxSrc(`${apiBase}${p.filePath}`)}
                        style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in', border: '1px solid var(--border-color)' }} />
                      <button onClick={() => setPhotoDeleteConfirm({ show: true, id: p.id })}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, padding: '1px 4px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>HENÜZ FOTOĞRAF EKLENMEMİŞ</div>
              )}
            </Modal.Body>
          )}
          <Modal.Footer>
            <Button variant="outline-primary" onClick={() => { setShowDetail(false); if (selectedAsset) openEdit(selectedAsset); }}>DÜZENLE</Button>
            <Button variant="secondary" onClick={() => setShowDetail(false)}>KAPAT</Button>
          </Modal.Footer>
          {lightboxSrc && (
            <div onClick={() => setLightboxSrc('')}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
              <img src={lightboxSrc} alt="Fotoğraf" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
            </div>
          )}
          <ConfirmModal show={photoDeleteConfirm.show} title="FOTOĞRAF SİL" message="BU FOTOĞRAFI SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?"
            onConfirm={() => deletePhoto(photoDeleteConfirm.id)} onCancel={() => setPhotoDeleteConfirm({ show: false, id: 0 })} confirmText="SİL" />
        </Modal>

        <BarTenderHintModal show={showHintModal} onClose={() => setShowHintModal(false)} />

        <ConfirmModal show={deleteConfirm.show} title="DEMİRBAŞ SİL"
          message="BU DEMİRBAŞI SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ? AKTİF ZİMMETİ VARSA SİLİNEMEZ."
          onConfirm={deleteAsset} onCancel={() => setDeleteConfirm({ show: false, id: 0 })} confirmText="SİL" />

        <ColumnManager show={showColumnManager} onHide={() => setShowColumnManager(false)}
          definitions={columnDefinitions} states={columnStates}
          onSave={savePreferences} onReset={resetToDefaults} />
      </div>
    </>
  );
}
