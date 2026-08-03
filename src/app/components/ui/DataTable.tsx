import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Button from '#/app/components/ui/Button'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type DataTableColumn<TRow extends Record<string, unknown>> = {
  key: keyof TRow
  label: string
  sortable?: boolean
  render?: (row: TRow) => string | number | ReactNode
}

export default function DataTable<TRow extends Record<string, unknown>>({
  tableId,
  title,
  rows,
  columns,
  pageSize = 8,
  searchable = true,
  exportFileName = 'srg-table-export.csv',
  multiSelect = false,
  bulkActions = [],
}: {
  tableId?: string
  title?: string
  rows: TRow[]
  columns: Array<DataTableColumn<TRow>>
  pageSize?: number
  searchable?: boolean
  exportFileName?: string
  multiSelect?: boolean
  bulkActions?: Array<{ label: string; onClick: (rows: TRow[]) => void }>
}) {
  const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined' && typeof window.location.search === 'string'
  const stored = isBrowser
    ? WorkspacePreferencesService.getPreferences()
    : {
        filters: {} as Record<string, Record<string, string | boolean | number | undefined>>,
        tablePages: {} as Record<string, number>,
        tableSizes: {} as Record<string, number>,
        visibleColumns: {} as Record<string, string[]>,
      }
  const fallbackColumnKeys = useMemo(() => columns.map((column) => String(column.key)), [columns])
  const storedColumns = tableId ? stored.visibleColumns[tableId] : undefined
  const initialColumns = storedColumns && storedColumns.length > 0
    ? storedColumns.filter((key) => fallbackColumnKeys.includes(key))
    : fallbackColumnKeys

  const [search, setSearch] = useState(() => {
    if (!tableId) return ''
    const persistedFilters = stored.filters[tableId] ?? {}
    const persisted = persistedFilters.search
    return typeof persisted === 'string' ? persisted : ''
  })
  const [page, setPage] = useState(() => (tableId ? stored.tablePages[tableId] ?? 1 : 1))
  const [pageSizeState, setPageSizeState] = useState(() => (tableId ? stored.tableSizes[tableId] ?? pageSize : pageSize))
  const [sortKey, setSortKey] = useState<keyof TRow | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(initialColumns)
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isBrowser || !tableId) return
    WorkspacePreferencesService.setFilters(tableId, { search })
    WorkspacePreferencesService.setTablePage(tableId, page)
    WorkspacePreferencesService.setTableSize(tableId, pageSizeState)
    WorkspacePreferencesService.setVisibleColumns(tableId, visibleColumnKeys)
  }, [isBrowser, tableId, search, page, pageSizeState, visibleColumnKeys])

  const visibleColumns = useMemo(() => {
    const source = visibleColumnKeys.length > 0 ? visibleColumnKeys : fallbackColumnKeys
    return source
      .map((key) => columns.find((column) => String(column.key) === key))
      .filter((column): column is DataTableColumn<TRow> => Boolean(column))
  }, [columns, fallbackColumnKeys, visibleColumnKeys])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (!query) return true
      return columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(query))
    })
  }, [rows, columns, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const direction = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = String(a[sortKey] ?? '')
      const right = String(b[sortKey] ?? '')
      return left.localeCompare(right) * direction
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSizeState))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSizeState, safePage * pageSizeState)

  useEffect(() => {
    setSelectedRows(new Set())
  }, [search, sortKey, sortDir, safePage])

  const toggleSort = (key: keyof TRow) => {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const exportCsv = () => {
    const header = visibleColumns.map((column) => String(column.label))
    const content = sorted.map((row) => visibleColumns.map((column) => String(row[column.key] ?? '')))
    const csv = [header, ...content]
      .map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportFileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const moveColumn = (key: string, direction: -1 | 1) => {
    setVisibleColumnKeys((current) => {
      const index = current.indexOf(key)
      if (index < 0) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return next
    })
  }

  const toggleRowSelection = (index: number) => {
    setSelectedRows((current) => {
      const next = new Set(current)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const selectedRowData = useMemo(() => {
    const items: TRow[] = []
    selectedRows.forEach((index) => {
      if (paged[index]) items.push(paged[index])
    })
    return items
  }, [paged, selectedRows])

  return (
    <section className="srg-state-block">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {title ? <h3 className="srg-h4">{title}</h3> : <span />}
        <div className="flex flex-wrap gap-2">
          {searchable ? (
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search table"
              className="max-w-48"
            />
          ) : null}
          <select
            value={pageSizeState}
            onChange={(event) => {
              setPageSizeState(Number(event.target.value))
              setPage(1)
            }}
            className="w-auto"
            aria-label="Rows per page"
          >
            {[8, 12, 20, 40].map((size) => <option key={size} value={size}>{size}/page</option>)}
          </select>
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setColumnMenuOpen((current) => !current)}>
              Columns
            </Button>
            {columnMenuOpen ? (
              <div className="absolute right-0 z-20 mt-2 min-w-56 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 shadow-[var(--srg-shadow-lg)]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Visible columns</p>
                <div className="space-y-1">
                  {fallbackColumnKeys.map((columnKey) => {
                    const checked = visibleColumnKeys.includes(columnKey)
                    const position = visibleColumnKeys.indexOf(columnKey)
                    return (
                      <div key={columnKey} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 hover:bg-[var(--srg-hover)]">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setVisibleColumnKeys((current) => {
                                if (current.includes(columnKey)) {
                                  if (current.length <= 1) return current
                                  return current.filter((item) => item !== columnKey)
                                }
                                return [...current, columnKey]
                              })
                            }}
                          />
                          <span>{columns.find((column) => String(column.key) === columnKey)?.label ?? columnKey}</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <button type="button" className="rounded-lg border border-[var(--srg-border)] px-1.5 py-0.5 text-[10px]" disabled={position <= 0} onClick={() => moveColumn(columnKey, -1)}>↑</button>
                          <button type="button" className="rounded-lg border border-[var(--srg-border)] px-1.5 py-0.5 text-[10px]" disabled={position < 0 || position >= visibleColumnKeys.length - 1} onClick={() => moveColumn(columnKey, 1)}>↓</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <Button variant="secondary" size="sm" onClick={exportCsv}>Export CSV</Button>
        </div>
      </header>

      {multiSelect && bulkActions.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-2">
          <span className="text-xs text-[var(--srg-text-muted)]">{selectedRows.size} selected</span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              disabled={selectedRows.size === 0}
              onClick={() => action.onClick(selectedRowData)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="srg-table-wrap">
        <table className="srg-table">
          <thead>
            <tr>
              {multiSelect ? <th className="w-10">Select</th> : null}
              {visibleColumns.map((column) => (
                <th key={String(column.key)}>
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 bg-transparent p-0 font-inherit text-inherit"
                    >
                      <span>{column.label}</span>
                      {sortKey === column.key ? <span aria-hidden>{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
                    </button>
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (multiSelect ? 1 : 0)} className="text-center text-sm text-[var(--srg-text-muted)]">No rows</td>
              </tr>
            ) : paged.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {multiSelect ? (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRowSelection(rowIndex)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                ) : null}
                {visibleColumns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-3 flex items-center justify-between text-xs text-[var(--srg-text-muted)]">
        <span>{sorted.length} row(s)</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1}>Prev</Button>
          <span>Page {safePage}/{totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages}>Next</Button>
        </div>
      </footer>
    </section>
  )
}
