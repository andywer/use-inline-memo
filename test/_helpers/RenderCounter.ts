import * as React from "react"

interface Counter {
  count: number
}

interface Props {
  children?: React.ReactNode
  counter: Counter
}

function RenderCounter(props: Props) {
  props.counter.count++
  return props.children
}

export default RenderCounter as React.ComponentType<Props>
