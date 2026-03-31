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
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider text-left"
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                    {row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-6 py-4 text-sm">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
