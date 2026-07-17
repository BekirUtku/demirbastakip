import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../services/api';
import type { Category, CategoryQuestion } from '../types';
import { AnswerType } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [newQuestions, setNewQuestions] = useState<Record<number, { text: string; type: AnswerType; required: boolean }>>({});

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number; type: 'category' | 'question' }>({
    show: false, id: 0, type: 'category'
  });

  const load = async () => {
    try {
      const r = await api.get<Category[]>('/categories');
      setCategories(r.data);
    } catch {
      setError('KATEGORİLER YÜKLENEMEDİ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      await api.post('/categories', { name: newCatName.trim(), description: newCatDesc.trim() });
      setNewCatName(''); setNewCatDesc('');
      setShowAddCategory(false);
      await load();
    } catch { setError('KATEGORİ EKLENEMEDİ.'); }
    finally { setSavingCat(false); }
  };

  const updateCategory = async () => {
    if (!editCategory || !editName.trim()) return;
    try {
      await api.put(`/categories/${editCategory.id}`, { name: editName.trim(), description: editDesc.trim(), isActive: editCategory.isActive });
      setEditCategory(null);
      await load();
    } catch { setError('KATEGORİ GÜNCELLENEMEDİ.'); }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      setDeleteConfirm({ show: false, id: 0, type: 'category' });
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'KATEGORİ SİLİNEMEDİ.');
      setDeleteConfirm({ show: false, id: 0, type: 'category' });
    }
  };

  const addQuestion = async (categoryId: number) => {
    const q = newQuestions[categoryId];
    if (!q?.text?.trim()) return;
    try {
      await api.post(`/categories/${categoryId}/questions`, {
        questionText: q.text.trim(),
        answerType: q.type,
        isRequired: q.required,
        displayOrder: 0
      });
      setNewQuestions(prev => ({ ...prev, [categoryId]: { text: '', type: AnswerType.Text, required: false } }));
      await load();
    } catch { setError('SORU EKLENEMEDİ.'); }
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      await api.delete(`/categories/questions/${questionId}`);
      setDeleteConfirm({ show: false, id: 0, type: 'question' });
      await load();
    } catch { setError('SORU SİLİNEMEDİ.'); }
  };

  if (loading) return <><Header title="Kategoriler" /><Loader /></>;

  return (
    <>
      <Header title="Kategoriler" subtitle="Demirbaş Kategori Yönetimi" />
      <div className="main-content">
        {error && (
          <div className="alert alert-danger alert-dismissible py-2" style={{ fontSize: 12 }}>
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="page-header">
          <h5 className="page-title">KATEGORİ LİSTESİ</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddCategory(true)}>
            + YENİ KATEGORİ
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="form-card text-center text-muted py-5">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>HENÜ KATEGORİ YOK</div>
          </div>
        ) : (
          <div className="row g-3">
            {categories.map(cat => (
              <div key={cat.id} className="col-12">
                <div className="form-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{cat.name.toUpperCase()}</h6>
                      {cat.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {cat.description}
                        </div>
                      )}
                      <span className="badge mt-1" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 10 }}>
                        {cat.assetCount} DEMİRBAŞ
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="action-btn" style={{ background: '#dbeafe', color: 'var(--info)' }}
                        title="DÜZENLE"
                        onClick={() => { setEditCategory(cat); setEditName(cat.name); setEditDesc(cat.description ?? ''); }}>
                        ✏️
                      </button>
                      <button className="action-btn" style={{ background: '#fee2e2', color: 'var(--danger)' }}
                        title="SİL"
                        onClick={() => setDeleteConfirm({ show: true, id: cat.id, type: 'category' })}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SORULAR
                  </div>

                  {cat.questions.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>HENÜ SORU YOK</div>
                  ) : (
                    <div className="table-responsive mb-3">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>SORU</th>
                            <th>TİP</th>
                            <th>ZORUNLU</th>
                            <th>İŞLEM</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.questions.map((q: CategoryQuestion) => (
                            <tr key={q.id}>
                              <td style={{ fontSize: 12 }}>{q.questionText.toUpperCase()}</td>
                              <td>
                                <span className="badge" style={{ background: '#f0fdf9', color: 'var(--primary-dark)', fontSize: 10 }}>
                                  {q.answerTypeLabel.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${q.isRequired ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: 10 }}>
                                  {q.isRequired ? 'ZORUNLU' : 'OPSİYONEL'}
                                </span>
                              </td>
                              <td>
                                <button className="action-btn" style={{ background: '#fee2e2', color: 'var(--danger)' }}
                                  onClick={() => setDeleteConfirm({ show: true, id: q.id, type: 'question' })}>
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ maxWidth: 250 }}
                      placeholder="SORU METNİ"
                      value={newQuestions[cat.id]?.text ?? ''}
                      onChange={e => setNewQuestions(prev => ({
                        ...prev,
                        [cat.id]: { ...prev[cat.id], text: e.target.value, type: prev[cat.id]?.type ?? AnswerType.Text, required: prev[cat.id]?.required ?? false }
                      }))}
                      autoComplete="off"
                    />
                    <select
                      className="form-select form-select-sm"
                      style={{ maxWidth: 140 }}
                      value={newQuestions[cat.id]?.type ?? AnswerType.Text}
                      onChange={e => setNewQuestions(prev => ({
                        ...prev,
                        [cat.id]: { ...prev[cat.id] ?? { text: '', required: false }, type: Number(e.target.value) as AnswerType }
                      }))}
                    >
                      <option value={AnswerType.Text}>METİN</option>
                      <option value={AnswerType.Number}>SAYI</option>
                      <option value={AnswerType.YesNo}>EVET/HAYIR</option>
                    </select>
                    <div className="form-check mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`req-${cat.id}`}
                        checked={newQuestions[cat.id]?.required ?? false}
                        onChange={e => setNewQuestions(prev => ({
                          ...prev,
                          [cat.id]: { ...prev[cat.id] ?? { text: '', type: AnswerType.Text }, required: e.target.checked }
                        }))}
                      />
                      <label className="form-check-label" htmlFor={`req-${cat.id}`} style={{ fontSize: 11 }}>ZORUNLU</label>
                    </div>
                    <button className="btn btn-success btn-sm"
                      onClick={() => addQuestion(cat.id)}
                      disabled={!newQuestions[cat.id]?.text?.trim()}>
                      + SORU EKLE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Category Modal */}
        <Modal show={showAddCategory} onHide={() => setShowAddCategory(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>YENİ KATEGORİ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">KATEGORİ ADI *</label>
              <input className="form-control" value={newCatName}
                onChange={e => setNewCatName(e.target.value)} autoComplete="off" placeholder="KATEGORİ ADI" />
            </div>
            <div className="mb-3">
              <label className="form-label">AÇIKLAMA</label>
              <input className="form-control" value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)} autoComplete="off" placeholder="AÇIKLAMA" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddCategory(false)}>İPTAL</Button>
            <Button variant="primary" onClick={addCategory} disabled={savingCat || !newCatName.trim()}>
              {savingCat ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              KAYDET
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Category Modal */}
        <Modal show={!!editCategory} onHide={() => setEditCategory(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>KATEGORİ DÜZENLE</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">KATEGORİ ADI *</label>
              <input className="form-control" value={editName}
                onChange={e => setEditName(e.target.value)} autoComplete="off" />
            </div>
            <div className="mb-3">
              <label className="form-label">AÇIKLAMA</label>
              <input className="form-control" value={editDesc}
                onChange={e => setEditDesc(e.target.value)} autoComplete="off" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditCategory(null)}>İPTAL</Button>
            <Button variant="primary" onClick={updateCategory} disabled={!editName.trim()}>KAYDET</Button>
          </Modal.Footer>
        </Modal>

        <ConfirmModal
          show={deleteConfirm.show}
          title={deleteConfirm.type === 'category' ? 'KATEGORİ SİL' : 'SORU SİL'}
          message={deleteConfirm.type === 'category'
            ? 'BU KATEGORİYİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ? KATEGORİYE AİT TÜM SORULAR SİLİNECEKTİR.'
            : 'BU SORUYU SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?'}
          onConfirm={() => deleteConfirm.type === 'category' ? deleteCategory(deleteConfirm.id) : deleteQuestion(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm({ show: false, id: 0, type: 'category' })}
          confirmText="SİL"
        />
      </div>
    </>
  );
}
