import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'KONTROL PANELİ', icon: '📊' },
  { path: '/categories', label: 'KATEGORİLER', icon: '📂' },
  { path: '/assets', label: 'DEMİRBAŞLAR', icon: '🖥️' },
  { path: '/personnel', label: 'PERSONELLER', icon: '👥' },
  { path: '/companies', label: 'FİRMALAR', icon: '🏢' },
  { path: '/assignments', label: 'ZİMMETLER', icon: '📋' },
  { path: '/barcode-scanner', label: 'BARKOD OKUT', icon: '🔍' },
  { path: '/reports', label: 'RAPORLAR', icon: '📊' },
  { path: '/email-signatures', label: 'MAIL İMZALARI', icon: '✍️' },
  { path: '/mail-settings', label: 'MAİL AYARLARI', icon: '✉️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
          DEMİRBAŞ TAKİP
        </div>
        <div style={{ fontSize: 10, color: 'var(--sidebar-text)', opacity: 0.7, marginTop: 2 }}>
          KURUMSAL YÖNETİM SİSTEMİ
        </div>
      </div>

      <div className="sidebar-user">
        <span>HOŞGELDİN,</span>
        <div style={{ marginTop: 2, fontSize: 13, color: 'white', fontWeight: 600 }}>
          {user?.fullName?.toUpperCase() ?? user?.username?.toUpperCase() ?? 'KULLANICI'}
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-sm w-100"
          style={{
            background: 'rgba(239,68,68,0.15)',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
          onClick={handleLogout}
        >
          🚪 ÇIKIŞ YAP
        </button>
      </div>
    </div>
  );
}
