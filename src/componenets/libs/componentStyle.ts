import type { CSSProperties } from 'react'

export interface ComponentStyle {
  padding?: CSSProperties['padding']
  margin?: CSSProperties['margin']
  font_size?: CSSProperties['fontSize']
  front_size?: CSSProperties['fontSize']
  color?: CSSProperties['color']
  border?: CSSProperties['border']
  boarder?: CSSProperties['border']
}

export function componentStyle(style: ComponentStyle = {}): CSSProperties {
  return {
    padding: style.padding,
    margin: style.margin,
    fontSize: style.font_size ?? style.front_size,
    color: style.color,
    border: style.border ?? style.boarder,
  }
}
