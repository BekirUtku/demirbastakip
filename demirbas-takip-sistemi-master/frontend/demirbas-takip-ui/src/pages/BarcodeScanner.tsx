import { useEffect, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import api from '../services/api';
import { AssetStatus } from '../types';
import type { Asset } from '../types';

interface ScanHistoryItem {
  barcode: string;
  asset: Asset | null;
  scannedAt: Date;
}

const STATUS_STYLE: Record<AssetStatus, { label: string; bg: string; color: string }> = {
  [AssetStatus.Kayitli]: { label: 'KAYITLI', bg: '#f0fdf4', color: '#10b981' },
  [AssetStatus.Zimmetli]: { label: 'ZİMMETLİ', bg: '#fef9c3', color: '#d97706' },
  [AssetStatus.Pasif]: { label: 'PASİF', bg: '#f1f5f9', color: '#94a3b8' },
};

export default function BarcodeScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<Asset | null | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async (barcode: string) => {
    const trimmed = barcode.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setNotFound(false);
    setResult(undefined);

    try {
      const res = await api.get<Asset>(`/assets/barcode/${encodeURIComponent(trimmed)}`);
      setResult(res.data);
      setHistory(prev => [{ barcode: trimmed, asset: res.data, scannedAt: new Date() }, ...prev.slice(0, 9)]);
    } catch {
      setResult(null);
      setNotFound(true);
      setHistory(prev => [{ barcode: trimmed, asset: null, scannedAt: new Date() }, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleScan(inputValue);
  };

  const activeAssignment = result?.assignmentHistory.find(a => a.status === 'Aktif');
  const statusStyle = result ? STATUS_STYLE[result.status] : null;

  return (
    <>
      <Header title="Barkod Okutma" subtitle="Demirbaş Sorgulama" />
      <div className="main-content">

        {/* Barkod okutma alanı */}
        <div className="form-card mb-4">
          <div className="d-flex align-items-center gap-3 mb-2">
            <span style={{ fontSize: 28 }}>📷</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>Barkod Okut veya Gir</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Barkod okuyucuyu kullanın ya da barkodu yazıp Enter'a basın
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <input
              ref={inputRef}
              className="form-control"
              style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.1em', maxWidth: 320 }}
              placeholder="B000001"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={() => handleScan(inputValue)}
              disabled={loading || !inputValue.trim()}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm" />
                : 'SORGULA'}
            </button>
          </div>
        </div>

        {/* Sonuç */}
        {notFound && (
          <div className="form-card mb-4" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="d-flex align-items-center gap-2" style={{ color: '#ef4444' }}>
              <span style={{ fontSize: 22 }}>❌</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>BULUNAMADI</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bu barkoda ait kayıtlı demirbaş yok.</div>
              </div>
            </div>
          </div>
        )}

        {result && statusStyle && (
          <div className="form-card mb-4" style={{ borderLeft: `4px solid ${statusStyle.color}` }}>
            {/* Başlık satırı */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
                  {result.categoryName.toUpperCase()}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{result.name.toUpperCase()}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {result.barcode}
                </div>
              </div>
              <span style={{
                background: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.color}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700
              }}>
                {statusStyle.label}
              </span>
            </div>

            {/* Temel bilgiler */}
            <div className="row g-2 mb-3">
              {result.serialNumber && (
                <div className="col-auto">
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Seri No</div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace' }}>{result.serialNumber}</div>
                </div>
              )}
              <div className="col-auto">
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kayıt Tarihi</div>
                <div style={{ fontSize: 13 }}>{new Date(result.createdAt).toLocaleDateString('tr-TR')}</div>
              </div>
              <div className="col-auto">
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kaydeden</div>
                <div style={{ fontSize: 13 }}>{result.createdByUserName}</div>
              </div>
            </div>

            {/* Zimmet bilgisi */}
            {activeAssignment && (
              <div style={{
                background: '#fef9c3',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: 4 }}>
                  📋 Aktif Zimmet
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{activeAssignment.personnelFullName.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                  Zimmet Tarihi: {new Date(activeAssignment.assignedAt).toLocaleDateString('tr-TR')}
                  {activeAssignment.notes && <span className="ms-3">Not: {activeAssignment.notes}</span>}
                </div>
              </div>
            )}

            {/* Özellikler */}
            {result.answers.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Özellikler
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {result.answers.map(a => (
                    <div key={a.categoryQuestionId} style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{a.questionText}: </span>
                      <span style={{ fontWeight: 700 }}>
                        {a.answerValue
                          ? (a.answerValue === 'true' ? 'Evet' : a.answerValue === 'false' ? 'Hayır' : a.answerValue)
                          : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Geçmiş */}
        {history.length > 0 && (
          <div className="form-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                OKUTMA GEÇMİŞİ
              </h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: 11 }}
                onClick={() => setHistory([])}
              >
                TEMİZLE
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {history.map((item, i) => {
                const s = item.asset ? STATUS_STYLE[item.asset.status] : null;
                return (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: item.asset ? '#f8fafc' : '#fef2f2',
                      border: `1px solid ${item.asset ? '#e2e8f0' : '#fecaca'}`,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (item.asset) { setResult(item.asset); setNotFound(false); }
                      else { setResult(null); setNotFound(true); }
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, minWidth: 70 }}>
                        {item.barcode}
                      </span>
                      {item.asset ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.asset.name.toUpperCase()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.asset.categoryName}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#ef4444' }}>Bulunamadı</div>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {s && (
                        <span style={{
                          background: s.bg, color: s.color,
                          border: `1px solid ${s.color}`,
                          borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700
                        }}>
                          {s.label}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {item.scannedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
