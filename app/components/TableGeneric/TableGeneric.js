import React from 'react';
import BTable from 'react-bootstrap/Table';
import Pagination from '@vlsergey/react-bootstrap-pagination';
import { useRowSelect, useSortBy, useTable, usePagination } from 'react-table';
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

export default function TableGeneric({ columns, data, size='sm', /*onFetchData, pageIndex, pageSize, filters, */sortBy, getRowStyle=()=>{}, getRowClassName=()=>{}, onSelect=undefined, className=undefined }) {
  if (!data) {
    return
  }

  const initialState = {};
  if (sortBy) {
    initialState.sortBy = sortBy;
  }
  initialState.currentPage = 0

  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, headerGroups, prepareRow, selectedFlatRows, state: { selectedRowIds, pageIndex, pageSize },
    rows,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    {
      columns,
      data,
      initialState,
      autoResetPage: false,
      autoResetExpanded: false,
      autoResetGroupBy: false,
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetRowState: false,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    hooks => {
      if (onSelect && onSelect.actions) {
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
    },
  );

  // When these table states change, fetch new data!
  /*React.useEffect(() => {
    onFetchData({ pageIndex, pageSize, sortBy, filters })
  }, [onFetchData, pageIndex, pageSize, sortBy, filters])*/


  const rowsOriginal = rows.map(d => d.original)

  const selectedItems = selectedFlatRows.length>0 ? selectedFlatRows.map(
    d => d.original
  ) : undefined

  const onSelectActions = selectedItems ? onSelect.actions(selectedItems) : []

  // pagination
  const totalPages = Math.ceil(rows.length / pageSize)
  //console.log('pageSize='+pageSize+', pageIndex='+pageIndex+', totalPages='+totalPages)
  const paginationOnChange = o => {
    if (o && o.target && o.target.name === 'page') {
      gotoPage(o.target.value)
    }
  }
  const PAGE_SIZE = 50
  React.useEffect(() => {
    if (pageSize != PAGE_SIZE) {
      setPageSize(PAGE_SIZE)
    }
  }, [pageSize])

  // Render the UI for your table
  return (
    <div className='table-generic'>
      {onSelect && <div className='select-actions text-muted'>
        {!selectedItems && <span>
          {rowsOriginal.length} {onSelect.label} {onSelect.labelDetails? onSelect.labelDetails(rowsOriginal):''}
        </span>}
        {selectedItems && <span>
          {selectedItems.length} {onSelect.label} {onSelect.labelDetails? onSelect.labelDetails(selectedItems):''} selected{' '}
          {onSelectActions.length>0 && <span>
            <Icon.ArrowRight size={12}/> {onSelect.actions(selectedItems).map((action,i) => <span key={i}>{action}</span>)}
          </span>}
        </span>}
      </div>}
      <BTable hover size={size} {...getTableProps()} className={className}>
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
        {page.map((row, i) => {
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

      {totalPages>1 && <div className='text-center'>
        <Pagination value={pageIndex} totalPages={totalPages} onChange={paginationOnChange}/>
      </div>}
    </div>
  );
}
