import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import FilterableTable from '../components/common/FilterableTable';
import api from '../services/api';
import type { MailSettings, MailLog, Personnel, BirthdaySummary } from '../types';

export default function MailSettingsPage() {
  const [settings, setSettings] = useState<MailSettings | null>(null);
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [birthdaySummary, setBirthdaySummary] = useState<BirthdaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    smtpHost: '', port: 587, fromEmail: '', password: '',
    useSsl: true, sendTime: '13:18', birthdayMailTemplate: '', birthdayMailSubject: '',
    adminNotificationEmail: ''
  });

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBirthdays, setSendingBirthdays] = useState(false);

  const [customMail, setCustomMail] = useState({ personnelId: 0, subject: '', body: '' });
  const [sendingCustom, setSendingCustom] = useState(false);

  const load = async () => {
    try {
      const [sRes, lRes, pRes, bRes] = await Promise.all([
        api.get<MailSettings>('/mail/settings').catch(() => ({ data: null })),
        api.get<MailLog[]>('/mail/logs').catch(() => ({ data: [] })),
        api.get<Personnel[]>('/personnel').catch(() => ({ data: [] })),
        api.get<BirthdaySummary>('/mail/birthday-summary').catch(() => ({ data: null })),
      ]);
      if (sRes.data) {
        setSettings(sRes.data);
        setForm({
          smtpHost: sRes.data.smtpHost,
          port: sRes.data.port,
          fromEmail: sRes.data.fromEmail,
          password: sRes.data.password,
          useSsl: sRes.data.useSsl,
          sendTime: sRes.data.sendTime,
          birthdayMailTemplate: sRes.data.birthdayMailTemplate,
          birthdayMailSubject: sRes.data.birthdayMailSubject,
          adminNotificationEmail: sRes.data.adminNotificationEmail ?? '',
        });
      }
      setLogs(lRes.data ?? []);
      setPersonnel(pRes.data ?? []);
      setBirthdaySummary(bRes.data);
    } catch { setError('VERİLER YÜKLENEMEDİ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/mail/settings', form);
      setSuccess('MAİL AYARLARI KAYDEDİLDİ.');
      await load();
    } catch { setError('AYARLAR KAYDEDİLEMEDİ.'); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) { setError('ALICI E-POSTA GEREKLİDİR.'); return; }
    setSendingTest(true);
    try {
      const r = await api.post<{ success: boolean; message: string }>('/mail/test', { toEmail: testEmail });
      if (r.data.success) setSuccess('TEST MAİLİ BAŞARIYLA GÖNDERİLDİ.');
      else setError('TEST MAİLİ GÖNDERİLEMEDİ. AYARLARI KONTROL EDİN.');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'TEST MAİLİ GÖNDERİLEMEDİ.');
    } finally { setSendingTest(false); }
  };

  const sendBirthdays = async () => {
    setSendingBirthdays(true);
    try {
      await api.post('/mail/send-birthdays-now');
      setSuccess('DOĞUM GÜNÜ MAİLLERİ GÖNDERİLDİ.');
      await load();
    } catch { setError('DOĞUM GÜNÜ MAİLLERİ GÖNDERİLEMEDİ.'); }
    finally { setSendingBirthdays(false); }
  };

  const sendCustom = async () => {
    if (!customMail.personnelId || !customMail.subject.trim()) {
      setError('PERSONEL VE KONU ZORUNLUDUR.');
      return;
    }
    setSendingCustom(true);
    try {
      const r = await api.post<{ success: boolean }>('/mail/send-custom', customMail);
      if (r.data.success) {
        setSuccess('MAİL BAŞARIYLA GÖNDERİLDİ.');
        setCustomMail({ personnelId: 0, subject: '', body: '' });
      } else {
        setError('MAİL GÖNDERİLEMEDİ.');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'MAİL GÖNDERİLEMEDİ.');
    } finally { setSendingCustom(false); }
  };

  const downloadLogs = async () => {
    try {
      const r = await api.get('/mail/logs/export', { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mail_loglari.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 150);
    } catch { setError('EXCEL İNDİRİLEMEDİ.'); }
  };

  if (loading) return <><Header title="Mail Ayarları" /><Loader /></>;

  const hasBirthdaySummary = birthdaySummary && birthdaySummary.totalCount > 0;

  return (
    <>
      <Header title="Mail Ayarları" subtitle="SMTP ve Doğum Günü Mail Yapılandırması" />
      <div className="main-content">
        {error && (
          <div className="alert alert-danger alert-dismissible py-2" style={{ fontSize: 12 }}>
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible py-2" style={{ fontSize: 12 }}>
            {success}
            <button className="btn-close" onClick={() => setSuccess('')} />
          </div>
        )}

        {/* Doğum Günü Gönderim Özeti */}
        <div className="form-card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              🎂 BUGÜNKÜ DOĞUM GÜNÜ MAİL ÖZETI
              {birthdaySummary?.date && (
                <span className="ms-2 badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 10, fontWeight: 600 }}>
                  {new Date(birthdaySummary.date).toLocaleDateString('tr-TR')}
                </span>
              )}
            </h6>
            <button className="btn btn-outline-secondary btn-sm" onClick={load} style={{ fontSize: 11 }}>
              🔄 YENİLE
            </button>
          </div>

          {!hasBirthdaySummary ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
              Bugün henüz doğum günü maili gönderilmedi.
            </div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <div className="col-auto">
                  <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-dark)' }}>{birthdaySummary.totalCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>TOPLAM</div>
                  </div>
                </div>
                <div className="col-auto">
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{birthdaySummary.successCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>BAŞARILI</div>
                  </div>
                </div>
                <div className="col-auto">
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{birthdaySummary.failCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>BAŞARISIZ</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-light)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <table className="table table-sm mb-0" style={{ fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ fontSize: 11, padding: '8px 12px' }}>PERSONEL</th>
                      <th style={{ fontSize: 11, padding: '8px 12px' }}>E-POSTA</th>
                      <th style={{ fontSize: 11, padding: '8px 12px', textAlign: 'center' }}>DURUM</th>
                      <th style={{ fontSize: 11, padding: '8px 12px' }}>GÖNDERIM SAATİ</th>
                      <th style={{ fontSize: 11, padding: '8px 12px' }}>HATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birthdaySummary.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.personnelName}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{item.email}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span className={`badge ${item.isSuccess ? 'badge-kayitli' : 'bg-danger'}`} style={{ fontSize: 10 }}>
                            {item.isSuccess ? 'BAŞARILI' : 'BAŞARISIZ'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 11 }}>
                          {new Date(item.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--danger)' }}>{item.errorMessage ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="form-card">
              <h6 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>
                ✉️ SMTP AYARLARI
              </h6>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">SMTP SUNUCU</label>
                  <input className="form-control" value={form.smtpHost}
                    onChange={e => setForm(p => ({ ...p, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com" autoComplete="off" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">PORT</label>
                  <input type="number" className="form-control" value={form.port}
                    onChange={e => setForm(p => ({ ...p, port: Number(e.target.value) }))} />
                </div>
                <div className="col-12">
                  <label className="form-label">GÖNDEREN E-POSTA</label>
                  <input type="email" className="form-control" value={form.fromEmail}
                    onChange={e => setForm(p => ({ ...p, fromEmail: e.target.value }))}
                    autoComplete="off" placeholder="noreply@firma.com" />
                </div>
                <div className="col-12">
                  <label className="form-label">ŞİFRE / APP PASSWORD</label>
                  <input type="password" className="form-control" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    autoComplete="new-password" placeholder="GMAIL UYGULAMA ŞİFRESİ" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">GÖNDERME ZAMANI</label>
                  <input type="time" className="form-control" value={form.sendTime}
                    onChange={e => setForm(p => ({ ...p, sendTime: e.target.value }))} />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="useSsl"
                      checked={form.useSsl}
                      onChange={e => setForm(p => ({ ...p, useSsl: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="useSsl">SSL AKTİF</label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">
                    YÖNETİCİ BİLDİRİM E-POSTASI
                    <span className="ms-2 badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: 10 }}>
                      DOĞUM GÜNÜ RAPORU BURAYA GÖNDERİLİR
                    </span>
                  </label>
                  <input type="email" className="form-control" value={form.adminNotificationEmail}
                    onChange={e => setForm(p => ({ ...p, adminNotificationEmail: e.target.value }))}
                    autoComplete="off" placeholder="yonetici@firma.com" />
                </div>
                <div className="col-12">
                  <label className="form-label">DOĞUM GÜNÜ MAİL KONUSU</label>
                  <input className="form-control" value={form.birthdayMailSubject}
                    onChange={e => setForm(p => ({ ...p, birthdayMailSubject: e.target.value }))}
                    autoComplete="off" />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    DOĞUM GÜNÜ MAİL ŞABLONU
                    <span className="ms-2 badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 10 }}>
                      {'{PersonelAdSoyad}'} {'{PersonelAd}'} {'{PersonelFirma}'}
                    </span>
                  </label>
                  <textarea className="form-control" rows={6} value={form.birthdayMailTemplate}
                    onChange={e => setForm(p => ({ ...p, birthdayMailTemplate: e.target.value }))}
                    autoComplete="off" />
                  <div className="mt-2" style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '8px 12px', borderRadius: 6 }}>
                    Görsel otomatik olarak mailin sonuna eklenir. Şablona &lt;img&gt; etiketi veya görsel eklemeyin.
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  KAYDET
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="form-card mb-3">
              <h6 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                🧪 TEST MAİLİ
              </h6>
              <div className="mb-3">
                <label className="form-label">TEST ALICI</label>
                <input type="email" className="form-control" value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="test@email.com" autoComplete="off" />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-warning btn-sm flex-grow-1" onClick={sendTest} disabled={sendingTest}>
                  {sendingTest ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  TEST MAİLİ GÖNDER
                </button>
                <button className="btn btn-success btn-sm flex-grow-1" onClick={sendBirthdays} disabled={sendingBirthdays}>
                  {sendingBirthdays ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  ŞİMDİ GÖNDER
                </button>
              </div>
              <div className="mt-2" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                "ŞİMDİ GÖNDER": BUGÜN DOĞUM GÜNÜ OLAN TÜM PERSONELE HEMEN MAİL ATAR.
              </div>
            </div>

            <div className="form-card">
              <h6 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                📩 PERSONELE ÖZEL MAİL
              </h6>
              <div className="mb-3">
                <label className="form-label">PERSONEL</label>
                <select className="form-select" value={customMail.personnelId}
                  onChange={e => setCustomMail(p => ({ ...p, personnelId: Number(e.target.value) }))}>
                  <option value={0}>PERSONEL SEÇİN</option>
                  {personnel.filter(p => p.email).map(p => (
                    <option key={p.id} value={p.id}>
                      {`${p.firstName} ${p.lastName}`.toUpperCase()} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">KONU</label>
                <input className="form-control" value={customMail.subject}
                  onChange={e => setCustomMail(p => ({ ...p, subject: e.target.value }))}
                  autoComplete="off" />
              </div>
              <div className="mb-3">
                <label className="form-label">MESAJ</label>
                <textarea className="form-control" rows={4} value={customMail.body}
                  onChange={e => setCustomMail(p => ({ ...p, body: e.target.value }))}
                  autoComplete="off" />
              </div>
              <button className="btn btn-primary btn-sm w-100" onClick={sendCustom} disabled={sendingCustom}>
                {sendingCustom ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                MAİL GÖNDER
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="page-header">
            <h5 className="page-title">MAİL LOGLARI</h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={downloadLogs}>
              📥 EXCEL İNDİR
            </button>
          </div>
          <div className="table-container">
            <FilterableTable
              columns={[
                { key: 'sentAt', label: 'TARİH', filterable: false },
                { key: 'recipientEmail', label: 'ALICI', filterable: true },
                { key: 'subject', label: 'KONU', filterable: true },
                { key: 'mailTypeLabel', label: 'TİP', filterable: true },
                { key: 'isSuccess', label: 'DURUM', filterable: false },
                { key: 'errorMessage', label: 'HATA', filterable: false },
              ]}
              data={logs as unknown as Record<string, unknown>[]}
              renderRow={(row) => {
                const log = row as unknown as MailLog;
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: 11 }}>{new Date(log.sentAt).toLocaleString('tr-TR')}</td>
                    <td style={{ fontSize: 12 }}>{log.recipientEmail}</td>
                    <td style={{ fontSize: 12 }}>{log.subject}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 10 }}>
                        {log.mailTypeLabel.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.isSuccess ? 'badge-kayitli' : 'bg-danger'}`} style={{ fontSize: 10 }}>
                        {log.isSuccess ? 'BAŞARILI' : 'BAŞARISIZ'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--danger)' }}>{log.errorMessage ?? ''}</td>
                  </tr>
                );
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
