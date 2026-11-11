import type { CSSProperties, ReactNode } from 'react'
import Component from '../../Component'
import type { ComponentProps } from '../../Component'
import { gridCellStyles } from '../../libs/gridLayout'
import type { GridPosition } from '../../libs/gridLayout'

export interface GridCell extends GridPosition {
  key: string
  node: ReactNode
}

interface GridProps extends Omit<ComponentProps, 'children'> {
  columns: number
  rows?: number
  gap?: number
  cells: GridCell[]
}

// Each cell declares its own colno/rowno; the grid turns them into placement.
export default function Grid({ columns, rows, gap = 3, cells, ...props }: GridProps) {
  const placements = gridCellStyles(cells, columns, rows)
  const template: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: rows === undefined ? undefined : `repeat(${rows}, auto)`,
  }

  return (
    <Component {...props}>
      <div className={`gap-${gap}`} style={template}>
        {cells.map((cell, index) => (
          <div key={cell.key} style={placements[index]}>{cell.node}</div>
        ))}
      </div>
    </Component>
  )
}
