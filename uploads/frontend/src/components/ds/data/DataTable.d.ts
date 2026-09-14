import * as React from 'react';

export interface DataTableColumn {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** Render numeric/ID columns in monospace. */
  mono?: boolean;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: any[];
  rowKey?: string;
  selectable?: boolean;
  selected?: (string | number)[];
  onSelect?: (keys: (string | number)[]) => void;
  onRowClick?: (row: any) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyLabel?: string;
  style?: React.CSSProperties;
  /** Render only the visible row window for long lists. */
  virtualize?: boolean;
  virtualThreshold?: number;
  virtualRowHeight?: number;
  virtualOverscan?: number;
  scrollHeight?: number;
  /**
   * Optional inline row expansion. When `renderExpandedRow` is provided, every
   * row whose key is in `expandedRowKeys` is followed by an extra `<tr>` that
   * spans all columns and renders `renderExpandedRow(row)`. Tables that do not
   * pass `renderExpandedRow` are rendered exactly as before.
   */
  renderExpandedRow?: (row: any) => React.ReactNode;
  expandedRowKeys?: (string | number)[];
}

/**
 * Operational data table with sortable headers, selection, custom cell render.
 * @startingPoint section="Data" subtitle="Sortable, selectable data table" viewport="900x360"
 */
export function DataTable(props: DataTableProps): JSX.Element;
