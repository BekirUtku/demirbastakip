import { useState } from 'react';
import api from '../../services/api';
import type { CompanySummaryDto } from '../../types';

export default function CompanySummaryTab() {
  const [data, setData] = useState<CompanySummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<CompanySummaryDto[]>('/reports/company-summary');
      setData(res.data ?? []);
      setLoaded(true);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary btn-sm" onClick={fetchData} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
          {loaded ? 'YENİLE' : 'ÖZET RAPORU YÜKLE'}
        </button>
      </div>

      {data.map(company => (
        <div key={company.companyId} className="border rounded mb-3">
          <div className="p-3 d-flex justify-content-between align-items-center"
            style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{company.companyName.toUpperCase()}</span>
            </div>
            <div className="d-flex gap-3">
              <div className="text-center">
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>{company.activePersonnelCount}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>AKTİF PERSONEL</div>
              </div>
              <div className="text-center">
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--danger)' }}>{company.activeAssignmentCount}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>AKTİF ZİMMET</div>
              </div>
            </div>
          </div>
          {company.departments.length > 0 && (
            <div className="p-2">
              <table className="table table-sm mb-0">
                <thead>
                  <tr style={{ fontSize: 11, fontWeight: 700 }}>
                    <th>DEPARTMAN</th><th className="text-center">PERSONEL</th><th className="text-center">AKTİF ZİMMET</th>
                  </tr>
                </thead>
                <tbody>
                  {company.departments.map(dept => (
                    <tr key={dept.departmentName} style={{ fontSize: 12 }}>
                      <td>{dept.departmentName.toUpperCase()}</td>
                      <td className="text-center">{dept.personnelCount}</td>
                      <td className="text-center">
                        {dept.activeAssignmentCount > 0
                          ? <span className="badge badge-zimmetli" style={{ fontSize: 10 }}>{dept.activeAssignmentCount}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>0</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {loaded && data.length === 0 && (
        <div className="text-center text-muted py-4" style={{ fontSize: 12 }}>AKTİF FİRMA BULUNMUYOR</div>
      )}
    </div>
  );
}
