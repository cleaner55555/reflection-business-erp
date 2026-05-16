declare module 'react-grid-layout' {
  import { Component, ReactNode, CSSProperties } from 'react'

  export interface LayoutItem {
    i: string
    x: number
    y: number
    w: number
    h: number
    minW?: number
    maxW?: number
    minH?: number
    maxH?: number
    static?: boolean
    isDraggable?: boolean
    isResizable?: boolean
    isBounded?: boolean
    moved?: boolean
  }

  export type Layout = LayoutItem[]

  export interface Props {
    className?: string
    style?: CSSProperties
    width: number
    autoSize?: boolean
    cols?: number
    draggableHandle?: string
    draggableCancel?: string
    isDraggable?: boolean
    isResizable?: boolean
    isBounded?: boolean
    compactType?: 'vertical' | 'horizontal' | null
    margin?: [number, number]
    containerPadding?: [number, number] | null
    rowHeight?: number
    maxRows?: number
    layout?: Layout
    layouts?: Record<string, Layout>
    breakpoints?: Record<string, number>
    onLayoutChange?: (layout: Layout, allLayouts?: Record<string, Layout>) => void
    onDragStart?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    onDrag?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    onDragEnd?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    onResizeStart?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    onResize?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    onResizeEnd?: (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, event: MouseEvent, element: HTMLElement) => void
    useCSSTransforms?: boolean
    transformScale?: number
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>
    children?: ReactNode
    [key: string]: any
  }

  export class ReactGridLayout extends Component<Props> {}

  export interface WidthProviderProps {
    measureBeforeMount?: boolean
  }

  export function WidthProvider(component: typeof ReactGridLayout | any): any
  export default ReactGridLayout
}
