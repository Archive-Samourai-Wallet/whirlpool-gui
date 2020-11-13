import React from 'react';
import BTable from 'react-bootstrap/Table';
import { usePagination, useSortBy, useTable } from 'react-table';

export default function TableGeneric({ columns, data, size='sm', /*onFetchData, pageIndex, pageSize, filters, */sortBy, getRowStyle=()=>{}, getRowClassName=()=>{} }) {
  if (!data) {
    return
  }

  const initialState = {};
  if (sortBy) {
    initialState.sortBy = sortBy;
  }
  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState,
    },
    useSortBy,
  );

  // When these table states change, fetch new data!
  /*React.useEffect(() => {
    onFetchData({ pageIndex, pageSize, sortBy, filters })
  }, [onFetchData, pageIndex, pageSize, sortBy, filters])*/

  // Render the UI for your table
  return (
    <BTable hover size={size} {...getTableProps()}>
      <thead>
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render('Header')}
              <span>
                  {column.isSorted ? (column.isSortedDesc ? '▼' : '▲') : ''}
                </span>
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody>
      {rows.map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps({
            style: getRowStyle(row),
            className:getRowClassName(row)
          })}>
            {row.cells.map(cell => (
              <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
            ))}
          </tr>
        );
      })}
      </tbody>
    </BTable>
  );
}
