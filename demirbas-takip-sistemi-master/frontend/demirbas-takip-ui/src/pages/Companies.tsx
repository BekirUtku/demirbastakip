import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import FilterableTable from '../components/common/FilterableTable';
import api from '../services/api';
import type { Company } from '../types';

interface CompanyForm {
  name: string;
  companyName: string;
  address: string;
  mailAddress: string;
  isActive: boolean;
}

const emptyForm: CompanyForm = { name: '', companyName: '', address: '', mailAddress: '', isActive: true };

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get<(Company & { personnelCount: number })[]>('/companies');
      setCompanies(res.data ?? []);
    } catch { setError('FİRMALAR YÜKLENEMEDİ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Company & { personnelCount?: number }) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      companyName: c.companyName,
      address: c.address ?? '',
      mailAddress: c.mailAddress ?? '',
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.companyName.trim()) {
      setError('FİRMA ADI ZORUNLUDUR.');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/companies/${editId}`, form);
        setSuccess('FİRMA BAŞARIYLA GÜNCELLENDİ.');
      } else {
        await api.post('/companies', form);
        setSuccess('FİRMA BAŞARIYLA OLUŞTURULDU.');
      }
      setShowModal(false);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'İŞLEM GERÇEKLEŞTİRİLEMEDİ.');
    } finally { setSaving(false); }
  };

  if (loading) return <><Header title="Firmalar" /><Loader /></>;

  const activeCount = companies.filter(c => c.isActive).length;

  return (
    <>
      <Header title="Firmalar" subtitle="Firma Yönetimi" />
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
              <div className="stat-icon" style={{ background: '#f0f9ff20' }}><span>🏢</span></div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{companies.length}</div>
              <div className="stat-label">TOPLAM FİRMA</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f0fdf420' }}><span>✅</span></div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{activeCount}</div>
              <div className="stat-label">AKTİF FİRMA</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e220' }}><span>⛔</span></div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{companies.length - activeCount}</div>
              <div className="stat-label">PASİF FİRMA</div>
            </div>
          </div>
        </div>

        <div className="page-header">
          <h5 className="page-title">FİRMALAR ({companies.length})</h5>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ YENİ FİRMA</button>
        </div>

        <div className="table-container">
          <FilterableTable
            columns={[
              { key: 'companyName', label: 'FİRMA ADI', filterable: true },
              { key: 'name', label: 'KISA AD', filterable: true },
              { key: 'address', label: 'ADRES', filterable: true },
              { key: 'mailAddress', label: 'MAİL ADRESİ', filterable: true },
              { key: 'personnelCount', label: 'AKTİF PERSONEL', filterable: false },
              { key: 'status', label: 'DURUM', filterable: false },
              { key: 'actions', label: 'İŞLEM', filterable: false, width: '80px' },
            ]}
            data={companies as unknown as Record<string, unknown>[]}
            renderRow={(row) => {
              const c = row as unknown as Company & { personnelCount?: number };
              return (
                <tr key={c.id} style={!c.isActive ? { background: '#fff5f5' } : undefined}>
                  <td style={{ fontWeight: 700, fontSize: 12 }}>{c.companyName.toUpperCase()}</td>
                  <td style={{ fontSize: 12 }}>{c.name.toUpperCase()}</td>
                  <td style={{ fontSize: 12 }}>{c.address || '-'}</td>
                  <td style={{ fontSize: 12 }}>{c.mailAddress || '-'}</td>
                  <td style={{ fontSize: 12, textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{(c as { personnelCount?: number }).personnelCount ?? 0}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-aktif' : 'badge-iade'}`} style={{ fontSize: 10 }}>
                      {c.isActive ? 'AKTİF' : 'PASİF'}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" style={{ background: '#eff6ff', color: 'var(--primary)' }}
                      title="DÜZENLE" onClick={() => openEdit(c)}>
                      ✏️
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'FİRMAYI DÜZENLE' : 'YENİ FİRMA EKLE'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">FİRMA ADI (TAM) *</label>
              <input className="form-control" value={form.companyName}
                onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                placeholder="OGAŞ ŞEKERLEME A.Ş." autoComplete="off" />
            </div>
            <div className="mb-3">
              <label className="form-label">KISA AD *</label>
              <input className="form-control" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="OGAŞ" autoComplete="off" />
            </div>
            <div className="mb-3">
              <label className="form-label">ADRES</label>
              <input className="form-control" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Şirket adresi (opsiyonel)" autoComplete="off" />
            </div>
            <div className="mb-3">
              <label className="form-label">MAİL ADRESİ</label>
              <input className="form-control" type="email" value={form.mailAddress}
                onChange={e => setForm(p => ({ ...p, mailAddress: e.target.value }))}
                placeholder="info@firma.com (opsiyonel)" autoComplete="off" />
            </div>
            {editId && (
              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="isActiveCheck"
                    checked={form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="isActiveCheck">AKTİF</label>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>İPTAL</Button>
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {editId ? 'GÜNCELLE' : 'EKLE'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
