export interface CellData {
  value: string;
}

export interface RowData {
  id: string;
  /** First column is always treated as the "name" column for voice matching */
  cells: CellData[];
}

export interface ColumnDef {
  id: string;
  name: string;
}

export interface Sheet {
  id: string;
  name: string;
  columns: ColumnDef[];
  rows: RowData[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  voiceLanguage: string;
  autoApply: boolean;
  confirmationMode: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: AppSettings = {
  voiceLanguage: 'en-US',
  autoApply: false,
  confirmationMode: true,
  theme: 'system',
};
