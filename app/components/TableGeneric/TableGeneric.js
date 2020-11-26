import React from 'react';
import BTable from 'react-bootstrap/Table';
import { useRowSelect, useSortBy, useTable } from 'react-table';
import * as Icon from 'react-feather';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)

export default function TableGeneric({ columns, data, size='sm', /*onFetchData, pageIndex, pageSize, filters, */sortBy, getRowStyle=()=>{}, getRowClassName=()=>{}, onSelect=undefined }) {
  if (!data) {
    return
  }

  const initialState = {};
  if (sortBy) {
    initialState.sortBy = sortBy;
  }
  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, headerGroups, rows, prepareRow, selectedFlatRows, state: { selectedRowIds } } = useTable(
    {
      columns,
      data,
      initialState,
    },
    useSortBy,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ])
    }
  );

  // When these table states change, fetch new data!
  /*React.useEffect(() => {
    onFetchData({ pageIndex, pageSize, sortBy, filters })
  }, [onFetchData, pageIndex, pageSize, sortBy, filters])*/

  const selectedItems = selectedFlatRows.length>0 ? selectedFlatRows.map(
    d => d.original
  ) : undefined

  // Render the UI for your table
  return (
    <div className='table-generic'>
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
      {onSelect && selectedItems && <div className='select-actions text-muted'>
        {Object.keys(selectedRowIds).length} {onSelect.label} selected <Icon.ArrowRight size={12}/>{' '}
        {onSelect.actions(selectedItems).map((action,i) => <span key={i}>{action}</span>)}
      </div>}
    </div>
  );
}
