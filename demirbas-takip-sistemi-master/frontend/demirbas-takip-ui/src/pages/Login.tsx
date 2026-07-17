import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('KULLANICI ADI VE ŞİFRE ZORUNLUDUR.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      navigate('/dashboard');
    } catch {
      setError('KULLANICI ADI VEYA ŞİFRE HATALI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logos">
          <div className="login-logo-item">
            <img src="/logos/lokum_atolyesi.png" alt="Afyon Lokum Atölyesi"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span>AFYON LOKUM ATÖLYESİ</span>
          </div>
          <div className="login-logo-item">
            <img src="/logos/ogas.png" alt="Ogaş Şekerleme"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span>OGAŞ ŞEKERLEME</span>
          </div>
          <div className="login-logo-item">
            <img src="/logos/yes_investment.png" alt="YES Investment"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span>YES INVESTMENT</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <span className="badge rounded-pill px-3 py-2 mb-3"
            style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
            KURUMSAL GİRİŞ
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            KURUMSAL DEMİRBAŞ VE ZİMMET TAKİP SİSTEMİ
          </h2>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">KULLANICI ADI</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="KULLANICI ADI GİRİN"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">ŞİFRE</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="ŞİFRENİZİ GİRİN"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={loading}
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />GİRİŞ YAPILIYOR...</>
            ) : 'GİRİŞ YAP'}
          </button>
        </form>
      </div>
    </div>
  );
}
