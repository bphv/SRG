import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Button from '#/app/components/ui/Button'

export type DataTableColumn<TRow extends Record<string, unknown>> = {
  key: keyof TRow
  label: string
  sortable?: boolean
  render?: (row: TRow) => string | number | ReactNode
}

export default function DataTable<TRow extends Record<string, unknown>>({
  title,
  rows,
  columns,
  pageSize = 8,
  searchable = true,
  exportFileName = 'srg-table-export.csv',
}: {
  title?: string
  rows: TRow[]
  columns: Array<DataTableColumn<TRow>>
  pageSize?: number
  searchable?: boolean
  exportFileName?: string
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof TRow | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key: keyof TRow) => {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const exportCsv = () => {
    const header = columns.map((column) => String(column.label))
    const content = sorted.map((row) => columns.map((column) => String(row[column.key] ?? '')))
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
          <Button variant="secondary" size="sm" onClick={exportCsv}>Export CSV</Button>
        </div>
      </header>

      <div className="srg-table-wrap">
        <table className="srg-table">
          <thead>
            <tr>
              {columns.map((column) => (
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
                <td colSpan={columns.length} className="text-center text-sm text-[var(--srg-text-muted)]">No rows</td>
              </tr>
            ) : paged.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
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
