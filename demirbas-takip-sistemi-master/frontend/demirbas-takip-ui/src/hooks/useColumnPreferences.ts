import { useState, useEffect, useCallback } from 'react';
import type { ColumnDefinition, ColumnState, ColumnPreferences } from '../types/columns';

const PREFIX = 'columnPrefs_';

function buildDefault(defs: ColumnDefinition[]): ColumnState[] {
  return defs.map(d => ({
    key: d.key,
    visible: d.defaultVisible,
    width: d.defaultWidth,
    order: d.defaultOrder,
  }));
}

export function useColumnPreferences(pageName: string, defaultColumns: ColumnDefinition[]) {
  const storageKey = PREFIX + pageName;

  const loadPreferences = useCallback((): ColumnState[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return buildDefault(defaultColumns);
      const prefs: ColumnPreferences = JSON.parse(raw);
      const saved = prefs.columns;
      return defaultColumns.map(col => {
        const existing = saved.find(s => s.key === col.key);
        return existing ?? { key: col.key, visible: col.defaultVisible, width: col.defaultWidth, order: col.defaultOrder };
      });
    } catch {
      return buildDefault(defaultColumns);
    }
  }, [storageKey, defaultColumns]);

  const [columnStates, setColumnStates] = useState<ColumnState[]>(loadPreferences);

  useEffect(() => {
    setColumnStates(loadPreferences());
  }, [loadPreferences]);

  const savePreferences = useCallback((newStates: ColumnState[]) => {
    const prefs: ColumnPreferences = { pageName, columns: newStates, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(prefs));
    setColumnStates(newStates);
  }, [pageName, storageKey]);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(storageKey);
    setColumnStates(buildDefault(defaultColumns));
  }, [storageKey, defaultColumns]);

  const visibleColumns = columnStates
    .filter(c => c.visible)
    .sort((a, b) => a.order - b.order)
    .map(state => {
      const def = defaultColumns.find(d => d.key === state.key)!;
      return { ...def, ...state };
    });

  return { columnStates, visibleColumns, savePreferences, resetToDefaults };
}
