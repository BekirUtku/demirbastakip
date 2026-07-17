import { useState, useMemo, useEffect, useRef } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  renderRow?: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  renderHeaderPrefix?: () => React.ReactNode;
  onFilteredDataChange?: (data: T[]) => void;
}

function getNestedValue<T>(obj: T, key: string): string {
  const val = (obj as Record<string, unknown>)[key];
  if (val === null || val === undefined) return '';
  return String(val).toLowerCase();
}

export default function FilterableTable<T extends Record<string, unknown>>({
  columns, data, renderRow, emptyMessage = 'KAYIT BULUNAMADI', loading = false,
  renderHeaderPrefix, onFilteredDataChange
}: Props<T>) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(row => {
      return columns.every(col => {
        const filterVal = filters[String(col.key)];
        if (!filterVal || !col.filterable) return true;
        const cellVal = getNestedValue(row, String(col.key));
        return cellVal.includes(filterVal.toLowerCase());
      });
    });
  }, [data, filters, columns]);

  const cbRef = useRef(onFilteredDataChange);
  cbRef.current = onFilteredDataChange;
  useEffect(() => {
    cbRef.current?.(filteredData);
  }, [filteredData]);

  const setFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {renderHeaderPrefix?.()}
            {columns.map(col => (
              <th key={String(col.key)} style={{ width: col.width }}>
                {col.label.toUpperCase()}
              </th>
            ))}
          </tr>
          <tr className="filter-row">
            {renderHeaderPrefix && <td />}
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.filterable ? (
                  col.filterType === 'select' ? (
                    <select
                      value={filters[String(col.key)] || ''}
                      onChange={e => setFilter(String(col.key), e.target.value)}
                      autoComplete="off"
                    >
                      <option value="">TÜMÜ</option>
                      {col.filterOptions?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="FİLTRE..."
                      value={filters[String(col.key)] || ''}
                      onChange={e => setFilter(String(col.key), e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                  )
                ) : null}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderHeaderPrefix ? 1 : 0)} className="text-center text-muted py-4">
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
                  {emptyMessage}
                </span>
              </td>
            </tr>
          ) : (
            filteredData.map((row, index) => (
              renderRow ? renderRow(row, index) : (
                <tr key={index}>
                  {columns.map(col => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row) : String(row[String(col.key)] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            ))
          )}
        </tbody>
      </table>
      <div className="px-3 py-2 bg-light border-top" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        TOPLAM: <strong>{filteredData.length}</strong> KAYIT
        {Array.isArray(data) && filteredData.length !== data.length && (
          <span className="ms-2">(FİLTRELENDİ: {data.length} KAYITTAN)</span>
        )}
      </div>
    </div>
  );
}
