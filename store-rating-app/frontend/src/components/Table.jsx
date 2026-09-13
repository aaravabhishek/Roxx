import React from 'react';

// columns: [{ key, label, sortable }]
// sort: { sortBy, order } ; onSort(key)
export default function Table({ columns, rows, sort, onSort, renderRow }) {
  function handleHeaderClick(col) {
    if (col.sortable && onSort) onSort(col.key);
  }

  function arrow(col) {
    if (!sort || sort.sortBy !== col.key) return '';
    return sort.order === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => handleHeaderClick(col)}
              >
                {col.label}
                {col.sortable ? arrow(col) : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((row) => renderRow(row))}</tbody>
      </table>
    </div>
  );
}
