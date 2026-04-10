import React from 'react';

interface TableProps {
  columns: { key: string; label: string; width?: string }[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  actions,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-180">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600"
              >
                {col.label}
              </th>
            ))}
            {actions ? <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-14 text-center text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Loading data...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-14 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 transition-colors duration-200 hover:bg-blue-50/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-900">
                    {row[col.key]}
                  </td>
                ))}
                {actions ? <td className="px-6 py-4 text-sm">{actions(row)}</td> : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
