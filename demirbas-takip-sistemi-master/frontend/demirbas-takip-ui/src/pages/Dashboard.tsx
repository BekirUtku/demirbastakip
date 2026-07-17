import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Loader from '../components/common/Loader';
import api from '../services/api';
import type { DashboardSummary } from '../types';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  onClick?: () => void;
}

function StatCard({ label, value, icon, color, onClick }: StatCardProps) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardSummary>('/dashboard/summary')
      .then(r => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Kontrol Paneli" /><Loader /></>;

  if (!summary) return <><Header title="Kontrol Paneli" /><div className="main-content">Veri yüklenemedi.</div></>;

  return (
    <>
      <Header title="Kontrol Paneli" subtitle="Sistem Özeti" />
      <div className="main-content">
        <div className="row g-3 mb-4">
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="TOPLAM DEMİRBAŞ"
              value={summary.totalAssets}
              icon="🖥️"
              color="var(--info)"
              onClick={() => navigate('/assets')}
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="ZİMMETLİ ÜRÜNLER"
              value={summary.assignedAssets}
              icon="📋"
              color="var(--warning)"
              onClick={() => navigate('/assets?status=1')}
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="BOŞTAKİ ÜRÜNLER"
              value={summary.availableAssets}
              icon="✅"
              color="var(--success)"
              onClick={() => navigate('/assets?status=0')}
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="TOPLAM PERSONEL"
              value={summary.totalPersonnel}
              icon="👥"
              color="var(--primary)"
              onClick={() => navigate('/personnel')}
            />
          </div>
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="KATEGORİ SAYISI"
              value={summary.categoryCount}
              icon="📂"
              color="#8b5cf6"
              onClick={() => navigate('/categories')}
            />
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-card">
              <h6 style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                📊 ZİMMET DURUMU
              </h6>
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span>ZİMMETLİ</span>
                    <span style={{ fontWeight: 700 }}>{summary.assignedAssets} / {summary.totalAssets}</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar" style={{
                      width: summary.totalAssets > 0 ? `${(summary.assignedAssets / summary.totalAssets) * 100}%` : '0%',
                      background: 'var(--warning)'
                    }} />
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span>BOŞTAKİ</span>
                    <span style={{ fontWeight: 700 }}>{summary.availableAssets} / {summary.totalAssets}</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar" style={{
                      width: summary.totalAssets > 0 ? `${(summary.availableAssets / summary.totalAssets) * 100}%` : '0%',
                      background: 'var(--success)'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-card">
              <h6 style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                👥 PERSONEL DURUMU
              </h6>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{summary.activePersonnel}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>AKTİF</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#94a3b8' }}>{summary.totalPersonnel - summary.activePersonnel}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PASİF</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--danger)' }}>{summary.activeAssignments}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>AKTİF ZİMMET</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
