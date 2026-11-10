import type { CSSProperties } from 'react'

export interface GridPosition {
  colno?: number
  rowno?: number
  colspan?: number
  rowspan?: number
}

function checkAxis(name: string, start: number | undefined, span: number, size: number | undefined) {
  if (start !== undefined && (!Number.isInteger(start) || start < 0)) {
    throw new Error(`Grid ${name}no must be an integer >= 0`)
  }
  if (!Number.isInteger(span) || span < 1) {
    throw new Error(`Grid ${name}span must be an integer >= 1`)
  }
  if (size !== undefined && (start ?? 0) + span > size) {
    throw new Error(`Grid cell at ${name}no ${start ?? 0} (span ${span}) exceeds ${size} ${name}s`)
  }
}

function line(start: number | undefined, span: number): string | undefined {
  if (start === undefined) return span > 1 ? `span ${span}` : undefined
  return `${start + 1} / span ${span}`
}

// Validates every cell and returns its CSS placement; cells without
// colno/rowno are auto-placed by the browser.
export function gridCellStyles(
  positions: GridPosition[],
  columns: number,
  rows?: number,
): CSSProperties[] {
  if (!Number.isInteger(columns) || columns < 1) {
    throw new Error('Grid columns must be an integer >= 1')
  }
  if (rows !== undefined && (!Number.isInteger(rows) || rows < 1)) {
    throw new Error('Grid rows must be an integer >= 1')
  }

  const occupied = new Set<string>()
  return positions.map((position) => {
    const colspan = position.colspan ?? 1
    const rowspan = position.rowspan ?? 1
    checkAxis('col', position.colno, colspan, columns)
    checkAxis('row', position.rowno, rowspan, rows)

    if (position.colno !== undefined && position.rowno !== undefined) {
      for (let col = position.colno; col < position.colno + colspan; col++) {
        for (let row = position.rowno; row < position.rowno + rowspan; row++) {
          const cell = `${col},${row}`
          if (occupied.has(cell)) {
            throw new Error(`Grid cell (colno ${col}, rowno ${row}) is used by more than one control`)
          }
          occupied.add(cell)
        }
      }
    }

    return {
      gridColumn: line(position.colno, colspan),
      gridRow: line(position.rowno, rowspan),
    }
  })
}
