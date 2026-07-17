import { useState } from 'react';
import Header from '../components/layout/Header';
import AssetsReportTab from '../components/reports/AssetsReportTab';
import AssignmentsReportTab from '../components/reports/AssignmentsReportTab';
import PersonnelHistoryTab from '../components/reports/PersonnelHistoryTab';
import CompanySummaryTab from '../components/reports/CompanySummaryTab';
import CategoryStockTab from '../components/reports/CategoryStockTab';
import OverdueAssignmentsTab from '../components/reports/OverdueAssignmentsTab';
import MailLogsTab from '../components/reports/MailLogsTab';
import AuditLogsTab from '../components/reports/AuditLogsTab';

const tabs = [
  { key: 'assets', label: 'DEMİRBAŞ RAPORU' },
  { key: 'assignments', label: 'ZİMMET HAREKETLERİ' },
  { key: 'personnel', label: 'PERSONEL GEÇMİŞİ' },
  { key: 'summary', label: 'FİRMA/DEPT ÖZET' },
  { key: 'stock', label: 'KATEGORİ STOK' },
  { key: 'overdue', label: 'BEKLEYEN İADELER' },
  { key: 'mails', label: 'MAİL LOGLARI' },
  { key: 'audit', label: 'İŞLEM LOGU' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <>
      <Header title="Raporlar" subtitle="Gelişmiş Raporlama ve Analiz" />
      <div className="main-content">
        <div className="page-header">
          <h5 className="page-title">📊 RAPORLAMA MODÜLü</h5>
        </div>

        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '8px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  border: 'none',
                  borderBottom: activeTab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
                  background: 'transparent',
                  color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container" style={{ padding: 20 }}>
          {activeTab === 'assets' && <AssetsReportTab />}
          {activeTab === 'assignments' && <AssignmentsReportTab />}
          {activeTab === 'personnel' && <PersonnelHistoryTab />}
          {activeTab === 'summary' && <CompanySummaryTab />}
          {activeTab === 'stock' && <CategoryStockTab />}
          {activeTab === 'overdue' && <OverdueAssignmentsTab />}
          {activeTab === 'mails' && <MailLogsTab />}
          {activeTab === 'audit' && <AuditLogsTab />}
        </div>
      </div>
    </>
  );
}
