import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';
import {
  PRESETS,
  GREETING_DEFAULT,
  formatTrPhone,
  buildSignatureHtml,
  buildCompactHtml,
  renderPersonnelPng,
  renderCompactPng,
  embedImages,
  assetOverrides,
  type CompanyKey,
  type SigFields,
} from '../services/signature';

export default function EmailSignatures() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [assetCompany, setAssetCompany] = useState<CompanyKey>('lokum');
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | ''>('');

  const [fields, setFields] = useState<SigFields>({
    company: 'lokum',
    greeting: GREETING_DEFAULT,
    fullName: '',
    title: '',
    englishTitle: '',
    companyName: PRESETS.lokum.companyDisplayName,
    city: '',
    addressLine1: '',
    addressLine2: '',
    phone: '',
    mobile: '',
    email: '',
    website: PRESETS.lokum.website,
  });

  const [format, setFormat] = useState<'full' | 'compact'>('full');
  const [rawMode, setRawMode] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const [rawHtml, setRawHtml] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bulkIds, setBulkIds] = useState<number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [personImg, setPersonImg] = useState<{ url: string; width: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, lRes, cRes, aRes] = await Promise.all([
          api.get('/Personnel'),
          api.get('/signature-locations').catch(() => ({ data: [] })),
          api.get('/Companies').catch(() => ({ data: [] })),
          api.get('/signature-assets').catch(() => ({ data: [] })),
        ]);
        setPersonnel(pRes.data || []);
        setLocations(lRes.data || []);
        setCompanies(cRes.data || []);
        setAssets(Array.isArray(aRes.data) ? aRes.data : []);
      } catch (e) {
        console.error('Veri yükleme hatası:', e);
      }
    })();
  }, []);

  const set = (k: keyof SigFields, v: string) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  const detectCompany = (companyName: string): CompanyKey =>
    /ogaş|ogas/i.test(companyName || '') ? 'ogas' : 'lokum';

  // Seçilen firma şablonuna karşılık gelen Firma kaydını bul
  const matchCompany = (key: CompanyKey) =>
    companies.find((c) => {
      const n = `${c.name ?? ''} ${c.companyName ?? ''}`.toLowerCase();
      return key === 'ogas' ? /oga[sş]/i.test(n) : /lokum/i.test(n);
    });

  // Firma kaydının adresini adres satırlarına böl
  const companyAddressLines = (key: CompanyKey) => {
    const c = matchCompany(key);
    if (!c?.address) return null;
    const parts = String(c.address)
      .split(/\r?\n/)
      .map((x: string) => x.trim())
      .filter(Boolean);
    return { addressLine1: parts[0] ?? '', addressLine2: parts.slice(1).join(', ') };
  };

  const fieldsForPersonnel = (p: any): SigFields => {
    const company = detectCompany(p.companyName);
    const loc = locations.find((l) => l.id === p.signatureLocationId);
    const addr = companyAddressLines(company);
    // Öncelik: personelin şubesi -> firma adresi -> imza lokasyonu
    const branchAddress = p.branchAddress ? String(p.branchAddress) : '';
    return {
      company,
      greeting: GREETING_DEFAULT,
      fullName: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
      title: p.title ?? '',
      englishTitle: p.englishTitle ?? '',
      companyName: PRESETS[company].companyDisplayName,
      city: p.branchName ?? loc?.displayName ?? loc?.name ?? '',
      addressLine1: branchAddress || addr?.addressLine1 || loc?.addressLine1 || '',
      addressLine2: branchAddress ? '' : (addr?.addressLine2 ?? loc?.addressLine2 ?? ''),
      phone: formatTrPhone(
        p.branchPhone ||
          (company === 'ogas' ? loc?.ogasPhone : loc?.lokumPhone) ||
          p.phone ||
          '',
      ),
      mobile: '',
      email: p.email ?? '',
      website: PRESETS[company].website,
    };
  };

  const onSelectPersonnel = (idStr: string) => {
    const id = idStr ? Number(idStr) : '';
    setSelectedId(id);
    if (!id) return;
    const p = personnel.find((x) => x.id === id);
    if (!p) return;
    setFields(fieldsForPersonnel(p));
    setRawMode(false);
  };

  // Kişi/alanlar değişince bilgi bloğunu otomatik PNG'ye çevir
  useEffect(() => {
    let cancelled = false;
    (format === 'compact'
      ? renderCompactPng(fields)
      : renderPersonnelPng(fields)
    )
      .then((img) => {
        if (!cancelled) setPersonImg(img);
      })
      .catch(() => {
        if (!cancelled) setPersonImg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fields, format]);

  const ov = useMemo(
    () => assetOverrides(assets, fields.company),
    [assets, fields.company],
  );
  const generatedHtml = useMemo(
    () =>
      format === 'compact'
        ? buildCompactHtml(fields, personImg ?? undefined)
        : buildSignatureHtml(fields, personImg ?? undefined, ov),
    [fields, personImg, format, ov],
  );
  const previewHtml = rawMode ? rawHtml : generatedHtml;

  const enterRawMode = () => {
    setRawHtml(generatedHtml);
    setRawMode(true);
  };
  const backToForm = () => setRawMode(false);

  const handleCopy = async () => {
    try {
      const inner = rawMode ? rawHtml : generatedHtml;
      const embedded = await embedImages(inner);
      const plain = embedded.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([embedded], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Kopyalama hatası:', e);
      alert('Panoya kopyalanamadı. Tarayıcı izni gerekebilir veya HTTPS gerekebilir.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const inner = rawMode ? rawHtml : generatedHtml;
      const embedded = await embedImages(inner);
      const doc = `<html>\n<head>\n<meta charset="utf-8">\n<title>Imza</title>\n</head>\n<body style="margin:0;padding:0;">\n${embedded}\n</body>\n</html>`;
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (fields.fullName || 'imza').replace(/[^\p{L}\p{N}]+/gu, '_');
      a.href = url;
      a.download = `${PRESETS[fields.company].label}_${safeName}.htm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('İndirme hatası:', e);
      alert('İmza indirilemedi. Konsolu kontrol edin.');
    } finally {
      setDownloading(false);
    }
  };

  const reloadAssets = async () => {
    try {
      const r = await api.get('/signature-assets');
      setAssets(Array.isArray(r.data) ? r.data : []);
    } catch { /* yoksay */ }
  };
  const handleUpload = async (kind: string, file?: File | null) => {
    if (!file) return;
    setUploadingKind(kind);
    try {
      const fd = new FormData();
      fd.append('company', assetCompany);
      fd.append('kind', kind);
      fd.append('file', file);
      await api.post('/signature-assets', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await reloadAssets();
    } catch (e) {
      console.error('Görsel yükleme hatası:', e);
      alert('Görsel yüklenemedi.');
    } finally {
      setUploadingKind(null);
    }
  };
  const toggleAsset = async (a: any) => {
    try {
      await api.put(`/signature-assets/${a.id}`, {
        width: a.width, offsetX: a.offsetX || 0, offsetY: a.offsetY || 0, sortOrder: a.sortOrder, isActive: !a.isActive,
      });
      await reloadAssets();
    } catch { alert('Durum güncellenemedi.'); }
  };
  const changeAssetWidth = async (a: any, w: string) => {
    const width = Number(w) || a.width;
    if (width === a.width) return;
    try {
      await api.put(`/signature-assets/${a.id}`, {
        width, offsetX: a.offsetX || 0, offsetY: a.offsetY || 0, sortOrder: a.sortOrder, isActive: a.isActive,
      });
      await reloadAssets();
    } catch { /* yoksay */ }
  };
  const deleteAsset = async (id: number) => {
    if (!window.confirm('Bu görsel silinsin mi?')) return;
    try {
      await api.delete(`/signature-assets/${id}`);
      await reloadAssets();
    } catch { alert('Görsel silinemedi.'); }
  };
  const moveAsset = async (list: any[], index: number, dir: -1 | 1) => {
    const target = list[index + dir];
    const cur = list[index];
    if (!target || !cur) return;
    try {
      await Promise.all([
        api.put(`/signature-assets/${cur.id}`, {
          width: cur.width, offsetX: cur.offsetX || 0, offsetY: cur.offsetY || 0, sortOrder: target.sortOrder, isActive: cur.isActive,
        }),
        api.put(`/signature-assets/${target.id}`, {
          width: target.width, offsetX: target.offsetX || 0, offsetY: target.offsetY || 0, sortOrder: cur.sortOrder, isActive: target.isActive,
        }),
      ]);
      await reloadAssets();
    } catch { alert('Sıra değiştirilemedi.'); }
  };
  const changeAssetOffset = async (a: any, axis: 'x' | 'y', v: string) => {
    const val = Number(v) || 0;
    if (axis === 'x' && val === (a.offsetX || 0)) return;
    if (axis === 'y' && val === (a.offsetY || 0)) return;
    try {
      await api.put(`/signature-assets/${a.id}`, {
        width: a.width,
        offsetX: axis === 'x' ? val : (a.offsetX || 0),
        offsetY: axis === 'y' ? val : (a.offsetY || 0),
        sortOrder: a.sortOrder,
        isActive: a.isActive,
      });
      await reloadAssets();
    } catch { /* yoksay */ }
  };

  const buildDoc = async (flds: SigFields): Promise<string> => {
    const img =
      format === 'compact'
        ? await renderCompactPng(flds)
        : await renderPersonnelPng(flds);
    const inner =
      format === 'compact'
        ? buildCompactHtml(flds, img)
        : buildSignatureHtml(flds, img, assetOverrides(assets, flds.company));
    const embedded = await embedImages(inner);
    return `<html>\n<head>\n<meta charset="utf-8">\n<title>Imza</title>\n</head>\n<body style="margin:0;padding:0;">\n${embedded}\n</body>\n</html>`;
  };

  const toggleBulk = (id: number) =>
    setBulkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const allBulkSelected =
    personnel.length > 0 && bulkIds.length === personnel.length;
  const toggleAllBulk = () =>
    setBulkIds(allBulkSelected ? [] : personnel.map((p) => p.id));

  const handleBulk = async () => {
    if (bulkIds.length === 0) return;
    setBulkBusy(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const id of bulkIds) {
        const p = personnel.find((x) => x.id === id);
        if (!p) continue;
        const flds = fieldsForPersonnel(p);
        const doc = await buildDoc(flds);
        const safe = (flds.fullName || 'imza').replace(/[^\p{L}\p{N}]+/gu, '_');
        zip.file(`${PRESETS[flds.company].label}_${safe}.htm`, doc);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imzalar_${format === 'compact' ? 'kisa' : 'tam'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Toplu üretim hatası:', e);
      alert('Toplu üretim sırasında hata oluştu. Konsolu kontrol edin.');
    } finally {
      setBulkBusy(false);
    }
  };

  const field = (
    label: string,
    key: keyof SigFields,
    opts: { textarea?: boolean; col?: string; format?: (v: string) => string } = {},
  ) => (
    <div className={`${opts.col ?? 'col-md-6'} mb-2`}>
      <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </label>
      {opts.textarea ? (
        <textarea
          className="form-control"
          rows={2}
          value={fields[key] as string}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          className="form-control"
          value={fields[key] as string}
          onChange={(e) => set(key, e.target.value)}
          onBlur={
            opts.format
              ? (e) => set(key, opts.format!(e.target.value))
              : undefined
          }
        />
      )}
    </div>
  );

  return (
    <>
      <Header title="Mail İmzaları" subtitle="Mail İmza Oluşturma ve Düzenleme" />
      <div className="main-content">
      <div className="row g-4">
        {/* ÜST: Düzenleme paneli */}
        <div className="col-12 mb-4">
          <div className="card p-3">
            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                PERSONEL SEÇ (alanları otomatik doldurur)
              </label>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => onSelectPersonnel(e.target.value)}
              >
                <option value="">Personel seçiniz…</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                    {p.companyName ? ` — ${p.companyName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, fontWeight: 600 }}>
                İMZA FORMATI
              </label>
              <div className="btn-group w-100">
                {([['full', 'Tam İmza'], ['compact', 'Kısa İmza']] as [
                  'full' | 'compact',
                  string,
                ][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    className={`btn btn-sm ${format === val ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFormat(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => setFieldsOpen((o) => !o)}>
                {fieldsOpen ? '▼' : '▶'} {rawMode ? 'HAM HTML' : 'ALANLAR'}
              </strong>
              {rawMode ? (
                <button className="btn btn-sm btn-outline-secondary" onClick={backToForm}>
                  ← Forma dön
                </button>
              ) : (
                <button className="btn btn-sm btn-outline-secondary" onClick={enterRawMode}>
                  Ham HTML düzenle
                </button>
              )}
            </div>

            {fieldsOpen && (rawMode ? (
              <textarea
                className="form-control"
                style={{ fontFamily: 'monospace', fontSize: 12, minHeight: 360 }}
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
              />
            ) : (
              <div className="row g-2">
                {field('Selamlama', 'greeting', { col: 'col-12' })}
                {field('Ad Soyad', 'fullName')}
                {field('Unvan', 'title')}
                {field('İngilizce Unvan', 'englishTitle')}
                {field('Şehir / Lokasyon', 'city')}
                {field('Firma Adı (metin)', 'companyName', { textarea: true, col: 'col-12' })}
                {field('Adres Satır 1', 'addressLine1', { textarea: true, col: 'col-12' })}
                {field('Adres Satır 2', 'addressLine2', { textarea: true, col: 'col-12' })}
                {field('Sabit Telefon', 'phone', { format: formatTrPhone })}
                {field('Cep Telefonu', 'mobile', { format: formatTrPhone })}
                {field('Web Sitesi', 'website')}
              </div>
            ))}

            <div className="d-flex gap-2 mt-3">
              <button
                className={`btn ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Kopyalandı' : '📋 Panoya kopyala'}
              </button>
              <button
                className="btn btn-success"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'İndiriliyor…' : '⬇️ .htm olarak indir'}
              </button>
            </div>
          </div>
        </div>

        {/* İmza görselleri yönetimi */}
        <div className="col-12 mb-4">
          <div className="card p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setAssetsOpen((o) => !o)}
            >
              <strong style={{ fontSize: 13 }}>
                {assetsOpen ? '▼' : '▶'} 🖼️ İMZA GÖRSELLERİ (Logo & Banner)
              </strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Firmaya özel · yükle / sil / aktif
              </span>
            </div>
            {assetsOpen && (
              <div className="mt-3">
                <div className="btn-group btn-group-sm w-100 mb-3">
                  {(['lokum', 'ogas'] as CompanyKey[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn-sm ${assetCompany === c ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setAssetCompany(c)}
                    >
                      {PRESETS[c].label}
                    </button>
                  ))}
                </div>

                {([['logo', 'LOGO'], ['banner', "BANNER'LAR"], ['efatura', 'E-FATURA']] as [string, string][]).map(
                  ([kind, label]) => {
                    const list = assets.filter(
                      (a) => a.company === assetCompany && a.kind === kind,
                    );
                    return (
                      <div key={kind} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong style={{ fontSize: 12 }}>{label}</strong>
                          <label className="btn btn-sm btn-outline-success mb-0" style={{ cursor: 'pointer' }}>
                            {uploadingKind === kind ? 'Yükleniyor…' : '+ Görsel Yükle'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                handleUpload(kind, e.target.files?.[0]);
                                e.currentTarget.value = '';
                              }}
                            />
                          </label>
                        </div>
                        {list.length === 0 ? (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Görsel yok — varsayılan kullanılır.
                          </div>
                        ) : (
                          <div className="d-flex flex-wrap gap-2">
                            {list.map((a, idx) => (
                              <div
                                key={a.id}
                                style={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: 6,
                                  padding: 6,
                                  width: 150,
                                  background: a.isActive ? '#fff' : '#f8f8f8',
                                }}
                              >
                                <div
                                  style={{
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    opacity: a.isActive ? 1 : 0.4,
                                  }}
                                >
                                  <img src={a.url} alt={a.originalName} style={{ maxWidth: '100%', maxHeight: 44 }} />
                                </div>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  <button
                                    className="action-btn"
                                    style={{ background: '#eef2ff', color: '#4338ca', fontSize: 11, opacity: idx === 0 ? 0.4 : 1 }}
                                    title="Yukarı taşı" disabled={idx === 0}
                                    onClick={() => moveAsset(list, idx, -1)}
                                  >▲</button>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#eef2ff', color: '#4338ca', fontSize: 11, opacity: idx === list.length - 1 ? 0.4 : 1 }}
                                    title="Aşağı taşı" disabled={idx === list.length - 1}
                                    onClick={() => moveAsset(list, idx, 1)}
                                  >▼</button>
                                  <button
                                    className="action-btn"
                                    style={{ background: a.isActive ? '#dcfce7' : '#fef9c3', color: a.isActive ? 'var(--success)' : '#a16207', fontSize: 12 }}
                                    title={a.isActive ? 'Pasife al' : 'Aktif et'}
                                    onClick={() => toggleAsset(a)}
                                  >
                                    {a.isActive ? '✓' : '⛔'}
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#fee2e2', color: 'var(--danger)', fontSize: 12 }}
                                    title="Sil"
                                    onClick={() => deleteAsset(a.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gen.</span>
                                  <input
                                    type="number"
                                    defaultValue={a.width}
                                    className="form-control form-control-sm"
                                    style={{ fontSize: 11, padding: '1px 4px', height: 24, width: 70 }}
                                    onBlur={(e) => changeAssetWidth(a, e.target.value)}
                                  />
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>px</span>
                                </div>
                                <div className="d-flex align-items-center gap-1 mt-1" title="İmzada konum kaydırma (px)">
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>↔</span>
                                  <input
                                    type="number"
                                    defaultValue={a.offsetX || 0}
                                    className="form-control form-control-sm"
                                    style={{ fontSize: 11, padding: '1px 4px', height: 24, width: 54 }}
                                    title="Yatay kaydır (+sağ / -sol)"
                                    onBlur={(e) => changeAssetOffset(a, 'x', e.target.value)}
                                  />
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>↕</span>
                                  <input
                                    type="number"
                                    defaultValue={a.offsetY || 0}
                                    className="form-control form-control-sm"
                                    style={{ fontSize: 11, padding: '1px 4px', height: 24, width: 54 }}
                                    title="Dikey kaydır (+aşağı / -yukarı)"
                                    onBlur={(e) => changeAssetOffset(a, 'y', e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Not: Aktif görseller imzalarda kullanılır. Hiç görsel yoksa yerleşik varsayılanlar geçerlidir.
                  Banner sırası yükleme sırasına göredir.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toplu üretim */}
        <div className="col-12 mb-4">
          <div className="card p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => setBulkOpen((o) => !o)}
            >
              <strong style={{ fontSize: 13 }}>
                {bulkOpen ? '▼' : '▶'} 👥 TOPLU İMZA ÜRETİMİ
                {bulkIds.length > 0 ? ` — ${bulkIds.length} seçili` : ''}
              </strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Format: {format === 'compact' ? 'Kısa' : 'Tam'}
              </span>
            </div>
            {bulkOpen && (
              <div className="mt-3">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="bulk-all"
                checked={allBulkSelected}
                onChange={toggleAllBulk}
              />
              <label
                className="form-check-label"
                htmlFor="bulk-all"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                Tümünü seç ({bulkIds.length}/{personnel.length})
              </label>
            </div>
            <div
              style={{
                maxHeight: 220,
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: 8,
              }}
            >
              {personnel.map((p) => (
                <div className="form-check" key={p.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`bulk-${p.id}`}
                    checked={bulkIds.includes(p.id)}
                    onChange={() => toggleBulk(p.id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`bulk-${p.id}`}
                    style={{ fontSize: 12 }}
                  >
                    {p.firstName} {p.lastName}
                    {p.companyName ? ` — ${p.companyName}` : ''}
                  </label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={handleBulk}
              disabled={bulkBusy || bulkIds.length === 0}
            >
              {bulkBusy
                ? 'Üretiliyor…'
                : `⬇️ Seçilenleri ZIP indir (${bulkIds.length})`}
            </button>
              </div>
            )}
          </div>
        </div>

        {/* ALT: Canlı önizleme */}
        <div className="col-12">
          <div className="card p-3">
            <h5 className="mb-3">Canlı Önizleme</h5>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: 16,
                background: '#ffffff',
                overflowX: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
