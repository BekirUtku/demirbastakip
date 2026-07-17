export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
  defaultWidth: number;
  defaultOrder: number;
  minWidth?: number;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'none';
  sticky?: boolean;
  renderType?: 'text' | 'badge' | 'date' | 'datetime' | 'barcode' | 'actions' | 'custom';
  isDynamic?: boolean;
  questionText?: string;
}

export interface ColumnState {
  key: string;
  visible: boolean;
  width: number;
  order: number;
}

export interface ColumnPreferences {
  pageName: string;
  columns: ColumnState[];
  updatedAt: string;
}
