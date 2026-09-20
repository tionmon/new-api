/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { GripVertical } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { TruncatedCell } from '../core/truncated-cell'
import { staticDataTableClassNames } from './static-data-table-classnames'

/**
 * Pointer-driven row reordering: rows follow the cursor and the rest animate into
 * place as you drag. Opt-in per table — omit it and rows behave exactly as before.
 * It is pointer-based (motion's Reorder), not the browser's native drag-and-drop,
 * because native DnD only moves a small drag image and never the row itself.
 */
type StaticDataTableReorder = {
  /** Row keys in display order; must be what `getRowKey` returns for the same rows. */
  values: React.Key[]
  /** Called once on drop with the new order. */
  onReorder: (values: React.Key[]) => void
  /** Accessible name for the grip, already translated by the caller. */
  handleLabel?: string
}

type StaticDataTableBaseProps = {
  className?: string
  tableClassName?: string
  containerProps?: Omit<React.ComponentProps<'div'>, 'className' | 'children'>
  tableProps?: Omit<
    React.ComponentProps<typeof Table>,
    'className' | 'children'
  >
}

type StaticDataTableDataProps<TData = unknown> = StaticDataTableBaseProps & {
  columns: StaticDataTableColumn<TData>[]
  data: TData[]
  getRowKey?: (row: TData, index: number) => React.Key
  getRowClassName?: (row: TData, index: number) => string | undefined
  renderRow?: (row: TData, index: number) => React.ReactNode
  reorder?: StaticDataTableReorder
  empty?: boolean
  emptyContent?: React.ReactNode
  emptyClassName?: string
  headerRowClassName?: string
}

type StaticDataTableChildrenProps = StaticDataTableBaseProps & {
  children: React.ReactNode
  columns?: never
  data?: never
  reorder?: never
}

type StaticDataTableProps<TData = unknown> =
  | StaticDataTableDataProps<TData>
  | StaticDataTableChildrenProps

export type StaticDataTableColumn<TData = unknown> = {
  id: string
  header: React.ReactNode
  className?: string
  cellClassName?: string | ((row: TData, index: number) => string | undefined)
  cell?: (row: TData, index: number) => React.ReactNode
  /**
   * When the table has `reorder`, a grip that starts the drag is rendered at the
   * start of this column's cells. Use it rather than an `onDragStart` handler: the
   * grip is what keeps the rest of the row (inputs, selects) interactive.
   */
  dragHandle?: boolean
}

export function StaticDataTable<TData = unknown>(
  props: StaticDataTableProps<TData>
) {
  const { className, tableClassName, containerProps, tableProps } = props

  return (
    <div
      className={cn(staticDataTableClassNames.container, className)}
      {...containerProps}
    >
      <Table className={tableClassName} {...tableProps}>
        {props.columns !== undefined ? (
          <StaticDataTableWithColumns {...props} />
        ) : (
          props.children
        )}
      </Table>
    </div>
  )
}

function StaticDataTableWithColumns<TData>({
  columns,
  data,
  getRowKey,
  getRowClassName,
  renderRow,
  reorder,
  empty,
  emptyContent,
  emptyClassName,
  headerRowClassName,
}: StaticDataTableDataProps<TData>) {
  const isEmpty = empty ?? (data !== undefined && data.length === 0)
  const bodyRows = data.map((row, index) => (
    <StaticDataTableRow
      key={getRowKey?.(row, index) ?? index}
      row={row}
      index={index}
      columns={columns}
      getRowClassName={getRowClassName}
      renderRow={renderRow}
      reorder={reorder}
      value={getRowKey?.(row, index) ?? index}
    />
  ))

  return (
    <>
      <TableHeader>
        <TableRow className={headerRowClassName}>
          {columns.map((column) => (
            <TableHead key={column.id} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      {reorder && !isEmpty ? (
        <Reorder.Group
          as='tbody'
          axis='y'
          values={reorder.values}
          onReorder={reorder.onReorder}
          // Mirrors TableBody so the reorderable body looks identical to every other
          // table in the app.
          className='[&_tr:last-child]:border-0 [&>tr]:h-15'
        >
          {bodyRows}
        </Reorder.Group>
      ) : (
        <TableBody>
          {isEmpty ? (
            <StaticDataTableEmptyRow
              colSpan={columns.length}
              className={emptyClassName}
            >
              {emptyContent}
            </StaticDataTableEmptyRow>
          ) : (
            bodyRows
          )}
        </TableBody>
      )}
    </>
  )
}

type StaticDataTableRowProps<TData> = Required<
  Pick<StaticDataTableDataProps<TData>, 'columns'>
> &
  Pick<
    StaticDataTableDataProps<TData>,
    'getRowClassName' | 'renderRow' | 'reorder'
  > & {
    row: TData
    index: number
    value: React.Key
  }

function StaticDataTableRow<TData>({
  row,
  index,
  columns,
  getRowClassName,
  renderRow,
  reorder,
  value,
}: StaticDataTableRowProps<TData>) {
  // Unconditional on purpose: a hook cannot be called only when reordering is on,
  // and the control itself is inert unless the grip starts a drag.
  const dragControls = useDragControls()

  if (renderRow) {
    return <>{renderRow(row, index)}</>
  }

  const cells = columns.map((column) => (
    <TableCell
      key={column.id}
      className={cn(
        'max-w-full min-w-0 overflow-hidden',
        getStaticCellClassName(column, row, index)
      )}
    >
      {column.dragHandle && reorder ? (
        <DragHandle controls={dragControls} label={reorder.handleLabel} />
      ) : null}
      {renderStaticCellContent(column, row, index)}
    </TableCell>
  ))

  if (reorder) {
    return (
      <Reorder.Item
        as='tr'
        value={value}
        dragListener={false}
        dragControls={dragControls}
        className={cn(
          'bg-background relative [&>td]:align-middle',
          getRowClassName?.(row, index)
        )}
      >
        {cells}
      </Reorder.Item>
    )
  }

  return <TableRow className={getRowClassName?.(row, index)}>{cells}</TableRow>
}

/**
 * The grip that starts a row drag. Rendered by the table (not the caller) so the
 * motion drag controls stay inside the row they move.
 */
function DragHandle({
  controls,
  label,
}: {
  controls: ReturnType<typeof useDragControls>
  label?: string
}) {
  return (
    <span
      aria-hidden='true'
      title={label}
      // The pointer must not reach the row's own handlers, or starting a drag would
      // also focus/activate whatever sits underneath the grip.
      onPointerDown={(event) => {
        event.stopPropagation()
        controls.start(event)
      }}
      className='text-muted-foreground hover:text-foreground mr-1 inline-flex cursor-grab touch-none align-middle active:cursor-grabbing'
    >
      <GripVertical className='h-4 w-4' />
    </span>
  )
}

function renderStaticCellContent<TData>(
  column: StaticDataTableColumn<TData>,
  row: TData,
  index: number
) {
  const content = column.cell?.(row, index)
  const textContent = getPrimitiveTextContent(content)

  if (!textContent) return content

  return <TruncatedCell tooltipContent={textContent}>{content}</TruncatedCell>
}

function getPrimitiveTextContent(content: React.ReactNode): string | null {
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content)
  }

  if (
    React.isValidElement<{ children?: React.ReactNode }>(content) &&
    (typeof content.props.children === 'string' ||
      typeof content.props.children === 'number')
  ) {
    return String(content.props.children)
  }

  return null
}

function getStaticCellClassName<TData>(
  column: StaticDataTableColumn<TData>,
  row: TData,
  index: number
) {
  return typeof column.cellClassName === 'function'
    ? column.cellClassName(row, index)
    : column.cellClassName
}

type StaticDataTableEmptyRowProps = {
  colSpan: number
  children: React.ReactNode
  className?: string
}

function StaticDataTableEmptyRow({
  colSpan,
  children,
  className,
}: StaticDataTableEmptyRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn('h-24 text-center', className)}
      >
        {children}
      </TableCell>
    </TableRow>
  )
}
